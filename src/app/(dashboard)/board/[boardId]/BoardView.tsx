"use client";

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { transformBoardToKanban } from "@/lib/transform/kanban";
import { useState } from "react";
import { Board, Column, Task } from "@prisma/client";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { useRouter } from "next/navigation";

type BoardWithRelations = Board & {
  workspace: {
    id: string;
    name: string;
  };
  columns: (Column & {
    tasks: Task[];
  })[];
};

export default function BoardView({ board }: { board: BoardWithRelations }) {
  const { columns, tasks } = transformBoardToKanban(board);
  const router = useRouter();

  const [data, setData] = useState(tasks);

  const handleDataChange = async (updated: typeof tasks) => {
    const previous = data;
    setData(updated);

    try {
      // Detect if a task moved to a different column
      const movedTask = updated.find((task) => {
        const prevTask = previous.find((t) => t.id === task.id);
        return prevTask && prevTask.column !== task.column;
      });

      if (movedTask) {
        // Cross-column move
        const newColumnTasks = updated.filter(
          (t) => t.column === movedTask.column,
        );
        const newIndex = newColumnTasks.findIndex((t) => t.id === movedTask.id);

        await fetch("/api/tasks/move", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: board.workspace.id,
            taskId: movedTask.id,
            toColumnId: movedTask.column,
            newIndex,
          }),
        });
      } else {
        // Reorder within the same column
        // Find which column was reordered by comparing positions
        for (const column of columns) {
          const currentColumnTasks = updated.filter(
            (t) => t.column === column.id,
          );
          const previousColumnTasks = previous.filter(
            (t) => t.column === column.id,
          );

          // Check if order changed
          const orderChanged = currentColumnTasks.some(
            (task, index) => task.id !== previousColumnTasks[index]?.id,
          );

          if (orderChanged) {
            await fetch("/api/tasks/reorder", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceId: board.workspace.id,
                columnId: column.id,
                taskOrder: currentColumnTasks.map((t) => t.id),
              }),
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      setData(previous);
    }
  };

  return (
    <div className="px-8 py-4">
      <KanbanProvider
        columns={columns}
        data={data}
        onDataChange={handleDataChange}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>

            <AddTaskDialog
              columnId={column.id}
              workspaceId={board.workspace.id}
              onTaskAdded={() => router.refresh()}
            />

            <KanbanCards id={column.id}>
              {(task: (typeof tasks)[number]) => (
                <KanbanCard
                  key={task.id}
                  id={task.id}
                  column={column.id}
                  name={task.name}
                >
                  <p className="text-sm font-medium">{task.name}</p>
                  {task.description && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {task.description}
                    </p>
                  )}
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
