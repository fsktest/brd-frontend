import * as XLSX from "xlsx";

type Story = {
  title: string;
  description: string;
  labels: string[];
};

type ParsedStory = {
  application: string;
  stories: Story[];
};

export const parseStoriesFromExcel = async (
  file: File
): Promise<ParsedStory[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const grouped: Record<string, Story[]> = {};

        json.forEach((row: any) => {
          const application = row["Applications"]?.trim() || "Unknown App";
          const title = row["Title"]?.trim();
          const description = row["Link"]?.trim();

          const labels: string[] = [];
          ["Flags", "Note Type", "Implementation Complexity"].forEach((field) => {
            if (row[field]) {
              labels.push(...row[field].split(",").map((v: string) => v.trim()));
            }
          });

          if (!grouped[application]) grouped[application] = [];
          grouped[application].push({ title, description, labels });
        });

        const result: ParsedStory[] = Object.entries(grouped).map(
          ([application, stories]) => ({
            application,
            stories,
          })
        );

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
