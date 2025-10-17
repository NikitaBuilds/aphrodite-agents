"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AsanaConnectionButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/integrations/asana/status");
      const data = await response.json();
      setIsConnected(data.connected || false);
      setWorkspaceId(data.workspaceId);
    } catch (error) {
      console.error("Failed to check Asana status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Redirect to Asana OAuth flow
      window.location.href = "/api/integrations/asana/connect";
    } catch (error) {
      console.error("Failed to initiate Asana connection:", error);
      alert("Failed to connect to Asana. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Asana?")) {
      return;
    }

    try {
      const response = await fetch("/api/integrations/asana/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setIsConnected(false);
        setWorkspaceId(null);
        alert("✅ Asana disconnected successfully");
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      console.error("Failed to disconnect Asana:", error);
      alert("Failed to disconnect Asana. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        Checking...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <span>✅</span>
          <span>Connected to Asana</span>
        </div>
        {workspaceId && (
          <div className="text-xs text-gray-500">
            Workspace ID: {workspaceId}
          </div>
        )}
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Disconnect Asana
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="w-full" variant="default">
      <span className="mr-2">✅</span>
      Connect Asana
    </Button>
  );
}
