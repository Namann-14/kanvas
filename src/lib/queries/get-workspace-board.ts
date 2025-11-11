import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getWorkspaceBoard(workspaceId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return null;
    }

    // Verify user has access to this workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          {
            WorkspaceMember: {
              some: { userId: session.user.id },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return null;
    }

    // Get the board for this workspace
    const board = await db.board.findFirst({
      where: { workspaceId },
      include: {
        Column: {
          orderBy: { position: "asc" },
          include: {
            Task: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    return board;
  } catch (error) {
    console.error("Error fetching workspace board:", error);
    return null;
  }
}
