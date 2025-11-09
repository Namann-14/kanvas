import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function PUT(req: Request) {
  try {
    const { workspaceId, columnId, taskOrder } = await req.json();

    if (!workspaceId || !columnId || !Array.isArray(taskOrder)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    await getWorkspaceOrThrow(workspaceId);

    const updates = taskOrder.map((id: string, index: number) =>
      db.task.update({
        where: { id },
        data: { position: index },
      }),
    );

    await db.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
