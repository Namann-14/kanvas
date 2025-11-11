import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 Fixing workspace access...\n");

  // Get the current real user
  const realUser = await prisma.user.findUnique({
    where: { email: "namannayak.16@gmail.com" },
  });

  if (!realUser) {
    console.log("❌ Real user not found!");
    return;
  }

  console.log(`✅ Found user: ${realUser.email}`);

  // Get the seed workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: "seed-workspace-1" },
  });

  if (!workspace) {
    console.log("❌ Workspace not found!");
    return;
  }

  // Transfer ownership
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { ownerId: realUser.id },
  });

  console.log(`✅ Transferred workspace ownership to ${realUser.email}`);

  // Add as member if not already
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: realUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {
      role: "owner",
    },
    create: {
      id: `${realUser.id}-${workspace.id}`,
      userId: realUser.id,
      workspaceId: workspace.id,
      role: "owner",
    },
  });

  console.log(`✅ Added ${realUser.email} as workspace member`);

  console.log("\n🎉 Done! You can now access the workspace.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
