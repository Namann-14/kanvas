import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return new NextResponse("Organization name is required", { status: 400 });
    }

    if (name.length > 100) {
      return new NextResponse("Organization name is too long", { status: 400 });
    }

    // Create workspace with owner as member
    const workspace = await db.workspace.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
      },
      include: {
        members: {
          where: { userId: session.user.id },
          select: { role: true },
        },
      },
    });

    // Create a default board for the workspace
    await db.board.create({
      data: {
        name: `${workspace.name} Board`,
        workspaceId: workspace.id,
        columns: {
          create: [
            { name: "To Do", position: 0 },
            { name: "In Progress", position: 1 },
            { name: "Done", position: 2 },
          ],
        },
      },
    });

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      role: workspace.members[0]?.role || "owner",
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
