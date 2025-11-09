import { db } from "@/lib/db";

export async function getBoard(boardId: string) {
  const board = await db.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: true,
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  return board;
}
