import React from "react";
import { Button } from "./ui/button";
import { MdOutlineFileUpload } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { Download, FileText, Upload } from "lucide-react";

const UploadCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button className="h-20 flex-col  py-2" variant="outline">
        <Upload className="h-5 w-5" />
        <span className="text-sm">Bulk Upload BRD</span>
        <span className="text-xs text-muted-foreground">
          Excel, PDF, CSV, TXT
        </span>
      </Button>

      <Button className="h-20 flex-col" variant="outline">
        <FileText className="h-5 w-5" />
        <span className="text-sm">Convert Text</span>
        <span className="text-xs text-muted-foreground">
          Paste requirements
        </span>
      </Button>

      <Button className="h-20 flex-col" variant="outline">
        <Download className="h-5 w-5" />
        <span className="text-sm">Sample BRD</span>
        <span className="text-xs text-muted-foreground">Download template</span>
      </Button>
    </div>
  );
};

export default UploadCard;
