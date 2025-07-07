import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/UploadCard";
import MetricsCards from "@/components/MetricsCards";
import ProjectTable from "@/components/ProjectTable";

export type Project = {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  self: string;
  avatarUrls: {
    ["16x16"]: string;
  };
};

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [CLOUDID, setCLOUDID] = useState<string | null>(null);
  const [jiraAccessToken, setJiraAccessToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ Validate token on load
  useEffect(() => {
    const validateJiraToken = async () => {
      const token = sessionStorage.getItem("jiraAccessToken");
      const cloudid = sessionStorage.getItem("cloudid");

      if (!token || !cloudid) {
        setIsConnected(false);
        return;
      }

      try {
        const res = await fetch(
          "https://api.atlassian.com/oauth/token/accessible-resources",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Token expired or invalid");
        }

        const resources = await res.json();
        const current = resources.find((r: any) => r.id === cloudid);

        if (current) {
          setJiraAccessToken(token);
          setCLOUDID(cloudid);
          setIsConnected(true);
        } else {
          throw new Error("Cloud ID not found");
        }
      } catch (err) {
        console.warn("Session token expired or invalid, resetting state.");
        sessionStorage.removeItem("jiraAccessToken");
        sessionStorage.removeItem("cloudid");
        setJiraAccessToken(null);
        setCLOUDID(null);
        setIsConnected(false);
      }
    };

    validateJiraToken();
  }, []);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    if (CLOUDID && jiraAccessToken) {
      fetchProjects();
    }
  }, [CLOUDID, jiraAccessToken]);

  const jiraConnect = () => {
    window.location.href = `${API_BASE_URL}/jira-connect`;
  };

  const metrics = [
    {
      title: "Total Projects",
      value: "147",
      change: "+12 this week",
      value: projects?.length,
      change: "",
      trend: "",
    },
    {
      title: "Completed Stories",
      value: "89",
      change: "+8 this week",
      trend: "up",
    },
    {
      title: "In Progress",
      value: "34",
      change: "+4 this week",
      trend: "up",
    },
    {
      title: "Story Points",
      value: "423",
      change: "+45 this sprint",
      trend: "up",
    },
  ];

  return (
    <div className="px-4">
      <div className="flex justify-between my-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p>Convert business requirements into actionable user stories</p>
        </div>
        <Button
          className="rounded"
          disabled={isConnected}
          onClick={jiraConnect}
        >
          {isConnected ? "Connected" : "Connect Jira"}
        </Button>
      </div>

      <div className="bg-card border px-3 py-4 my-4 rounded">
        <h1 className="text-lg font-medium my-2">Quick Actions</h1>
        <UploadCard />
      </div>

      <MetricsCards metrics={metrics} />

      <div className="py-6">
        <h1 className="text-2xl font-semibold mb-6">Projects</h1>
        {jiraAccessToken && CLOUDID ? (
          <ProjectTable data={projects} isLoading={loading} />
        ) : (
          <div>
            <h1>Please connect to Jira</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
