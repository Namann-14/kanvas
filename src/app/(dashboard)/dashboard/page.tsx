import { Suspense } from "react";
import { getWorkspaceBoard } from "@/lib/queries/get-workspace-board";
import { getCurrentWorkspace } from "@/lib/actions/workspace-actions";
import { KanbanProvider } from "@/contexts/kanban-context";
import { KanbanBoardView } from "@/components/dashboard/kanban-board-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

function KanbanBoardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingBoard() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading your board...</p>
      </div>
    </div>
  );
}

async function KanbanBoardContent() {
  const currentWorkspaceId = await getCurrentWorkspace();
  console.log("🔍 Current Workspace ID:", currentWorkspaceId);

  if (!currentWorkspaceId) {
    console.log("⚠️ No workspace ID found in cookie");
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
  console.log(
    "📋 Board data:",
    board
      ? { id: board.id, name: board.name, columnsCount: board.Column.length }
      : null,
  );

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<KanbanBoardSkeleton />}>
      <KanbanBoardContent />
    </Suspense>
  );
}
