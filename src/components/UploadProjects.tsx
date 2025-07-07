import React, { useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UploadProjects = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = sessionStorage.getItem("jiraAccessToken");
    const cloudId = sessionStorage.getItem("cloudid");

    if (!token || !cloudId) {
      toast.error("Authentication Missing", {
        description: "Please connect to Jira before uploading projects.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", token);
    formData.append("cloudId", cloudId);

    setIsUploading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/upload-excel-create-project`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error("Upload Failed", {
          description: result.detail || "Unknown server error",
        });
      } else {
        toast.success("Upload Successful", {
          description: `✅ Created: ${result.created.length}, Updated: ${result.updated.length}, Failed: ${result.failed.length}`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Network Error", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsUploading(false);
      event.target.value = ""; // reset input
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, .xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="h-24 flex-col gap-1"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
        <span className="text-sm font-medium">
          {isUploading ? "Uploading..." : "Upload Projects in Bulk"}
        </span>
        <span className="text-xs text-muted-foreground">CSV, XLSX</span>
      </Button>
    </>
  );
};

export default UploadProjects;
