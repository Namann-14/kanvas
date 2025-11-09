import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Use your actual email or get the first user
  const existingUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  let user = existingUser;

  if (!user) {
    // Create a test user only if no users exist
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
      },
    });
  }

  console.log("✅ Using user:", user.email);

  // Create a workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "seed-workspace-1" },
    update: {},
    create: {
      id: "seed-workspace-1",
      name: "My First Workspace",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  console.log("✅ Created workspace:", workspace.name);

  // Ensure the owner is also a member
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "owner",
    },
  });

  console.log("✅ Added owner as workspace member");

  // Create a board
  const board = await prisma.board.upsert({
    where: { id: "seed-board-1" },
    update: {},
    create: {
      id: "seed-board-1",
      name: "Project Management Board",
      workspaceId: workspace.id,
    },
  });

  console.log("✅ Created board:", board.name);

  // Create columns
  const columns = [
    { id: "col-todo", name: "To Do", position: 0 },
    { id: "col-progress", name: "In Progress", position: 1 },
    { id: "col-review", name: "Review", position: 2 },
    { id: "col-done", name: "Done", position: 3 },
  ];

  for (const col of columns) {
    await prisma.column.upsert({
      where: { id: col.id },
      update: {},
      create: {
        id: col.id,
        name: col.name,
        position: col.position,
        boardId: board.id,
      },
    });
    console.log(`✅ Created column: ${col.name}`);
  }

  // Create tasks
  const tasks = [
    {
      id: "task-1",
      title: "Setup authentication system",
      description: "Implement user login and registration",
      columnId: "col-todo",
      position: 0,
    },
    {
      id: "task-2",
      title: "Design database schema",
      description: "Create ERD and Prisma models",
      columnId: "col-todo",
      position: 1,
    },
    {
      id: "task-3",
      title: "Build REST API endpoints",
      description: "Create CRUD operations for boards and tasks",
      columnId: "col-progress",
      position: 0,
    },
    {
      id: "task-4",
      title: "Implement drag and drop",
      description: "Add kanban board functionality",
      columnId: "col-progress",
      position: 1,
    },
    {
      id: "task-5",
      title: "Code review API layer",
      description: "Review and test all endpoints",
      columnId: "col-review",
      position: 0,
    },
    {
      id: "task-6",
      title: "Setup project repository",
      description: "Initialize Git and configure CI/CD",
      columnId: "col-done",
      position: 0,
    },
    {
      id: "task-7",
      title: "Install dependencies",
      description: "Setup Next.js, Prisma, and other tools",
      columnId: "col-done",
      position: 1,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        columnId: task.columnId,
        position: task.position,
      },
    });
    console.log(`✅ Created task: ${task.title}`);
  }

  console.log("\n🎉 Seeding completed!");
  console.log(`\n📋 Your board ID: ${board.id}`);
  console.log(`🔗 Access it at: /board/${board.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
