import { Button } from "./ui/button";
import { Upload, FileText, Download } from "lucide-react";
import UploadProjects from "./UploadProjects";
import DeleteAllProjects from "./DeleteAllProjects";

const UploadCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button type="button" variant="outline" className="h-24 flex-col gap-1">
        <Upload className="h-5 w-5" />
        <span className="text-sm font-medium">Bulk Upload BRD</span>
        <span className="text-xs text-muted-foreground">
          Excel, PDF, CSV, TXT
        </span>
      </Button>

      <UploadProjects />

      <DeleteAllProjects />
    </div>
  );
};

export default UploadCard;
