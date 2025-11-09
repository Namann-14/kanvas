import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function PUT(req: Request) {
  try {
    const { workspaceId, boardId, columnOrder } = await req.json();

    if (!workspaceId || !boardId || !Array.isArray(columnOrder)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    await getWorkspaceOrThrow(workspaceId);

    const updates = columnOrder.map((id: string, index: number) =>
      db.column.update({
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
