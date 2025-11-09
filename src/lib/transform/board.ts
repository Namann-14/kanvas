import { Board, Column, Task } from "@prisma/client";

type BoardWithRelations = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};

export function transformBoard(board: BoardWithRelations) {
  return board.columns.map((col) => ({
    id: col.id,
    title: col.name,
    cards: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
    })),
  }));
}
