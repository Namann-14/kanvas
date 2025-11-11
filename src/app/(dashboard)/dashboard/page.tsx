import { getWorkspaceBoard } from "@/lib/queries/get-workspace-board";
import { getCurrentWorkspace } from "@/lib/actions/workspace-actions";
import { KanbanProvider } from "@/contexts/kanban-context";
import { KanbanBoardView } from "@/components/dashboard/kanban-board-view";

export default async function DashboardPage() {
  const currentWorkspaceId = await getCurrentWorkspace();

  if (!currentWorkspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">No workspace selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select or create a workspace to get started
          </p>
        </div>
      </div>
    );
  }

  const board = await getWorkspaceBoard(currentWorkspaceId);

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">No board found</h2>
          <p className="text-muted-foreground mb-4">
            This workspace doesn&apos;t have a board yet
          </p>
          <p className="text-muted-foreground text-sm">
            Create a new board to get started with task management
          </p>
        </div>
      </div>
    );
  }

  return (
    <KanbanProvider
      initialBoard={{
        id: board.id,
        name: board.name,
        workspaceId: board.workspaceId,
        columns: board.Column.map((col) => ({
          id: col.id,
          name: col.name,
          position: col.position,
          boardId: col.boardId,
          tasks: col.Task.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            position: task.position,
            columnId: task.columnId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          })),
        })),
      }}
      workspaceId={currentWorkspaceId}
    >
      <KanbanBoardView />
    </KanbanProvider>
  );
}
