import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function PUT(req: Request) {
  try {
    const { workspaceId, taskId, toColumnId, newIndex } = await req.json();

    if (!workspaceId || !taskId || !toColumnId || newIndex === undefined) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    await getWorkspaceOrThrow(workspaceId);

    // Shift other tasks down
    await db.task.updateMany({
      where: { columnId: toColumnId, position: { gte: newIndex } },
      data: { position: { increment: 1 } },
    });

    // Move the task
    await db.task.update({
      where: { id: taskId },
      data: { columnId: toColumnId, position: newIndex },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
