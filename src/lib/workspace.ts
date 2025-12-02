import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getWorkspaceOrThrow(workspaceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

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

  if (!workspace) throw new Error("Forbidden");

  return { session, workspace };
}
