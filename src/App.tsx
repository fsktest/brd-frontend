import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./Store/auth";
import Issue from "./Pages/Issue";
import Layout from "@/components/Layout";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import "./index.css";
import JiraSuccess from "./Pages/JiraSuccess";
import BulkUpload from "./Pages/BulkUpload";
import Stories from "./Pages/Stories";

// Protect routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="/issue" element={<Issue />} />
        <Route path="/bulk-upload" element={<BulkUpload />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/jira-success" element={<JiraSuccess />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
