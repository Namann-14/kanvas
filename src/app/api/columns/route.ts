import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function POST(req: Request) {
  const { name, boardId, workspaceId } = await req.json();
  await getWorkspaceOrThrow(workspaceId);

  const position = await db.column.count({ where: { boardId } });

  const columnId = `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const column = await db.column.create({
    data: {
      id: columnId,
      name,
      boardId,
      position,
    },
  });

  return NextResponse.json(column);
}
