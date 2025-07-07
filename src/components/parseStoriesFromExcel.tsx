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

const REQUIRED_HEADERS = [
  "Note ID",
  "Link",
  "Title",
  "RAs",
  "Applications",
  "Assignments",
  "All Responsible Assigned",
  "Note Type",
  "Flags",
  "Implementation Complexity",
  "Training Complexity",
  "Undelivered SU Note?",
  "Details",
];

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
        const rawJson = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Normalize headers
        const cleanedData = rawJson.map((row: any) => {
          const cleanRow: any = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim();
            cleanRow[cleanKey] = row[key];
          });
          return cleanRow;
        });

        // Optional: check for missing headers
        const firstRow = cleanedData[0] || {};
        const missingHeaders = REQUIRED_HEADERS.filter(
          (header) => !(header in firstRow)
        );
        if (missingHeaders.length > 0) {
          console.warn("Missing headers:", missingHeaders);
        }

        // Group stories
        const grouped: Record<string, Story[]> = {};

        cleanedData.forEach((row: any) => {
          const application = row["Applications"]?.trim() || "Unknown App";
          const title = row["Title"]?.trim();
          const description = row["Link"]?.trim();

          const labels: string[] = [];
          ["Flags", "Note Type", "Implementation Complexity"].forEach(
            (field) => {
              if (row[field]) {
                labels.push(
                  ...row[field].split(",").map((v: string) => v.trim())
                );
              }
            }
          );

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
        reject("File could not be parsed. Ensure it's a valid CSV/XLSX.");
      }
    };

    reader.onerror = (err) => reject("Failed to read file.");
    reader.readAsArrayBuffer(file);
  });
};
