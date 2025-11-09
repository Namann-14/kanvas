import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function POST(req: Request) {
  const { name, boardId, workspaceId } = await req.json();
  await getWorkspaceOrThrow(workspaceId);

  const position = await db.column.count({ where: { boardId } });

  const column = await db.column.create({
    data: { name, boardId, position },
  });

  return NextResponse.json(column);
}
