import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = await params;
    const updates = await req.json();

    // Verify the task exists and user has access
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        Column: {
          include: {
            Board: {
              include: {
                Workspace: {
                  include: {
                    WorkspaceMember: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    const workspace = task.Column.Board.Workspace;
    const hasAccess =
      workspace.ownerId === session.user.id ||
      workspace.WorkspaceMember.length > 0;

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = await params;

    // Verify the task exists and user has access
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        Column: {
          include: {
            Board: {
              include: {
                Workspace: {
                  include: {
                    WorkspaceMember: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    const workspace = task.Column.Board.Workspace;
    const hasAccess =
      workspace.ownerId === session.user.id ||
      workspace.WorkspaceMember.length > 0;

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete the task
    await db.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
