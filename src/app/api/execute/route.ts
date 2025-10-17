import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod/v3";
import {
  LLMInputSchema,
  LLMOutputSchema,
  MCPAgentInputSchema,
  MCPAgentOutputSchema,
} from "@/lib/schemas";
import { getAllNodeOutputs, injectNodeOutputs } from "@/lib/workflow-store";
import { getModelByApiName } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { generateText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createGmailTools } from "@/lib/gmail-tools";
import { createAsanaTools } from "@/lib/asana";

// OpenAI client for OpenAI models
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// OpenAI client configured for Anthropic's OpenAI-compatible endpoint (for LLM nodes)
const anthropicOpenAI = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  baseURL: "https://api.anthropic.com/v1/",
});

// Helper function to retrieve user credentials from Supabase
async function getUserCredentials(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated. Please log in.");
  }

  // Get user's integration credentials from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, gmail_connected, gmail_email, gmail_access_token, gmail_refresh_token, gmail_token_expiry, asana_connected, asana_access_token, asana_refresh_token, asana_token_expiry, asana_workspace_id, asana_user_id"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to retrieve user profile");
  }

  return {
    userId: user.id,
    userEmail: user.email,
    profile,
  };
}

// Helper function to refresh Gmail access token if expired
async function refreshGmailToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Gmail token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Helper function to refresh Asana access token if expired
async function refreshAsanaToken(refreshToken: string) {
  const clientId = process.env.ASANA_CLIENT_ID;
  const clientSecret = process.env.ASANA_CLIENT_SECRET;

  const response = await fetch("https://app.asana.com/-/oauth_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Asana token");
  }

  const tokens = await response.json();
  return {
    access_token: tokens.access_token,
    expires_in: tokens.expires_in || 3600,
  };
}

// Helper function to convert JSON Schema to Zod schema dynamically
function jsonSchemaToZod(jsonSchema: any): z.ZodTypeAny {
  const properties = jsonSchema.properties || {};
  const required = jsonSchema.required || [];

  const zodShape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const propSchema = prop as any;
    let zodType: z.ZodTypeAny;

    // Handle different types
    switch (propSchema.type) {
      case "string":
        zodType = z.string();
        break;
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        if (propSchema.items?.type === "string") {
          zodType = z.array(z.string());
        } else if (propSchema.items?.type === "number") {
          zodType = z.array(z.number());
        } else {
          zodType = z.array(z.any());
        }
        break;
      case "object":
        // Handle nested objects recursively
        zodType = jsonSchemaToZod(propSchema);
        break;
      default:
        zodType = z.any();
    }

    // Make optional and nullable if not required (OpenAI requirement)
    if (!required.includes(key)) {
      zodType = zodType.optional().nullable();
    }

    zodShape[key] = zodType;
  }

  // Use strict() if additionalProperties is false
  const zodObject = z.object(zodShape);
  return jsonSchema.additionalProperties === false
    ? zodObject.strict()
    : zodObject;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, nodeType, input, workflowId } = body;

    console.log(`Executing node ${nodeId} of type ${nodeType}`);

    if (nodeType === "llm") {
      // Validate input
      const validatedInput = LLMInputSchema.parse(input);

      // Get all previous node outputs if workflowId provided
      let processedPrompt = validatedInput.prompt;
      if (workflowId) {
        const nodeOutputs = await getAllNodeOutputs(workflowId);
        processedPrompt = injectNodeOutputs(validatedInput.prompt, nodeOutputs);
        console.log(`Processed prompt with context: ${processedPrompt}`);
      }

      // Determine which client to use based on provider
      const modelConfig = getModelByApiName(validatedInput.model);
      const provider = modelConfig?.provider || "openai";
      const client = provider === "anthropic" ? anthropicOpenAI : openai;

      console.log(
        `Using ${provider} provider for model ${validatedInput.model}`
      );

      // Prepare request params (same format for both providers via OpenAI compatibility)
      const requestParams: OpenAI.Chat.ChatCompletionCreateParams = {
        model: validatedInput.model,
        messages: [
          {
            role: "system",
            content:
              validatedInput.context ||
              "You are a helpful assistant that creates engaging social media content.",
          },
          {
            role: "user",
            content: processedPrompt,
          },
        ],
        max_tokens: 1000,
      };

      let content: string | object;
      let tokens: number | undefined;

      // Use structured output if enabled
      if (validatedInput.useStructuredOutput && validatedInput.outputSchema) {
        try {
          // Parse the JSON schema
          const schemaObj = JSON.parse(validatedInput.outputSchema);

          console.log(
            "📋 Using custom schema:",
            JSON.stringify(schemaObj, null, 2)
          );

          if (provider === "openai") {
            // OpenAI: Use native structured output with Zod schemas (most reliable)
            const StructuredOutput = jsonSchemaToZod(schemaObj);

            console.log("✅ Using OpenAI native structured output");

            const completion = await client.chat.completions.parse({
              ...requestParams,
              response_format: zodResponseFormat(
                StructuredOutput,
                "structured_output"
              ),
            });

            const message = completion.choices[0]?.message;

            if (message?.parsed) {
              content = message.parsed;
            } else if (message?.refusal) {
              throw new Error(`Model refused: ${message.refusal}`);
            } else {
              throw new Error("No parsed output received");
            }

            tokens = completion.usage?.total_tokens;
          } else {
            // Anthropic: Use JSON mode with markdown stripping
            const schemaStr = JSON.stringify(schemaObj, null, 2);
            const enhancedParams = {
              ...requestParams,
              messages: [
                {
                  role: "system" as const,
                  content: `${requestParams.messages[0].content}\n\nYou must respond with valid JSON that strictly follows this schema:\n${schemaStr}\n\nRespond ONLY with valid JSON, no markdown, no code blocks, no extra text.`,
                },
                ...requestParams.messages.slice(1),
              ],
              response_format: { type: "json_object" as const },
            };

            console.log("✅ Using Anthropic JSON mode");

            const completion = await client.chat.completions.create(
              enhancedParams
            );

            let textContent = completion.choices[0]?.message?.content || "";

            console.log("📤 Raw model response:", textContent);
            console.log(
              "📊 Response length:",
              textContent.length,
              "characters"
            );

            // Strip markdown code blocks if present
            textContent = textContent
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/\s*```$/i, "")
              .trim();

            console.log("🧹 Cleaned response for parsing");

            // Parse the JSON response
            content = JSON.parse(textContent);
            tokens = completion.usage?.total_tokens;

            console.log("✅ Successfully parsed JSON response");
          }
        } catch (parseError) {
          throw new Error(
            `Structured output error: ${
              parseError instanceof Error
                ? parseError.message
                : "Invalid schema"
            }`
          );
        }
      } else {
        // Regular text completion
        const completion = await client.chat.completions.create(requestParams);
        content = completion.choices[0]?.message?.content || "";
        tokens = completion.usage?.total_tokens;

        console.log("📤 Raw model response:", content);
        console.log(
          "📊 Response length:",
          (content as string).length,
          "characters"
        );
      }

      const output = {
        content,
        model: validatedInput.model,
        tokens,
        isStructured: validatedInput.useStructuredOutput,
      };

      // Validate output
      const validatedOutput = LLMOutputSchema.parse(output);

      return NextResponse.json({
        success: true,
        nodeId,
        output: validatedOutput,
      });
    } else if (nodeType === "mcpAgent") {
      const validatedInput = MCPAgentInputSchema.parse(input);

      console.log(`🤖 Executing AI SDK Agent node ${nodeId}`);

      // STEP 1: Get user credentials from Supabase
      const { userId, profile } = await getUserCredentials(request);
      console.log(`Retrieved credentials for user ${userId}`);

      // STEP 2: Build tools using AI SDK with user credentials
      const tools: Record<string, any> = {};
      const connectedServices: string[] = [];

      try {
        // Add Gmail tools if user has connected Gmail
        if (profile.gmail_connected && profile.gmail_access_token) {
          console.log("📧 Adding Gmail tools...");

          // Check if token is expired and refresh if needed
          let accessToken = profile.gmail_access_token;
          const tokenExpiry = profile.gmail_token_expiry
            ? new Date(profile.gmail_token_expiry)
            : null;

          if (tokenExpiry && tokenExpiry < new Date()) {
            console.log("Gmail token expired, refreshing...");
            if (!profile.gmail_refresh_token) {
              throw new Error(
                "Gmail token expired and no refresh token available. Please reconnect Gmail."
              );
            }
            accessToken = await refreshGmailToken(profile.gmail_refresh_token);
            console.log("✅ Gmail token refreshed");

            // Update token in Supabase
            const supabase = await createClient();
            await supabase
              .from("profiles")
              .update({
                gmail_access_token: accessToken,
                gmail_token_expiry: new Date(
                  Date.now() + 3600 * 1000
                ).toISOString(),
              })
              .eq("id", userId);
          }

          const gmailTools = createGmailTools({
            access_token: accessToken,
            refresh_token: profile.gmail_refresh_token!,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          });

          Object.assign(tools, gmailTools);
          connectedServices.push("Gmail");
          console.log(
            `✅ Added ${Object.keys(gmailTools).length} custom Gmail tools`
          );
        }

        // Add Asana tools using REST API (works with both OAuth and PAT)
        // Try user's token from Supabase first, then fallback to env variable
        let asanaToken =
          profile.asana_access_token || process.env.ASANA_ACCESS_TOKEN;
        let tokenSource = profile.asana_access_token
          ? "user profile (OAuth)"
          : "environment variable (PAT)";

        // If user has OAuth token, check if it's expired and refresh if needed
        if (profile.asana_access_token && profile.asana_refresh_token) {
          const tokenExpiry = profile.asana_token_expiry
            ? new Date(profile.asana_token_expiry)
            : null;

          if (tokenExpiry && tokenExpiry < new Date()) {
            console.log("Asana token expired, refreshing...");
            const refreshedTokens = await refreshAsanaToken(
              profile.asana_refresh_token
            );
            asanaToken = refreshedTokens.access_token;
            console.log("✅ Asana token refreshed");

            // Update token in Supabase
            const supabase = await createClient();
            await supabase
              .from("profiles")
              .update({
                asana_access_token: asanaToken,
                asana_token_expiry: new Date(
                  Date.now() + refreshedTokens.expires_in * 1000
                ).toISOString(),
              })
              .eq("id", userId);
          }
        }

        if (asanaToken) {
          console.log(
            `✅ Adding Asana tools via REST API (token from ${tokenSource})...`
          );

          // Create Asana tools using REST API directly
          // Works with both OAuth tokens and Personal Access Tokens
          const asanaTools = createAsanaTools({
            access_token: asanaToken,
          });

          const asanaToolCount = Object.keys(asanaTools).length;

          Object.assign(tools, asanaTools);
          connectedServices.push("Asana");
          console.log(`✅ Added ${asanaToolCount} Asana REST API tools`);
        }

        if (connectedServices.length === 0) {
          throw new Error(
            "No services connected. Please connect Gmail or Asana in the UI first."
          );
        }

        console.log(
          `🔧 Total tools available: ${
            Object.keys(tools).length
          } from ${connectedServices.join(", ")}`
        );

        // STEP 3: Process prompt with context injection
        let processedPrompt = validatedInput.prompt;
        if (workflowId) {
          const nodeOutputs = await getAllNodeOutputs(workflowId);
          processedPrompt = injectNodeOutputs(
            validatedInput.prompt,
            nodeOutputs
          );
        }

        console.log(`Processed prompt: ${processedPrompt}`);

        // STEP 4: Run AI agent with tools using AI SDK
        console.log(
          `🚀 Starting AI SDK agent with ${Object.keys(tools).length} tools`
        );

        const result = await generateText({
          model: anthropic(validatedInput.model),
          prompt: processedPrompt,
          tools,
          stopWhen: stepCountIs(validatedInput.maxIterations || 10),
        });

        console.log(
          `✅ Agent execution completed in ${result.steps.length} steps`
        );

        // STEP 5: Extract content and tool information
        const toolsUsed = result.toolCalls.map((call) => call.toolName);

        const output = {
          content: result.text,
          model: validatedInput.model,
          tokens: result.usage.totalTokens,
          toolsUsed: [...new Set(toolsUsed)], // unique tool names
          iterationCount: result.steps.length,
        };

        const validatedOutput = MCPAgentOutputSchema.parse(output);

        return NextResponse.json({
          success: true,
          nodeId,
          output: validatedOutput,
        });
      } catch (error) {
        console.error("AI SDK Agent execution error:", error);
        throw error;
      }
    }

    return NextResponse.json(
      { success: false, error: "Unknown node type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
