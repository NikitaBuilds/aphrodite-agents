"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface SchemaField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required: boolean;
}

interface SchemaBuilderProps {
  value: string;
  onChange: (schema: string) => void;
}

const PRESET_SCHEMAS = {
  "social-media-post": {
    name: "Social Media Post",
    schema: {
      type: "object",
      properties: {
        hook: {
          type: "string",
          description: "Attention-grabbing opening line",
        },
        mainContent: {
          type: "string",
          description: "Core message and value proposition",
        },
        callToAction: {
          type: "string",
          description: "Clear next step for viewers",
        },
        hashtags: {
          type: "array",
          items: { type: "string" },
          description: "3-5 relevant hashtags",
        },
      },
      required: ["hook", "mainContent", "callToAction", "hashtags"],
      additionalProperties: false,
    },
  },
  "video-script": {
    name: "Video Script",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Video title" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              timestamp: {
                type: "string",
                description: "Time marker (e.g., 0:15)",
              },
              narration: { type: "string", description: "What to say" },
              visualDescription: {
                type: "string",
                description: "What to show",
              },
            },
            required: ["timestamp", "narration"],
          },
          description: "Script sections with timing",
        },
        duration: { type: "number", description: "Total duration in seconds" },
      },
      required: ["title", "sections"],
      additionalProperties: false,
    },
  },
  "engagement-analysis": {
    name: "Engagement Analysis",
    schema: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
          description: "Overall sentiment",
        },
        viralityScore: { type: "number", description: "Score from 1-10" },
        targetAudience: { type: "string", description: "Primary audience" },
        suggestedImprovements: {
          type: "array",
          items: { type: "string" },
          description: "Recommendations for better engagement",
        },
      },
      required: ["sentiment", "viralityScore"],
      additionalProperties: false,
    },
  },
};

export default function SchemaBuilder({ value, onChange }: SchemaBuilderProps) {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const isUpdatingFromProps = useRef(false);
  const onChangeRef = useRef(onChange);
  const lastGeneratedSchema = useRef<string>("");

  // Update the ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Parse existing schema on mount
  useEffect(() => {
    if (value && value !== lastGeneratedSchema.current) {
      try {
        const schema = JSON.parse(value);
        if (schema.properties) {
          isUpdatingFromProps.current = true;
          const parsedFields: SchemaField[] = Object.entries(
            schema.properties
          ).map(([name, prop]: [string, any]) => ({
            id: Math.random().toString(36).substr(2, 9),
            name,
            type: prop.type || "string",
            description: prop.description || "",
            required: schema.required?.includes(name) || false,
          }));
          setFields(parsedFields);
          // Reset the flag after a brief delay to allow the fields update to complete
          setTimeout(() => {
            isUpdatingFromProps.current = false;
          }, 0);
        }
      } catch (error) {
        console.error("Failed to parse schema:", error);
      }
    }
  }, [value]);

  // Generate JSON schema from fields
  const generateSchema = (currentFields: SchemaField[]) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    currentFields.forEach((field) => {
      properties[field.name] = {
        type: field.type,
        description: field.description,
      };

      if (field.required) {
        required.push(field.name);
      }
    });

    return {
      type: "object",
      properties,
      required,
      additionalProperties: false,
    };
  };

  // Update schema when fields change
  useEffect(() => {
    if (fields.length > 0 && !isUpdatingFromProps.current) {
      const schema = generateSchema(fields);
      const schemaString = JSON.stringify(schema, null, 2);
      lastGeneratedSchema.current = schemaString;
      onChangeRef.current(schemaString);
    }
  }, [fields]);

  const addField = () => {
    const newField: SchemaField = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      type: "string",
      description: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const loadPreset = (presetKey: string) => {
    const preset = PRESET_SCHEMAS[presetKey as keyof typeof PRESET_SCHEMAS];
    if (preset) {
      onChange(JSON.stringify(preset.schema, null, 2));
      setShowPresets(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Templates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Schema Templates
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
          >
            {showPresets ? "Hide" : "Show"} Templates
          </Button>
        </div>

        {showPresets && (
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(PRESET_SCHEMAS).map(([key, preset]) => (
              <Card
                key={key}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => loadPreset(key)}
              >
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click to load this template
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Field Builder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Schema Fields
          </label>
          <Button onClick={addField} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">
            <div className="text-sm">No fields added yet</div>
            <div className="text-xs mt-1">
              Click "Add Field" to start building your schema
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline" className="text-xs">
                      Field {index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Field Name
                      </label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        placeholder="e.g., title, content"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Type
                      </label>
                      <Select
                        value={field.type}
                        onValueChange={(value: SchemaField["type"]) =>
                          updateField(field.id, { type: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Description
                    </label>
                    <Input
                      value={field.description}
                      onChange={(e) =>
                        updateField(field.id, { description: e.target.value })
                      }
                      placeholder="Describe what this field should contain"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) =>
                        updateField(field.id, { required: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`required-${field.id}`}
                      className="text-xs font-medium text-gray-600"
                    >
                      Required field
                    </label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generated Schema Preview */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Generated Schema
          </label>
          <Card className="p-3">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {JSON.stringify(generateSchema(fields), null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
