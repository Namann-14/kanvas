import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId)
    return new NextResponse("Workspace required", { status: 400 });

  await getWorkspaceOrThrow(workspaceId);

  // Get the single board for this workspace
  const board = await db.board.findUnique({
    where: { workspaceId },
  });

  return NextResponse.json(board);
}

export async function POST(req: Request) {
  const { name, workspaceId } = await req.json();

  await getWorkspaceOrThrow(workspaceId);

  // Check if board already exists for this workspace
  const existingBoard = await db.board.findUnique({
    where: { workspaceId },
  });

  if (existingBoard) {
    return new NextResponse("Board already exists for this workspace", {
      status: 400,
    });
  }

  // Generate a unique ID for the board
  const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const board = await db.board.create({
    data: {
      id: boardId,
      name,
      workspaceId,
    },
  });

  return NextResponse.json(board);
}

export async function PATCH(req: Request) {
  const { name, workspaceId } = await req.json();

  await getWorkspaceOrThrow(workspaceId);

  const board = await db.board.update({
    where: { workspaceId },
    data: { name },
  });

  return NextResponse.json(board);
}
