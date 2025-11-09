import { getFirstBoard } from "@/lib/queries/get-first-board";
import BoardView from "../board/[boardId]/BoardView";

export default async function DashboardPage() {
  const board = await getFirstBoard();

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">No boards found</h2>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first board
          </p>
          <p className="text-muted-foreground text-sm">
            Run:{" "}
            <code className="bg-muted rounded px-2 py-1">npm run db:seed</code>
          </p>
        </div>
      </div>
    );
  }

  return <BoardView board={board} />;
}
