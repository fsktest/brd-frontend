import { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface Story {
  title: string;
  description?: string;
  labels?: string[];
}

interface Group {
  application: string;
}

interface Props {
  story: Story;
  group: Group;
  selected: boolean;
  onSelect: (story: Story, group: Group) => void;
}

const StoryCard = ({ story, group, selected, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCheckboxToggle = () => onSelect(story, group);

  return (
    <>
      <Card className="relative border px-4 py-3 hover:shadow-md transition-all">
        {/* Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox checked={selected} onCheckedChange={handleCheckboxToggle} />
        </div>

        {/* Card Header */}
        <CardHeader className="p-0 pl-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <h3
                className="font-semibold text-sm line-clamp-1 cursor-pointer"
                onClick={() => setOpen(true)}
              >
                {story.title}
              </h3>
            </div>
            <div className="text-muted-foreground text-sm font-medium">⋯</div>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="p-0 pl-6 mt-1">
          <p className="text-xs text-muted-foreground line-clamp-1">
            {story.description || "No summary provided."}
          </p>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <Checkbox
              checked={selected}
              onCheckedChange={handleCheckboxToggle}
            />
            <DialogTitle className="text-sm font-medium mt-2">
              {story.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {group.application}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold">Description</h4>
              {story.description?.startsWith("http") ? (
                <Link
                  to={story.description}
                  target="_blank"
                  className="text-blue-600 break-words"
                >
                  {story.description}
                </Link>
              ) : (
                <p className="text-sm text-gray-700 break-words">
                  {story.description || "No description provided."}
                </p>
              )}
            </div>

            {/* Labels Section */}
            {story.labels?.length ? (
              <div>
                <h4 className="text-sm font-semibold">Labels</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {story.labels.map((label) => (
                    <Badge key={label}>{label}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryCard;
