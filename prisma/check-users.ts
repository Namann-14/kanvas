import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n👤 Checking users and workspace access...\n");

  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
      workspaces: true,
    },
  });

  if (users.length === 0) {
    console.log("❌ No users found!");
    return;
  }

  users.forEach((user) => {
    console.log(`\n📧 User: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || "(no name)"}`);

    if (user.workspaces.length > 0) {
      console.log(`   \n   Owned Workspaces:`);
      user.workspaces.forEach((ws) => {
        console.log(`     • ${ws.name} (${ws.id})`);
      });
    }

    if (user.memberships.length > 0) {
      console.log(`   \n   Member of Workspaces:`);
      user.memberships.forEach((m) => {
        console.log(`     • ${m.workspace.name} (${m.role})`);
      });
    }
  });

  console.log("\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
