import { getBoard } from "@/lib/queries/get-board";
import BoardView from "./BoardView";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const board = await getBoard(boardId);

  if (!board) return <div>Board not found</div>;

  return <BoardView board={board} />;
}
