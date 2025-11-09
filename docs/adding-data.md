---
title: How to Add Real Data
description: Guide for adding data to your Kanban board
---

# How to Add Real Data to Your Kanban Board

## Your Database is Already Seeded!

You now have **real data** from your database. Access your board at:

```
http://localhost:3000/board/seed-board-1
```

## 🎯 Quick Commands

```bash
# View all boards and their data
npm run db:check

# Seed the database with sample data
npm run db:seed

# Open Prisma Studio (visual database editor)
npx prisma studio
```

---

## 📝 How to Add New Data

### Method 1: Using Prisma Studio (Visual UI) ⭐ Recommended

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   Opens at: http://localhost:5555

2. **Navigate through tables:**
   - **User** → Create users
   - **Workspace** → Create workspaces
   - **Board** → Create boards (link to workspace)
   - **Column** → Create columns (link to board)
   - **Task** → Create tasks (link to column)

3. **Add a new task:**
   - Click on "Task" table
   - Click "Add record"
   - Fill in:
     - `title`: "My new task"
     - `description`: "Task details"
     - `columnId`: Select from existing columns
     - `position`: 0 (or next position)
   - Click "Save 1 change"

### Method 2: Using API Routes (Programmatic)

Your app has existing API routes:

#### Create a Task
```typescript
POST /api/tasks

Body:
{
  "workspaceId": "seed-workspace-1",
  "columnId": "col-todo",
  "title": "New Task Title",
  "description": "Task description",
  "position": 0
}
```

#### Create a Column
```typescript
POST /api/columns

Body:
{
  "workspaceId": "seed-workspace-1",
  "boardId": "seed-board-1",
  "name": "New Column",
  "position": 4
}
```

#### Create a Board
```typescript
POST /api/boards

Body:
{
  "workspaceId": "seed-workspace-1",
  "name": "New Board Name"
}
```

### Method 3: Custom Seed Script

Edit `prisma/seed.ts` and add more data, then run:
```bash
npm run db:seed
```

### Method 4: Direct Prisma Client

Create a script in `scripts/add-data.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add a new task
  const newTask = await prisma.task.create({
    data: {
      title: "My Custom Task",
      description: "Created via script",
      columnId: "col-todo",
      position: 10,
    },
  });

  console.log("Created task:", newTask);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx tsx scripts/add-data.ts
```

---

## 🔍 Checking Your Data

### View all boards:
```bash
npm run db:check
```

### Query specific data:
```bash
npx prisma studio
```

### Check in your app:
Navigate to: `http://localhost:3000/board/seed-board-1`

---

## 🎨 Creating Multiple Boards

To test with multiple boards:

1. **Via Prisma Studio:**
   - Open http://localhost:5555
   - Go to "Board" table
   - Click "Add record"
   - Set: name, workspaceId
   - Add columns and tasks similarly

2. **Via Seed Script:**
   Add this to `prisma/seed.ts`:
   ```typescript
   const board2 = await prisma.board.create({
     data: {
       name: "Marketing Campaign",
       workspaceId: workspace.id,
       columns: {
         create: [
           {
             name: "Ideas",
             position: 0,
             tasks: {
               create: [
                 { title: "Brainstorm campaign", position: 0 },
                 { title: "Research competitors", position: 1 },
               ],
             },
           },
         ],
       },
     },
   });
   ```

---

## 🚀 Next Steps

Your board is now connected to **real database data**!

Every drag-and-drop action:
- ✅ Updates React state (optimistic UI)
- ✅ Calls your API (`/api/tasks/move` or `/api/tasks/reorder`)
- ✅ Persists to database
- ✅ Rolls back on error

### Want to add more features?

- **A: Task Detail Modal** - Click to edit tasks
- **B: User Assignments** - Assign users to tasks
- **C: Create/Delete UI** - Add tasks directly from the board
- **D: Realtime Sync** - See changes from other users instantly

Reply with your choice! 🎯
