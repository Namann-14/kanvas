import { db } from "@/lib/db";

export async function getFirstBoard() {
  const board = await db.board.findFirst({
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
