import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { parseStoriesFromExcel } from "@/components/parseStoriesFromExcel";
import StoryCard from "@/components/StoryCard";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Type Definitions ---
type Story = {
  title: string;
  description?: string;
  [key: string]: any;
};

type Group = {
  application: string;
  stories: Story[];
};

export default function BulkUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isStories, setIsStories] = useState<Group[]>([]);
  const [selectedStories, setSelectedStories] = useState<
    { title: string; group: string }[]
  >([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [storySearch, setStorySearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.length) setSelectedFile(files[0]);
  };

  const handleClick = () => inputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files?.length && setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const parsed = await parseStoriesFromExcel(selectedFile);
      setIsStories(parsed);
    } catch (err) {
      console.error("Failed to parse Excel file:", err);
    }
  };

  const handleStorySelect = (story: Story, group: Group) => {
    const exists = selectedStories.find(
      (s) => s.title === story.title && s.group === group.application
    );
    setSelectedStories((prev) =>
      exists
        ? prev.filter(
            (s) => !(s.title === story.title && s.group === group.application)
          )
        : [...prev, { title: story.title, group: group.application }]
    );
  };

  const isSelected = (story: Story, group: Group) =>
    selectedStories.some(
      (s) => s.title === story.title && s.group === group.application
    );

  const handleSelectAllToggle = () => {
    const filtered = isStories
      .filter(
        (group) =>
          selectedProject === "all" || group.application === selectedProject
      )
      .flatMap((group) =>
        group.stories
          .filter((story) =>
            story.title.toLowerCase().includes(storySearch.toLowerCase())
          )
          .map((story) => ({
            title: story.title,
            group: group.application,
          }))
      );

    const allSelected = filtered.every((story) =>
      selectedStories.some(
        (s) => s.title === story.title && s.group === story.group
      )
    );

    if (allSelected) {
      setSelectedStories((prev) =>
        prev.filter(
          (s) =>
            !filtered.some((f) => f.title === s.title && f.group === s.group)
        )
      );
      setIsSelectAll(false);
    } else {
      const updated = [
        ...selectedStories,
        ...filtered.filter(
          (f) =>
            !selectedStories.some(
              (s) => s.title === f.title && s.group === f.group
            )
        ),
      ];
      setSelectedStories(updated);
      setIsSelectAll(true);
    }
  };

  const importToJira = () => {
    const selected = isStories.flatMap((group) =>
      group.stories
        .filter((story) =>
          selectedStories.some(
            (s) => s.title === story.title && s.group === group.application
          )
        )
        .map((story) => ({
          ...story,
          application: group.application,
        }))
    );
    console.log("Importing to Jira:", selected);
  };

  const filteredProjects = Array.from(
    new Set(isStories.map((s) => s.application))
  ).filter((p) => p.toLowerCase().includes(projectSearch.toLowerCase()));

  return (
    <>
      <Input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`group relative mt-6 border-2 border-dashed rounded-md transition-colors duration-300 ease-in-out cursor-pointer w-full p-6 text-center hover:border-blue-400 hover:bg-blue-50 ${
          dragActive ? "border-blue-500 bg-blue-100" : "border-gray-300"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-blue-100 p-3 group-hover:scale-110 transition-transform duration-300">
            <Upload size={28} className="text-blue-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Click or drag file to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: Excel, PDF, CSV, TXT
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between gap-4 bg-gray-50 px-4 py-2 rounded shadow-sm border w-full max-w-md mx-auto">
          <span className="text-sm text-gray-700 truncate">
            📄 {selectedFile.name}
          </span>
          <Button size="sm" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      )}

      {isStories.length > 0 && (
        <div className="mt-8 w-full">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {/* Project Dropdown */}
            <div className="w-64">
              <Select onValueChange={setSelectedProject} defaultValue="all">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="truncate max-w-full overflow-hidden whitespace-nowrap">
                      <SelectValue
                        placeholder="Select Project"
                        className="truncate"
                      />
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedProject === "all"
                      ? "All Projects"
                      : selectedProject}
                  </TooltipContent>
                </Tooltip>

                <SelectContent className="w-[30rem]">
                  <div className="p-2 sticky top-0 z-10 bg-white">
                    <Input
                      type="text"
                      value={projectSearch}
                      placeholder="Search project..."
                      className="w-full focus:ring-0"
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <SelectItem value="all" className="truncate">
                      All Projects
                    </SelectItem>
                    {filteredProjects.map((project) => (
                      <SelectItem
                        key={project}
                        value={project}
                        className="truncate whitespace-nowrap"
                      >
                        {project}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Story Search */}
            <div className="w-64">
              <Input
                type="text"
                placeholder="Search stories..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
              />
            </div>

            {/* Select All */}
            <Button
              variant="outline"
              className={`flex items-center gap-2 border-2 px-4 py-2 ${
                isSelectAll
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700"
              }`}
              onClick={handleSelectAllToggle}
            >
              <input type="checkbox" checked={isSelectAll} readOnly />
              {isSelectAll ? "Deselect All" : "Select All"}
              <Badge variant="secondary">{selectedStories.length}</Badge>
            </Button>

            {/* Import */}
            <Button
              onClick={importToJira}
              disabled={selectedStories.length === 0}
            >
              Import to Jira
            </Button>
          </div>

          {/* Story Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isStories
              .filter(
                (group) =>
                  selectedProject === "all" ||
                  group.application === selectedProject
              )
              .flatMap((group) =>
                group.stories
                  .filter((story) =>
                    story.title
                      .toLowerCase()
                      .includes(storySearch.toLowerCase())
                  )
                  .map((story) => (
                    <StoryCard
                      key={`${group.application}-${story.title}`}
                      story={story}
                      group={group}
                      selected={isSelected(story, group)}
                      onSelect={handleStorySelect}
                    />
                  ))
              )}
          </div>
        </div>
      )}
    </>
  );
}
