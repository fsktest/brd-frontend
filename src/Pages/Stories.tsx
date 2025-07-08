import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Upload } from "lucide-react";

const Stories = () => {
  const [mode, setMode] = useState<"text" | "document">("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [storyCount, setStoryCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    setRawJson("");
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
          setRawJson((prev) => prev + chunk);
        }
        done = doneReading;
      }

      let cleanedJson = jsonString
        .replace(/,\s*([\]}])/g, "$1")
        .replace(/(\r\n|\n|\r)/gm, "")
        .trim();

      if (!cleanedJson.endsWith("}")) {
        if (cleanedJson.lastIndexOf("]") > cleanedJson.lastIndexOf("}")) {
          cleanedJson += `, "meta": {"message": "Partial stream"}}`;
        } else {
          cleanedJson += `]}`;
        }
      }

      const parsed = JSON.parse(cleanedJson);
      setStories(parsed.user_stories || []);
      setShowCards(true);
    } catch (err: any) {
      console.error("Error while parsing stream:", err);
      setError("Failed to parse generated JSON.");
    } finally {
      setIsLoading(false);
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

        {rawJson && (
          <div className="grid gap-2">
            <Label>Generated JSON</Label>
            <Textarea
              className="bg-muted text-xs h-48 overflow-auto"
              value={rawJson}
              readOnly
            />
          </div>
        )}

        {stories.length > 0 && (
          <div className="flex justify-end">
            <div className="flex items-center space-x-2">
              <Switch
                id="view-toggle"
                checked={showCards}
                onCheckedChange={() => setShowCards((prev) => !prev)}
              />
              <Label htmlFor="view-toggle">Show Cards</Label>
            </div>
          </div>
        )}

        {showCards && stories.length > 0 && (
          <div className="grid gap-4">
            {stories.map((story, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="text-muted-foreground">{story.summary}</p>
                  <p>
                    <strong>Type:</strong> {story.story_type}
                  </p>
                  <p>
                    <strong>Priority:</strong> {story.priority}
                  </p>
                  <p>
                    <strong>Points:</strong> {story.story_points}
                  </p>
                  <p>
                    <strong>Labels:</strong> {(story.labels || []).join(", ")}
                  </p>
                  <p>
                    <strong>Description:</strong> {story.description}
                  </p>
                  <div>
                    <strong>Acceptance Criteria:</strong>
                    <ul className="list-disc ml-6">
                      {(story.acceptance_criteria || []).map(
                        (ac: string, i: number) => (
                          <li key={i}>{ac}</li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
