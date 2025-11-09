import { Board, Column, Task } from "@prisma/client";

type BoardWithRelations = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};

export function transformBoardToKanban(board: BoardWithRelations) {
  const columns = board.columns.map((col) => ({
    id: col.id,
    name: col.name,
    color: "#3f3f3f", // optional — you can store this later
  }));

  const tasks = board.columns.flatMap((col) =>
    col.tasks.map((task) => ({
      id: task.id,
      name: task.title,
      column: col.id,
      description: task.description ?? "",
      owner: null, // you can add assignees later
    })),
  );

  return { columns, tasks };
}
