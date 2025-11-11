"use server";

import { cookies } from "next/headers";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const CURRENT_WORKSPACE_COOKIE = "current-workspace-id";

export async function setCurrentWorkspace(workspaceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
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
    throw new Error("Workspace not found or access denied");
  }

  // Set cookie
  (await cookies()).set(CURRENT_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return { success: true, workspaceId };
}

export async function getCurrentWorkspace() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(CURRENT_WORKSPACE_COOKIE)?.value || null;
  } catch (error) {
    console.error("Error getting current workspace:", error);
    return null;
  }
}
