import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const DeleteAllProjects = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    const token = sessionStorage.getItem("jiraAccessToken");
    const cloudId = sessionStorage.getItem("cloudid");

    if (!token || !cloudId) {
      toast.error("Authentication Missing", {
        description: "Please connect to Jira before deleting projects.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("cloudId", cloudId);

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/delete-all-projects`, {
        method: "DELETE",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Deletion Failed", {
          description: result.detail || "Unknown error occurred.",
        });
      } else {
        toast.success("Projects Deleted", {
          description: `✅ Deleted: ${result.deleted.length}, ❌ Failed: ${result.failed.length}`,
        });
      }
    } catch (error) {
      toast.error("Network Error", {
        description: error?.message || "Unable to reach server.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-1"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {isDeleting ? "Deleting..." : "Delete All Projects"}
          </span>
          <span className="text-xs text-muted-foreground">
            Dangerous action
          </span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>all your Jira projects</strong>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAll} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAllProjects;
