"use client";

import React, { useState } from "react";
import { Plus, MoreVertical, Loader2, Cloud, CloudOff } from "lucide-react";
import { useKanban } from "@/contexts/kanban-context";
import {
  KanbanProvider as DndKanbanProvider,
  KanbanBoard as DndKanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  type DragEndEvent,
} from "@/components/kibo-ui/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function KanbanBoardView() {
  const {
    board,
    isLoading,
    isSyncing,
    moveTask,
    createTask,
    createColumn,
    deleteTask,
    forceSync,
  } = useKanban();

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newColumnName, setNewColumnName] = useState("");

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">No board found</h2>
          <p className="text-muted-foreground">
            Please create a workspace to get started.
          </p>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const task = board.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);

    if (!task) return;

    // Find the target column
    let targetColumnId: string;
    let targetPosition: number;

    // Check if dropped on a task
    const targetTask = board.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === over.id);

    if (targetTask) {
      targetColumnId = targetTask.columnId;
      targetPosition = targetTask.position;
    } else {
      // Dropped on a column
      targetColumnId = over.id as string;
      const targetColumn = board.columns.find(
        (col) => col.id === targetColumnId,
      );
      targetPosition = targetColumn?.tasks.length || 0;
    }

    moveTask(taskId, targetColumnId, targetPosition);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedColumnId) return;

    await createTask(selectedColumnId, newTaskTitle, newTaskDescription);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsCreateTaskOpen(false);
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;

    await createColumn(newColumnName);
    setNewColumnName("");
    setIsCreateColumnOpen(false);
  };

  const openCreateTaskDialog = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsCreateTaskOpen(true);
  };

  // Transform data for the kanban component
  const kanbanColumns = board.columns.map((col) => ({
    id: col.id,
    name: col.name,
  }));

  const kanbanTasks = board.columns.flatMap((col) =>
    col.tasks.map((task) => ({
      id: task.id,
      name: task.title,
      column: col.id,
      description: task.description,
    })),
  );

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Drag and drop tasks to organize your work
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            {isSyncing ? (
              <>
                <Cloud className="h-4 w-4 animate-pulse" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4" />
                <span>All changes saved locally</span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={forceSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sync Now"
            )}
          </Button>
          <Dialog
            open={isCreateColumnOpen}
            onOpenChange={setIsCreateColumnOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Column</DialogTitle>
                <DialogDescription>
                  Add a new column to organize your tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="column-name">Column Name</Label>
                  <Input
                    id="column-name"
                    placeholder="e.g., To Do, In Progress, Done"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateColumn();
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateColumnOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateColumn}
                  disabled={!newColumnName.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Column"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndKanbanProvider
          columns={kanbanColumns}
          data={kanbanTasks}
          onDragEnd={handleDragEnd}
          className="h-full"
        >
          {(column) => (
            <DndKanbanBoard key={column.id} id={column.id} className="h-full">
              <KanbanHeader className="flex items-center justify-between">
                <span className="font-semibold">
                  {column.name}
                  <span className="text-muted-foreground ml-2">
                    (
                    {board.columns.find((c) => c.id === column.id)?.tasks
                      .length || 0}
                    )
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => openCreateTaskDialog(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openCreateTaskDialog(column.id)}
                      >
                        Add Task
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Column</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </KanbanHeader>

              <KanbanCards id={column.id}>
                {(task: (typeof kanbanTasks)[number]) => (
                  <KanbanCard
                    key={task.id}
                    id={task.id}
                    column={task.column}
                    name={task.name}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex-1 text-sm font-medium">
                          {task.name}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteTask(task.id)}
                            >
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </KanbanCard>
                )}
              </KanbanCards>
            </DndKanbanBoard>
          )}
        </DndKanbanProvider>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description"
                value={newTaskDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewTaskDescription(e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateTaskOpen(false);
                setNewTaskTitle("");
                setNewTaskDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
