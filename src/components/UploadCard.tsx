import { Button } from "./ui/button";
import { Upload, FileText, Download } from "lucide-react";

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

      <Button type="button" variant="outline" className="h-24 flex-col gap-1">
        <FileText className="h-5 w-5" />
        <span className="text-sm font-medium">Convert Text</span>
        <span className="text-xs text-muted-foreground">
          Paste requirements
        </span>
      </Button>

      <Button type="button" variant="outline" className="h-24 flex-col gap-1">
        <Download className="h-5 w-5" />
        <span className="text-sm font-medium">Sample BRD</span>
        <span className="text-xs text-muted-foreground">Download template</span>
      </Button>
    </div>
  );
};

export default UploadCard;
