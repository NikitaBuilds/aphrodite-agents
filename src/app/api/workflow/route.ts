import { NextRequest, NextResponse } from "next/server";
import {
  setNodeOutput,
  getNodeOutput,
  getAllNodeOutputs,
  setWorkflowExecution,
  getWorkflowExecution,
  deleteWorkflowData,
} from "@/lib/workflow-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "setNodeOutput": {
        const { workflowId, nodeId, output } = body;
        await setNodeOutput(workflowId, nodeId, output);
        return NextResponse.json({ success: true });
      }

      case "getNodeOutput": {
        const { workflowId, nodeId } = body;
        const output = await getNodeOutput(workflowId, nodeId);
        return NextResponse.json({ success: true, output });
      }

      case "getAllNodeOutputs": {
        const { workflowId } = body;
        const outputs = await getAllNodeOutputs(workflowId);
        return NextResponse.json({ success: true, outputs });
      }

      case "setWorkflowExecution": {
        const { execution } = body;
        await setWorkflowExecution(execution);
        return NextResponse.json({ success: true });
      }

      case "getWorkflowExecution": {
        const { workflowId } = body;
        const execution = await getWorkflowExecution(workflowId);
        return NextResponse.json({ success: true, execution });
      }

      case "deleteWorkflowData": {
        const { workflowId } = body;
        await deleteWorkflowData(workflowId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Workflow API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
