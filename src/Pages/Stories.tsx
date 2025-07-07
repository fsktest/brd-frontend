import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { set } from "zod";

const Stories = () => {
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [stories, setStories] = useState([]);
  const [issueLoading, setIssueLoading] = useState(false);

  console.log("Stories component rendered", stories);

  const handleCreateIssue = async (story) => {
    setIssueLoading(true);
    const token = sessionStorage.getItem("jiraAccessToken");

    if (!token) {
      alert("Jira access token is missing. Please authenticate.");
      return;
    }

    // Safety: check summary is present
    if (!story.summary || story.summary.trim() === "") {
      alert("Cannot create issue: Summary is missing.");
      return;
    }

    const payload = {
      summary: story.summary,
      description: story.description,
      issueType: "Story",
      projectKey: "HPOC",
      labels: story.labels || [],
      acceptance_criteria: story.acceptance_criteria || [],
    };

    try {
      const response = await fetch("http://localhost:4000/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        console.error("Non-JSON response from server:", text);
        alert("Server returned non-JSON response. Check backend logs.");
        return;
      }

      if (response.ok) {
        console.log("✅ Jira issue created:", data.issue.key);
        alert(`Jira Issue ${data.issue.key} created successfully!`);
      } else {
        console.error("❌ Jira API error:", data);
        alert(`Failed to create Jira issue: ${JSON.stringify(data.error)}`);
      }
    } catch (error) {
      console.error("⚠️ Network or Server Error:", error);
      alert("Network error occurred while creating Jira issue.");
    } finally {
      setIssueLoading(false);
      setSelectedStory(null); // Close the dialog after creating the issue
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-medium">Your Stories</h1>

      <div className="my-4">
        <ChatModal
          triggerTitle="Generate Stories"
          onStoryGenerated={(story) =>
            setStories((prev) => [
              ...prev,
              {
                summary: story.summary || "Untitled Story",
                description: story.description || "",
                acceptance_criteria: story.acceptance_criteria || [],
                story_points: story.story_points || 0,
                priority: story.priority || "Medium",
                labels: story.labels || [],
              },
            ])
          }
        />
      </div>
      <div className="flex flex-col items-start my-4">
        {stories.map((story, index) => (
          <Card key={index} className="w-full max-w-md mb-4 rounded">
            <CardHeader>
              <CardTitle>{story.summary}</CardTitle>
              <CardDescription>{story.description}</CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStory(story)}
                >
                  View Story
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Modal for viewing a story */}
      <Dialog
        open={!!selectedStory}
        onOpenChange={() => setSelectedStory(null)}
      >
        <DialogContent className="flex flex-col max-w-3xl max-h-1/2 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Story Details</DialogTitle>
          </DialogHeader>
          {selectedStory && (
            <div className="space-y-2">
              <div>
                <strong>Summary:</strong> {selectedStory.summary}
              </div>
              <div>
                <strong>Description:</strong> {selectedStory.description}
              </div>
              <div>
                <strong>Acceptance Criteria:</strong>
                <ul className="list-disc ml-6">
                  {(selectedStory.acceptance_criteria || []).map(
                    (c: string, i: number) => (
                      <li key={i}>{c}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <strong>Story Points:</strong> {selectedStory.story_points}
              </div>
              <div>
                <strong>Priority:</strong> {selectedStory.priority}
              </div>
              <div>
                <strong>Labels:</strong>{" "}
                {(selectedStory.labels || []).join(", ")}
              </div>
            </div>
          )}

          <Button
            variant="default"
            onClick={() => handleCreateIssue(selectedStory)}
            disabled={issueLoading}
          >
            {issueLoading ? "Importing..." : "Import to Jira Issue"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stories;
