import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const IssueModal = ({ issue }: { issue: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Issue</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{issue.fields.summary}</DialogTitle>
          <DialogDescription>
            {issue.fields.description?.content?.[0]?.content?.[0]?.text ||
              "No description available."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Issue Key:</strong> {issue.key}
          </div>
          <div>
            <strong>Status:</strong> {issue.fields.status.name}
          </div>
          <div>
            <strong>Priority:</strong> {issue.fields.priority?.name || "None"}
          </div>
          <div>
            <strong>Assignee:</strong>{" "}
            {issue.fields.assignee?.displayName || "Unassigned"}
          </div>
          <div>
            <strong>Reporter:</strong>{" "}
            {issue.fields.reporter?.displayName || "Unknown"}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {new Date(issue.fields.created).toLocaleString()}
          </div>
          <div>
            <strong>Updated:</strong>{" "}
            {new Date(issue.fields.updated).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueModal;
