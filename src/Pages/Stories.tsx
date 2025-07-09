import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Upload } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Stories = () => {
  const [mode, setMode] = useState<"text" | "document">("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [storyCount, setStoryCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStories, setSelectedStories] = useState<any[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [storySearch, setStorySearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [CLOUDID, setCLOUDID] = useState<string | null>(null);
  const [jiraAccessToken, setJiraAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jiraAccessToken");
    const cloudid = sessionStorage.getItem("cloudid");

    if (token && cloudid) {
      setCLOUDID(cloudid);
      setJiraAccessToken(token);
    } else {
      console.log("Token expired or invalid");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClick = () => inputRef.current?.click();
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setStories([]);
    setShowCards(false);
    setError("");
    controllerRef.current = new AbortController();

    try {
      let response;

      if (mode === "text") {
        response = await fetch(`${API_BASE_URL}/generate-jira-story-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: input, story_count: storyCount }),
          signal: controllerRef.current.signal,
        });
      } else {
        if (!file) {
          setError("Please upload a document file.");
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("story_count", storyCount.toString());

        response = await fetch(
          `${API_BASE_URL}/generate-jira-story-from-file`,
          {
            method: "POST",
            body: formData,
            signal: controllerRef.current.signal,
          }
        );
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let jsonString = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          jsonString += chunk;
        }
        done = doneReading;
      }

      // Clean and parse JSON
      try {
        const parsed = JSON.parse(jsonString.trim());
        setStories(parsed.user_stories || []);
        setShowCards(true);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        setError("Failed to parse generated stories. Please try again.");
      }
    } catch (err: any) {
      console.error("Error during generation:", err);
      setError("An error occurred while generating stories.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Jira projects after stories are generated
  useEffect(() => {
    if (showCards && stories.length > 0) {
      fetchProjects();
    }
    // eslint-disable-next-line
  }, [showCards, stories]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-projects`, {
        method: "POST",
        headers: {
          cloudid: CLOUDID as string,
          authorization: jiraAccessToken as string,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data?.projects?.length) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  };

  // Story selection logic
  const handleStorySelect = (story: any) => {
    const exists = selectedStories.find((s) => s.title === story.title);
    setSelectedStories((prev) =>
      exists ? prev.filter((s) => s.title !== story.title) : [...prev, story]
    );
  };

  const isSelected = (story: any) =>
    selectedStories.some((s) => s.title === story.title);

  const handleSelectAllToggle = () => {
    const filtered = filteredStories();
    const allSelected = filtered.every((story) =>
      selectedStories.some((s) => s.title === story.title)
    );
    if (allSelected) {
      setSelectedStories((prev) =>
        prev.filter((s) => !filtered.some((f) => f.title === s.title))
      );
      setIsSelectAll(false);
    } else {
      const updated = [
        ...selectedStories,
        ...filtered.filter(
          (f) => !selectedStories.some((s) => s.title === f.title)
        ),
      ];
      setSelectedStories(updated);
      setIsSelectAll(true);
    }
  };

  const filteredProjects = projects.filter((p) =>
    (p.name || "").toLowerCase().includes((projectSearch || "").toLowerCase())
  );

  const filteredStories = () => {
    return stories
      .map((story) =>
        selectedProject === "all"
          ? story
          : { ...story, projectKey: selectedProject }
      )
      .filter((story) =>
        (story.title || "")
          .toLowerCase()
          .includes((storySearch || "").toLowerCase())
      );
  };

  const importToJira = async () => {
    if (!selectedProject || selectedStories.length === 0) return;

    try {
      const payload = {
        flattened_stories: [
          {
            application: selectedProject,
            stories: selectedStories.map((s) => ({
              ...s,
              projectKey: selectedProject, // ensure it's included
            })),
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/create-stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cloudid: CLOUDID,
          Authorization: jiraAccessToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to import stories to Jira.");
      } else {
        setSelectedStories([]);
        alert(
          `${data.total || selectedStories.length} stories imported to Jira!`
        );
      }
    } catch (error) {
      console.error("Import to Jira error:", error);
      setError("Network error during Jira import");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Generate Jira User Stories</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to generate user stories – from a requirement text
          or by uploading a document.
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(val) => setMode(val as "text" | "document")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="text">Text-based</TabsTrigger>
          <TabsTrigger value="document">Document-based</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4">
        {mode === "text" ? (
          <div className="grid gap-2">
            <Label htmlFor="requirement">Requirement</Label>
            <Textarea
              id="requirement"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Build a school management system with attendance, grading, and timetable modules..."
              rows={6}
              className="text-base"
            />
          </div>
        ) : (
          <>
            <Input
              ref={inputRef}
              type="file"
              multiple={false}
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              onClick={handleClick}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`group relative mt-2 border-2 border-dashed rounded-md transition-colors duration-300 ease-in-out cursor-pointer w-full p-6 text-center hover:border-blue-400 hover:bg-blue-50 ${
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
                  Supported: PDF, DOCX, TXT
                </p>
                {file && (
                  <p className="mt-2 text-sm font-semibold">{file.name}</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="story-count">Story Count</Label>
            <Input
              id="story-count"
              type="number"
              value={storyCount}
              min={1}
              max={500}
              onChange={(e) => setStoryCount(Number(e.target.value))}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || (mode === "text" ? !input.trim() : !file)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Generating...
              </>
            ) : (
              "Generate Stories"
            )}
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Only show cards and project selection after generation */}
        {showCards && stories.length > 0 && (
          <div className="mt-8 w-full">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="w-64">
                <Select onValueChange={setSelectedProject} defaultValue="all">
                  <SelectTrigger className="truncate max-w-full overflow-hidden whitespace-nowrap">
                    <SelectValue
                      placeholder="Select Project"
                      className="truncate"
                    />
                  </SelectTrigger>
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
                          key={project.key || project.id}
                          value={project.key}
                          className="truncate whitespace-nowrap"
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-64">
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                />
              </div>

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

              <Button
                onClick={importToJira}
                disabled={
                  selectedStories.length === 0 || selectedProject === "all"
                }
              >
                Import to Jira
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredStories().map((story, idx) => (
                <StoryCard
                  key={story.title + idx}
                  story={story}
                  group={{ application: story.projectKey || selectedProject }}
                  selected={isSelected(story)}
                  onSelect={() => handleStorySelect(story)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
