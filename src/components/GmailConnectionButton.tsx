"use client";

import { useState, useEffect } from "react";

type GmailStatus = {
  connected: boolean;
  email: string | null;
  tokenExpiry: string | null;
};

export function GmailConnectionButton() {
  const [status, setStatus] = useState<GmailStatus>({
    connected: false,
    email: null,
    tokenExpiry: null,
  });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Check Gmail connection status on mount
  useEffect(() => {
    checkStatus();

    // Check URL params for OAuth callback status
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected") === "true") {
      // Remove param from URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refresh status
      setTimeout(() => checkStatus(), 500);
    } else if (params.get("gmail_error")) {
      const error = params.get("gmail_error");
      alert(`Gmail connection failed: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/integrations/gmail/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to check Gmail status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = "/api/integrations/gmail/connect";
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Gmail? This will remove access to Gmail tools."
      )
    ) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch("/api/integrations/gmail/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setStatus({ connected: false, email: null, tokenExpiry: null });
      } else {
        alert("Failed to disconnect Gmail");
      }
    } catch (error) {
      console.error("Failed to disconnect Gmail:", error);
      alert("Failed to disconnect Gmail");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "12px",
          background: "#f9fafb",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Checking Gmail connection...
      </div>
    );
  }

  if (status.connected) {
    return (
      <div
        style={{
          padding: "12px",
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>✅</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#166534",
                }}
              >
                Gmail Connected
              </div>
              {status.email && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#15803d",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {status.email}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            style={{
              padding: "6px 12px",
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#dc2626",
              cursor: disconnecting ? "not-allowed" : "pointer",
              opacity: disconnecting ? 0.5 : 1,
              flexShrink: 0,
              fontWeight: "500",
            }}
            onMouseOver={(e) =>
              !disconnecting && (e.currentTarget.style.background = "#fef2f2")
            }
            onMouseOut={(e) =>
              !disconnecting && (e.currentTarget.style.background = "white")
            }
          >
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        background: "#fef3c7",
        border: "1px solid #fbbf24",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#92400e",
              }}
            >
              Gmail Not Connected
            </div>
            <div
              style={{ fontSize: "11px", color: "#b45309", marginTop: "2px" }}
            >
              Click to authorize via browser
            </div>
          </div>
        </div>
        <button
          onClick={handleConnect}
          style={{
            padding: "8px 16px",
            background: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#3367d6")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#4285f4")}
        >
          <span>📧</span>
          Connect Gmail
        </button>
      </div>
    </div>
  );
}
