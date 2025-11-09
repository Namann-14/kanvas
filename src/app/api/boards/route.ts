import db from "@/lib/db";
import { getWorkspaceOrThrow } from "@/lib/workspace";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId)
    return new NextResponse("Workspace required", { status: 400 });

  await getWorkspaceOrThrow(workspaceId);

  const boards = await db.board.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { name, workspaceId } = await req.json();

  await getWorkspaceOrThrow(workspaceId);

  const board = await db.board.create({
    data: {
      name,
      workspaceId,
    },
  });

  return NextResponse.json(board);
}
