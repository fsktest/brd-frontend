import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import LoadingSpinner from "@/components/LoadingSpinner";

const Stories = () => {
  const [input, setInput] = useState("");
  const [storyCount, setStoryCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  //   const handleGenerate = async () => {
  //     setIsLoading(true);
  //     setRawJson("");
  //     setStories([]);
  //     setShowCards(false);
  //     setError("");
  //     controllerRef.current = new AbortController();

  //     try {
  //       const response = await fetch(
  //         `${API_BASE_URL}/generate-jira-story-stream`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ user_input: input, story_count: storyCount }),
  //           signal: controllerRef.current.signal,
  //         }
  //       );

  //       if (!response.body) throw new Error("No response body");

  //       const reader = response.body.getReader();
  //       let jsonString = "";
  //       let done = false;

  //       while (!done) {
  //         const { value, done: doneReading } = await reader.read();
  //         if (value) {
  //           const chunk = new TextDecoder().decode(value);
  //           jsonString += chunk;
  //           setRawJson((prev) => prev + chunk);
  //         }
  //         done = doneReading;
  //       }

  //       try {
  //         // Ensure string ends with `}` before parsing
  //         const sanitized = jsonString.trim();

  //         // Try to parse the cleaned JSON
  //         const parsed = JSON.parse(sanitized);

  //         if (parsed && parsed.user_stories) {
  //           setStories(parsed.user_stories);
  //           setShowCards(true);
  //         } else {
  //           throw new Error("Invalid structure");
  //         }
  //       } catch (e) {
  //         console.error("JSON Parse Error:", e);
  //         setError("Failed to parse generated JSON.");
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const handleGenerate = async () => {
    setIsLoading(true);
    setRawJson("");
    setStories([]);
    setShowCards(false);
    setError("");
    controllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${API_BASE_URL}/generate-jira-story-stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: input, story_count: storyCount }),
          signal: controllerRef.current.signal,
        }
      );

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

      // Fix common streaming issues
      let cleanedJson = jsonString
        .replace(/,\s*([\]}])/g, "$1") // remove trailing commas
        .replace(/(\r\n|\n|\r)/gm, "") // remove line breaks
        .trim();

      // Attempt to fix unclosed array or object
      if (!cleanedJson.endsWith("}")) {
        if (cleanedJson.lastIndexOf("]") > cleanedJson.lastIndexOf("}")) {
          cleanedJson += `, "meta": {"message": "Partial stream"}}`;
        } else {
          cleanedJson += `]}`;
        }
      }

      // Defensive parse
      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("JSON parse failed. Partial response:", cleanedJson);
        throw e;
      }
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Generate Jira User Stories</h2>
        <p className="text-sm text-muted-foreground">
          Enter your requirement and number of stories to generate detailed Jira
          user stories.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="requirement">Requirement</Label>
          <Textarea
            id="requirement"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Build a school management system with modules for students, teachers, etc."
            rows={4}
          />
        </div>

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
            disabled={isLoading || !input.trim()}
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
