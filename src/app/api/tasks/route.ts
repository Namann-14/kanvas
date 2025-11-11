import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";

export async function POST(req: Request) {
  const { title, description, columnId, workspaceId } = await req.json();
  await getWorkspaceOrThrow(workspaceId);

  const position = await db.task.count({ where: { columnId } });

  const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const task = await db.task.create({
    data: {
      id: taskId,
      title,
      description,
      columnId,
      position,
    },
  });

  return NextResponse.json(task);
}
