"use client";

import { Node, Edge } from "@xyflow/react";
import { useState, useEffect, useRef, useCallback } from "react";
import SchemaBuilder from "./SchemaBuilder";
import NodeOutputPicker from "./NodeOutputPicker";
import DataSourcePicker from "./DataSourcePicker";
import { MODELS } from "@/lib/models";
import { GmailConnectionButton } from "./GmailConnectionButton";
import { AsanaConnectionButton } from "./AsanaConnectionButton";

type PropertiesPanelProps = {
  node: Node;
  nodes: Node[]; // All nodes for the picker
  edges: Edge[]; // All edges for connection detection
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
  onClose: () => void;
};

export default function PropertiesPanel({
  node,
  nodes,
  edges,
  onUpdateNode,
  onClose,
}: PropertiesPanelProps) {
  const [formData, setFormData] = useState(node.data);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Update form data when node changes
  useEffect(() => {
    setFormData(node.data);
  }, [node]);

  const handleChange = useCallback(
    (field: string, value: string | boolean | null | number) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      onUpdateNode(node.id, newData);
    },
    [formData, node.id, onUpdateNode]
  );

  const handleInsertTemplate = (template: string) => {
    if (promptRef.current) {
      const textarea = promptRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Determine the correct field name based on node type
      let fieldName = "prompt";
      if (node.type === "supabase") {
        fieldName = "query";
      } else if (node.type === "mcpAgent") {
        fieldName = "prompt";
      }

      const currentText = (formData[fieldName] as string) || "";

      // Insert template at cursor position
      const newText =
        currentText.substring(0, start) + template + currentText.substring(end);

      handleChange(fieldName, newText);

      // Set cursor position after inserted template
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + template.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "420px",
        height: "100%",
        background: "white",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
          Node Properties
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#6b7280",
            padding: "4px 8px",
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Node Type
          </div>
          <div
            style={{
              padding: "8px 12px",
              background:
                node.type === "llm"
                  ? "#f3e8ff"
                  : node.type === "mcpAgent"
                  ? "#fed7aa"
                  : "#d1fae5",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color:
                node.type === "llm"
                  ? "#7c3aed"
                  : node.type === "mcpAgent"
                  ? "#9a3412"
                  : "#059669",
            }}
          >
            {node.type === "llm"
              ? "LLM Node"
              : node.type === "mcpAgent"
              ? "🤖 MCP Agent Node"
              : "Supabase Node"}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Node ID
          </div>
          <div
            style={{
              padding: "8px 12px",
              background: "#f9fafb",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#374151",
            }}
          >
            {node.id}
          </div>
        </div>

        {node.type === "llm" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Label
              </label>
              <input
                type="text"
                value={(formData.label as string) || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Model
              </label>
              <select
                value={(formData.model as string) || "gpt-4o-2024-08-06"}
                onChange={(e) => handleChange("model", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <optgroup label="🤖 Anthropic">
                  {MODELS.filter((m) => m.provider === "anthropic").map(
                    (model) => (
                      <option key={model.apiName} value={model.apiName}>
                        {model.name}
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="🔷 OpenAI">
                  {MODELS.filter((m) => m.provider === "openai").map(
                    (model) => (
                      <option key={model.apiName} value={model.apiName}>
                        {model.name}
                      </option>
                    )
                  )}
                </optgroup>
              </select>
              <div
                style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}
              >
                Note: OpenAI uses native structured output, Anthropic uses JSON
                mode
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Prompt
              </label>
              <textarea
                ref={promptRef}
                value={(formData.prompt as string) || ""}
                onChange={(e) => handleChange("prompt", e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <NodeOutputPicker
                  nodes={nodes}
                  edges={edges}
                  currentNodeId={node.id}
                  onInsert={handleInsertTemplate}
                />
                <DataSourcePicker onInsert={handleInsertTemplate} />
              </div>
            </div>

            <div
              style={{
                marginBottom: "16px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <input
                  type="checkbox"
                  id="useStructuredOutput"
                  checked={(formData.useStructuredOutput as boolean) || false}
                  onChange={(e) =>
                    handleChange("useStructuredOutput", e.target.checked)
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="useStructuredOutput"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Use Structured Output
                </label>
              </div>

              {Boolean(formData.useStructuredOutput) && (
                <div>
                  <SchemaBuilder
                    value={(formData.outputSchema as string) || ""}
                    onChange={(schema) => handleChange("outputSchema", schema)}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {node.type === "supabase" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Label
              </label>
              <input
                type="text"
                value={(formData.label as string) || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Table
              </label>
              <input
                type="text"
                value={(formData.table as string) || ""}
                onChange={(e) => handleChange("table", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Query
              </label>
              <textarea
                value={(formData.query as string) || ""}
                onChange={(e) => handleChange("query", e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </>
        )}

        {node.type === "mcpAgent" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Label
              </label>
              <input
                type="text"
                value={(formData.label as string) || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Model (Anthropic)
              </label>
              <select
                value={
                  (formData.model as string) || "claude-sonnet-4-5-20250929"
                }
                onChange={(e) => handleChange("model", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="claude-sonnet-4-5-20250929">
                  Claude Sonnet 4.5
                </option>
                <option value="claude-3-5-sonnet-20241022">
                  Claude 3.5 Sonnet
                </option>
                <option value="claude-3-5-haiku-20241022">
                  Claude 3.5 Haiku
                </option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Agent Instructions
              </label>
              <textarea
                ref={promptRef}
                value={(formData.prompt as string) || ""}
                onChange={(e) => handleChange("prompt", e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
              <div
                style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}
              >
                The agent will have access to all configured MCP server tools
              </div>
            </div>

            <div
              style={{
                marginBottom: "16px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                }}
              >
                🔧 MCP Server Connections
              </div>

              {/* Gmail Integration */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  📧 Gmail Integration
                </div>
                <GmailConnectionButton />
              </div>

              {/* Asana Integration */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  ✅ Asana Integration
                </div>
                <AsanaConnectionButton />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={(formData.maxIterations as number) || 10}
                    onChange={(e) =>
                      handleChange("maxIterations", parseInt(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="8192"
                    step="100"
                    value={(formData.maxTokens as number) || 4096}
                    onChange={(e) =>
                      handleChange("maxTokens", parseInt(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            background: "#f9fafb",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          💡 Changes are saved automatically as you type
        </div>
      </div>
    </div>
  );
}
