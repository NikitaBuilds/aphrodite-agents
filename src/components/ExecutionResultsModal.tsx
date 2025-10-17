"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Node, Edge } from "@xyflow/react";
import {
  detectWorkflows,
  getWorkflowDisplayName,
  WorkflowGroup,
} from "@/utils/workflow-detection";

type ExecutionOutput = {
  content?: string | object;
  model?: string;
  tokens?: number;
  isStructured?: boolean;
  userName?: string;
  userId?: string;
  // Vector search outputs
  videos?: Array<{
    id: string;
    video_summary?: any;
    summary?: string;
    views?: number;
    similarity?: number;
  }>;
  count?: number;
  functionName?: string;
};

type ExecutionResultsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: Record<string, ExecutionOutput>;
  nodes: Node[];
  edges: Edge[];
};

type UserResults = {
  userId: string;
  userName: string;
  workflows: WorkflowResults[];
  totalTokens: number;
};

type WorkflowResults = {
  workflow: WorkflowGroup;
  nodeResults: Array<{
    nodeId: string;
    output: ExecutionOutput;
    nodeLabel?: string;
  }>;
  tokens: number;
};

// Workflow color schemes
const WORKFLOW_COLORS = [
  {
    gradient: "from-purple-50 to-pink-50",
    border: "border-purple-300",
    badge: "bg-purple-600",
  },
  {
    gradient: "from-blue-50 to-cyan-50",
    border: "border-blue-300",
    badge: "bg-blue-600",
  },
  {
    gradient: "from-green-50 to-emerald-50",
    border: "border-green-300",
    badge: "bg-green-600",
  },
  {
    gradient: "from-orange-50 to-amber-50",
    border: "border-orange-300",
    badge: "bg-orange-600",
  },
  {
    gradient: "from-rose-50 to-red-50",
    border: "border-rose-300",
    badge: "bg-rose-600",
  },
  {
    gradient: "from-indigo-50 to-violet-50",
    border: "border-indigo-300",
    badge: "bg-indigo-600",
  },
];

export default function ExecutionResultsModal({
  open,
  onOpenChange,
  results,
  nodes,
  edges,
}: ExecutionResultsModalProps) {
  const resultEntries = Object.entries(results);

  // Detect workflows from nodes and edges
  const allNodeIds = nodes.map((n) => n.id);
  const workflows = detectWorkflows(allNodeIds, edges);

  // Group results by user and workflow
  const userResultsMap = new Map<string, UserResults>();

  resultEntries.forEach(([key, output]) => {
    const userId = output.userId || "default";
    const userName = output.userName || "Single Execution";

    if (!userResultsMap.has(userId)) {
      userResultsMap.set(userId, {
        userId,
        userName,
        workflows: [],
        totalTokens: 0,
      });
    }

    const userResults = userResultsMap.get(userId)!;
    const nodeId = key.replace(`${userId}-`, "");

    // Find which workflow this node belongs to
    const workflow = workflows.find((wf) => wf.nodeIds.includes(nodeId));
    if (!workflow) return;

    // Find or create workflow results
    let workflowResults = userResults.workflows.find(
      (wr) => wr.workflow.id === workflow.id
    );

    if (!workflowResults) {
      workflowResults = {
        workflow,
        nodeResults: [],
        tokens: 0,
      };
      userResults.workflows.push(workflowResults);
    }

    // Get node label from nodes
    const node = nodes.find((n) => n.id === nodeId);
    const nodeLabel = (node?.data?.label as string | undefined) || nodeId;

    workflowResults.nodeResults.push({ nodeId, output, nodeLabel });
    workflowResults.tokens += output.tokens || 0;
    userResults.totalTokens += output.tokens || 0;
  });

  const userResults = Array.from(userResultsMap.values());
  const isSingleUser = userResults.length === 1;
  const hasResults = userResults.length > 0;
  const hasMultipleWorkflows = workflows.length > 1;

  const handleCopyWorkflowResult = (workflowResults: WorkflowResults) => {
    // Copy all final results from this workflow
    const finalResults = workflowResults.workflow.endNodes
      .map((endNodeId) => {
        const result = workflowResults.nodeResults.find(
          (nr) => nr.nodeId === endNodeId
        );
        return result?.output;
      })
      .filter(Boolean);

    const textToCopy = JSON.stringify(
      finalResults.length === 1 ? finalResults[0] : finalResults,
      null,
      2
    );
    navigator.clipboard.writeText(textToCopy);
    alert(`Copied workflow result!`);
  };

  const handleCopyAllResults = () => {
    const allOutputs = userResults.map((ur) => ({
      user: ur.userName,
      workflows: ur.workflows.map((wr) => ({
        workflow: getWorkflowDisplayName(wr.workflow, 0),
        results: wr.nodeResults.map((nr) => nr.output),
      })),
    }));

    navigator.clipboard.writeText(JSON.stringify(allOutputs, null, 2));
    alert(`Copied results for all ${userResults.length} users!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none h-[85vh] flex flex-col p-0 !z-[9999]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Workflow Execution Results
            {hasMultipleWorkflows && (
              <span className="text-sm font-normal bg-purple-600 text-white px-3 py-1 rounded-full">
                {workflows.length}{" "}
                {workflows.length === 1 ? "Workflow" : "Workflows"}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {!hasResults
              ? "No results to display"
              : isSingleUser
              ? hasMultipleWorkflows
                ? `Results from ${workflows.length} independent workflows`
                : "Results from your workflow execution"
              : `Results for ${userResults.length} users across ${
                  workflows.length
                } ${workflows.length === 1 ? "workflow" : "workflows"}`}
          </DialogDescription>
        </DialogHeader>

        {!hasResults ? (
          // No results
          <div className="px-6 pb-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No results yet</p>
              <p className="text-sm">Execute a workflow to see results here</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : isSingleUser ? (
          // Single user - show workflows directly
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <UserWorkflowsView
              userResult={userResults[0]}
              workflows={workflows}
              nodes={nodes}
            />
            <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
              {userResults[0].workflows.length === 1 && (
                <Button
                  onClick={() =>
                    handleCopyWorkflowResult(userResults[0].workflows[0])
                  }
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  📋 Copy Result
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Multiple users - use tabs
          <Tabs
            defaultValue={userResults[0]?.userId || ""}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-6 border-b shrink-0 bg-white">
              <TabsList className="w-full justify-start overflow-x-auto">
                {userResults.map((ur) => (
                  <TabsTrigger
                    key={ur.userId}
                    value={ur.userId}
                    className="flex items-center gap-2"
                  >
                    <span className="font-semibold">{ur.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({ur.totalTokens} tokens)
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {userResults.map((ur) => (
              <TabsContent
                key={ur.userId}
                value={ur.userId}
                className="flex-1 flex flex-col min-h-0 m-0"
              >
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <UserWorkflowsView
                    userResult={ur}
                    workflows={workflows}
                    nodes={nodes}
                  />
                </div>
                <div className="px-6 pb-6 pt-4 border-t bg-white shrink-0">
                  <div className="flex justify-between">
                    <Button onClick={handleCopyAllResults} variant="outline">
                      📋 Copy All Results ({userResults.length} users)
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component for displaying workflows for a single user
function UserWorkflowsView({
  userResult,
  workflows,
  nodes,
}: {
  userResult: UserResults;
  workflows: WorkflowGroup[];
  nodes: Node[];
}) {
  return (
    <div className="space-y-6">
      {userResult.workflows.map((workflowResults, workflowIndex) => {
        const colorScheme =
          WORKFLOW_COLORS[workflowIndex % WORKFLOW_COLORS.length];
        const workflowName = getWorkflowDisplayName(
          workflowResults.workflow,
          workflowIndex
        );
        const hasMultipleWorkflows = workflows.length > 1;

        return (
          <div
            key={workflowResults.workflow.id}
            className={`bg-gradient-to-br ${colorScheme.gradient} p-6 rounded-xl border-2 ${colorScheme.border} shadow-lg`}
          >
            {/* Workflow Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`${colorScheme.badge} text-white px-3 py-1 rounded-lg font-bold text-sm`}
                >
                  {hasMultipleWorkflows ? workflowName : "Workflow"}
                </span>
                <span className="text-sm text-gray-600">
                  {workflowResults.nodeResults.length}{" "}
                  {workflowResults.nodeResults.length === 1 ? "node" : "nodes"}{" "}
                  • {workflowResults.tokens} tokens
                </span>
              </div>
              {workflowResults.workflow.isConnected && (
                <span className="text-xs bg-white px-2 py-1 rounded border border-gray-300">
                  🔗 Connected Pipeline
                </span>
              )}
            </div>

            {/* Node Results */}
            <div className="space-y-3">
              {workflowResults.nodeResults.map(
                ({ nodeId, output, nodeLabel }) => {
                  const isEndNode =
                    workflowResults.workflow.endNodes.includes(nodeId);
                  const node = nodes.find((n) => n.id === nodeId);
                  const nodeType = node?.type || "unknown";

                  return (
                    <div
                      key={nodeId}
                      className={`bg-white p-4 rounded-lg border-2 ${
                        isEndNode
                          ? "border-green-400 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          {nodeType === "llm" && <span>🤖</span>}
                          <span className="text-purple-600">{nodeLabel}</span>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {nodeId}
                          </code>
                          {isEndNode && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                              ✨ Final Output
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          {output.model && (
                            <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded border">
                              {output.model}
                            </span>
                          )}
                          {output.isStructured && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                              Structured
                            </span>
                          )}
                          {output.tokens && (
                            <span className="text-gray-500">
                              {output.tokens} tokens
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded border ${
                          isEndNode
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {/* Vector Search Results */}
                        {output.videos ? (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-cyan-700 mb-2">
                              Found {output.count} viral videos
                              {output.functionName && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({output.functionName})
                                </span>
                              )}
                            </div>
                            {output.videos.slice(0, 3).map((video, idx) => (
                              <div
                                key={video.id}
                                className="p-3 bg-white rounded border border-cyan-200"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="text-xs font-semibold text-cyan-800">
                                    Video {idx + 1}
                                  </span>
                                  {video.similarity && (
                                    <span className="text-xs text-cyan-600">
                                      {(video.similarity * 100).toFixed(1)}%
                                      match
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700">
                                  ID:{" "}
                                  <code className="bg-gray-100 px-1 rounded">
                                    {video.id}
                                  </code>
                                </div>
                                {video.summary && (
                                  <div className="text-xs text-gray-600 mt-2 line-clamp-2">
                                    {video.summary}
                                  </div>
                                )}
                                {video.views && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    👁️ {video.views.toLocaleString()} views
                                  </div>
                                )}
                              </div>
                            ))}
                            {output.videos.length > 3 && (
                              <div className="text-xs text-gray-500 text-center py-2">
                                + {output.videos.length - 3} more videos
                              </div>
                            )}
                          </div>
                        ) : output.isStructured &&
                          typeof output.content === "object" ? (
                          /* LLM Structured Output */
                          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(output.content, null, 2)}
                          </pre>
                        ) : (
                          /* LLM Text Output */
                          <div className="text-sm whitespace-pre-wrap">
                            {typeof output.content === "string"
                              ? output.content
                              : JSON.stringify(output.content, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Workflow Summary - Show all final outputs */}
            {workflowResults.workflow.endNodes.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-400 shadow-md">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  {workflowResults.workflow.endNodes.length === 1
                    ? "Final Result"
                    : `${workflowResults.workflow.endNodes.length} Final Results`}
                </h4>
                {workflowResults.workflow.endNodes.map((endNodeId) => {
                  const endNodeResult = workflowResults.nodeResults.find(
                    (nr) => nr.nodeId === endNodeId
                  );
                  if (!endNodeResult) return null;

                  return (
                    <div
                      key={endNodeId}
                      className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-2 last:mb-0"
                    >
                      {endNodeResult.output.videos ? (
                        /* Vector Search Final Result */
                        <div className="text-sm">
                          <div className="font-semibold mb-2">
                            {endNodeResult.nodeLabel}:{" "}
                            {endNodeResult.output.count} videos
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(
                              endNodeResult.output.videos,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      ) : typeof endNodeResult.output.content === "object" ? (
                        /* LLM Structured Output */
                        <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            endNodeResult.output.content,
                            null,
                            2
                          )}
                        </pre>
                      ) : (
                        /* LLM Text Output */
                        <div className="text-sm whitespace-pre-wrap">
                          {endNodeResult.output.content || "No output"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
