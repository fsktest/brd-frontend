import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";

const defaultOutput = {
  summary: "",
  description: "",
  acceptance_criteria: [],
  story_points: 0,
  priority: "",
  labels: [],
};

type ChatModalProps = {
  triggerTitle: string;
  onStoryGenerated?: (story: typeof defaultOutput) => void;
};

const ChatModal = ({ triggerTitle, onStoryGenerated }: ChatModalProps) => {
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState<(typeof defaultOutput)[]>([]);
  const [output, setOutput] = useState<(typeof defaultOutput)[]>([]);

  const [showJson, setShowJson] = useState(false);
  const [loading, setLoading] = useState(false);

  // const handleGenerate = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch("http://localhost:4000/generate-stories", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ user_input: input }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Generated data:", data);
  //       setOutput(data.data);

  //       // Notify parent with new story
  //       if (onStoryGenerated) {
  //         onStoryGenerated(data.data);
  //       }
  //     } else {
  //       console.error("Failed to fetch stories");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/generate-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const stories = data.data.user_stories || [];

        console.log("Generated stories:", stories);
        setOutput(stories);

        if (onStoryGenerated) {
          // Call parent handler for each story (if expecting a list)
          stories.forEach((story) => onStoryGenerated(story));
        }

        // Optionally log other metadata
        console.log("Analysis Summary:", data.data.analysis_summary);
        console.log(
          "Technical Considerations:",
          data.data.technical_considerations
        );
        console.log("Estimated Timeline:", data.data.estimated_timeline);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch stories:", errorText);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInput("");
    setOutputs([]);
    setShowJson(false);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>{triggerTitle}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Story Generator</DialogTitle>
          <DialogDescription>
            Chat with our AI agent to generate your stories based on your
            requirements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input
            placeholder="Describe your requirement..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full ring-0 focus:ring-0 focus:outline-none rounded"
          />
          <Button
            onClick={handleGenerate}
            disabled={!input || loading}
            variant="default"
            className="w-full rounded"
          >
            {loading ? "Generating..." : "Generate"}
          </Button>

          {outputs.length > 0 && (
            <div className="space-y-4">
              {outputs.map((story, idx) => (
                <div
                  key={idx}
                  className="border rounded p-4 bg-gray-50 space-y-2 shadow-sm"
                >
                  {!showJson ? (
                    <>
                      <div>
                        <strong>Summary:</strong> {story.summary}
                      </div>
                      <div>
                        <strong>Description:</strong> {story.description}
                      </div>
                      <div>
                        <strong>Acceptance Criteria:</strong>
                        <ul className="list-disc ml-6">
                          {story.acceptance_criteria.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Story Points:</strong> {story.story_points}
                      </div>
                      <div>
                        <strong>Priority:</strong> {story.priority}
                      </div>
                      <div>
                        <strong>Labels:</strong> {story.labels.join(", ")}
                      </div>
                    </>
                  ) : (
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(story, null, 2)}
                    </pre>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJson((j) => !j)}
                className="mt-2"
              >
                {showJson ? "Hide JSON" : "View JSON"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="default">Save</Button>
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={output.length === 0}
            onClick={() => alert("Import to Jira functionality goes here")}
          >
            Import it to your Jira account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
