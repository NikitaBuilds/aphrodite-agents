"use client";

import { useState } from "react";

type DataSource = {
  id: string;
  label: string;
  icon: string;
  fields: { name: string; type: string; description: string }[];
  templatePrefix: string;
};

type DataSourcePickerProps = {
  onInsert: (template: string) => void;
};

export default function DataSourcePicker({ onInsert }: DataSourcePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  // Define available data sources
  // These match the Supabase profiles table structure
  const dataSources: DataSource[] = [
    {
      id: "user",
      label: "User Profile Data",
      icon: "👤",
      templatePrefix: "user",
      fields: [
        { name: "id", type: "string", description: "User's unique ID" },
        {
          name: "creator_type",
          type: "string",
          description: "Type of content creator",
        },
        {
          name: "content_type",
          type: "string",
          description: "Primary content type",
        },
        {
          name: "speaking_or_visual",
          type: "string",
          description: "Content style preference",
        },
        {
          name: "mission_statement",
          type: "string",
          description: "User's mission statement",
        },
        {
          name: "core_interests",
          type: "string",
          description: "Core interests and topics",
        },
        {
          name: "ai_brand_summary",
          type: "string",
          description: "AI-generated brand summary",
        },
        {
          name: "product_name",
          type: "string",
          description: "Product or brand name",
        },
        { name: "seller", type: "string", description: "What the user sells" },
        { name: "gender", type: "string", description: "User's gender" },
        {
          name: "music_genre",
          type: "string",
          description: "Preferred music genre",
        },
        {
          name: "filming_device",
          type: "string",
          description: "Device used for filming",
        },
        {
          name: "daily_post_commitment",
          type: "string",
          description: "Daily posting commitment",
        },
        {
          name: "anything_else",
          type: "string",
          description: "Additional user information",
        },
        {
          name: "whatsapp_number",
          type: "string",
          description: "WhatsApp contact number",
        },
        {
          name: "instagram_connected",
          type: "boolean",
          description: "Instagram account connected",
        },
        {
          name: "tiktok_connected",
          type: "boolean",
          description: "TikTok account connected",
        },
        {
          name: "has_instagram_videos",
          type: "boolean",
          description: "Has Instagram video content",
        },
        {
          name: "has_tiktok_videos",
          type: "boolean",
          description: "Has TikTok video content",
        },
      ],
    },
    // Future: Add more Supabase tables here
    // {
    //   id: "supabase_scripts",
    //   label: "Generated Scripts",
    //   icon: "📄",
    //   templatePrefix: "supabase.scripts",
    //   fields: [...] // Fetched from Supabase schema
    // }
  ];

  const handleInsert = (field: string) => {
    if (!selectedSource) return;
    const template = `{{${selectedSource.templatePrefix}:${field}}}`;
    onInsert(template);
    setIsOpen(false);
    setSelectedSource(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "8px 12px",
          background: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#059669")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#10b981")}
      >
        <span>+</span> Insert Data Source
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={() => {
        setIsOpen(false);
        setSelectedSource(null);
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          width: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              Select Data Source
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedSource(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "13px" }}
          >
            Insert dynamic data that will be replaced during workflow execution
          </p>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {!selectedSource ? (
            // Data Source List
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  style={{
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.background = "#f0fdf4";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{source.icon}</span>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>
                          {source.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#10b981",
                          marginTop: "4px",
                        }}
                      >
                        {source.fields.length} field
                        {source.fields.length !== 1 ? "s" : ""} available
                      </div>
                    </div>
                    <div style={{ color: "#10b981", fontSize: "20px" }}>→</div>
                  </div>
                </div>
              ))}

              {/* Future Supabase Data Sources Placeholder */}
              <div
                style={{
                  padding: "16px",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📊</span>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    Supabase Tables
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  Coming soon - Connect to Supabase for dynamic data sources
                </div>
              </div>
            </div>
          ) : (
            // Field Selection
            <div>
              <button
                onClick={() => setSelectedSource(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#10b981",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "8px 0",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ← Back to data sources
              </button>

              <div
                style={{
                  padding: "16px",
                  background: "#f0fdf4",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #86efac",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {selectedSource.icon}
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    {selectedSource.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#047857",
                    marginTop: "4px",
                  }}
                >
                  Click a field to insert it into your prompt
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {selectedSource.fields.map((field) => (
                  <div
                    key={field.name}
                    onClick={() => handleInsert(field.name)}
                    style={{
                      padding: "14px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.background = "#f0fdf4";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                          🔹 {field.name}
                        </div>
                        <code
                          style={{
                            fontSize: "11px",
                            color: "#059669",
                            background: "#d1fae5",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            display: "inline-block",
                            marginBottom: "6px",
                          }}
                        >
                          {`{{${selectedSource.templatePrefix}:${field.name}}}`}
                        </code>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          {field.description}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          background: "#e5e7eb",
                          color: "#6b7280",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          marginLeft: "8px",
                        }}
                      >
                        {field.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
