import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getWorkspaceBoard(workspaceId: string) {
  try {
    console.log("🔍 Fetching board for workspace:", workspaceId);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      console.log("⚠️ No session found");
      return null;
    }

    console.log("✅ Session found for user:", session.user.id);

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
      console.log("⚠️ No workspace access for user");
      return null;
    }

    console.log("✅ Workspace access verified:", workspace.id);

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

    console.log(
      "📋 Board found:",
      board ? `${board.name} with ${board.Column.length} columns` : "null",
    );

    return board;
  } catch (error) {
    console.error("Error fetching workspace board:", error);
    return null;
  }
}
