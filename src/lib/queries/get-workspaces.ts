import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserWorkspaces() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      console.log("⚠️ No session in getUserWorkspaces");
      return [];
    }

    console.log("🔍 Fetching workspaces for user:", session.user.id);

    const workspaces = await db.workspace.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            WorkspaceMember: {
              some: { userId: session.user.id },
            },
          },
        ],
      },
      include: {
        WorkspaceMember: {
          where: { userId: session.user.id },
          select: { role: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const mappedWorkspaces = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      role:
        workspace.WorkspaceMember[0]?.role ||
        (workspace.ownerId === session.user.id ? "owner" : "member"),
    }));

    console.log(
      `✅ Found ${mappedWorkspaces.length} workspaces:`,
      mappedWorkspaces.map((w) => ({ id: w.id, name: w.name })),
    );

    return mappedWorkspaces;
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    // Return empty array if database is unavailable
    // This prevents the app from crashing
    return [];
  }
}
