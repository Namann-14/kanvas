import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n📊 Checking database contents...\n");

  const boards = await prisma.board.findMany({
    include: {
      Workspace: true,
      Column: {
        include: {
          Task: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (boards.length === 0) {
    console.log("❌ No boards found in database!");
    console.log("💡 Run: npm run db:seed");
    return;
  }

  boards.forEach((board) => {
    console.log(`\n🎯 Board: ${board.name}`);
    console.log(`   ID: ${board.id}`);
    console.log(`   Workspace: ${board.Workspace.name}`);
    console.log(`   🔗 Access at: http://localhost:3000/board/${board.id}\n`);

    board.Column.forEach((column) => {
      console.log(`   📋 ${column.name} (${column.Task.length} tasks)`);
      column.Task.forEach((task) => {
        console.log(`      • ${task.title}`);
      });
    });
  });

  console.log(`\n✅ Total: ${boards.length} board(s) found\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
