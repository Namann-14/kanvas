import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { updates } = await req.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return new NextResponse("Invalid updates array", { status: 400 });
    }

    // Process each update in a transaction
    await db.$transaction(async (tx) => {
      for (const update of updates) {
        const { taskId, columnId, position } = update;

        // Verify the task exists and user has access
        const task = await tx.task.findUnique({
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

        if (!task) continue;

        const workspace = task.Column.Board.Workspace;
        const hasAccess =
          workspace.ownerId === session.user.id ||
          workspace.WorkspaceMember.length > 0;

        if (!hasAccess) continue;

        // Update the task
        await tx.task.update({
          where: { id: taskId },
          data: {
            columnId,
            position,
            updatedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error("Error in batch update:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
