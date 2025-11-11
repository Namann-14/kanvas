"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Column = {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks: Task[];
};

export type Board = {
  id: string;
  name: string;
  workspaceId: string;
  columns: Column[];
};

type PendingUpdate = {
  taskId: string;
  columnId: string;
  position: number;
  timestamp: number;
};

type KanbanContextType = {
  board: Board | null;
  isLoading: boolean;
  isSyncing: boolean;
  moveTask: (taskId: string, newColumnId: string, newPosition: number) => void;
  createTask: (
    columnId: string,
    title: string,
    description?: string,
  ) => Promise<void>;
  createColumn: (name: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  forceSync: () => Promise<void>;
};

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = "kanban-board-";
const PENDING_UPDATES_KEY = "kanban-pending-updates-";
const SYNC_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

export function KanbanProvider({
  children,
  initialBoard,
  workspaceId,
}: {
  children: React.ReactNode;
  initialBoard: Board | null;
  workspaceId: string;
}) {
  const [board, setBoard] = useState<Board | null>(initialBoard);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const storageKey = `${STORAGE_KEY_PREFIX}${workspaceId}`;
  const pendingKey = `${PENDING_UPDATES_KEY}${workspaceId}`;

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(storageKey);
    const storedPending = localStorage.getItem(pendingKey);

    if (stored) {
      try {
        const parsedBoard = JSON.parse(stored);
        setBoard(parsedBoard);
      } catch (error) {
        console.error("Error parsing stored board:", error);
      }
    }

    if (storedPending) {
      try {
        const parsed = JSON.parse(storedPending);
        setPendingUpdates(parsed);
      } catch (error) {
        console.error("Error parsing pending updates:", error);
      }
    }
  }, [storageKey, pendingKey]);

  // Save to localStorage whenever board changes
  useEffect(() => {
    if (typeof window === "undefined" || !board) return;
    localStorage.setItem(storageKey, JSON.stringify(board));
  }, [board, storageKey]);

  // Save pending updates to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(pendingKey, JSON.stringify(pendingUpdates));
  }, [pendingUpdates, pendingKey]);

  // Sync with database
  const syncWithDatabase = useCallback(async () => {
    if (pendingUpdates.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      const response = await fetch("/api/tasks/batch-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: pendingUpdates }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync with database");
      }

      // Clear pending updates on successful sync
      setPendingUpdates([]);
      retryCountRef.current = 0;

      console.log(`✅ Synced ${pendingUpdates.length} task updates`);
    } catch (error) {
      console.error("Error syncing with database:", error);
      retryCountRef.current += 1;

      if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
        toast.error("Failed to sync changes. Please refresh the page.");
        retryCountRef.current = 0;
      }
    } finally {
      setIsSyncing(false);
    }
  }, [pendingUpdates, isSyncing]);

  // Set up periodic sync
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      syncWithDatabase();
    }, SYNC_INTERVAL);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncWithDatabase]);

  // Sync before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingUpdates.length > 0) {
        // Use sendBeacon for more reliable sync on page unload
        const blob = new Blob([JSON.stringify({ updates: pendingUpdates })], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/tasks/batch-update", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pendingUpdates]);

  const moveTask = useCallback(
    (taskId: string, newColumnId: string, newPosition: number) => {
      if (!board) return;

      setBoard((prevBoard) => {
        if (!prevBoard) return prevBoard;

        const newColumns = prevBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }));

        const task = prevBoard.columns
          .flatMap((col) => col.tasks)
          .find((t) => t.id === taskId);

        if (!task) return prevBoard;

        const targetColumn = newColumns.find((col) => col.id === newColumnId);
        if (!targetColumn) return prevBoard;

        const updatedTask = {
          ...task,
          columnId: newColumnId,
          position: newPosition,
        };
        targetColumn.tasks.splice(newPosition, 0, updatedTask);

        // Recalculate positions
        targetColumn.tasks.forEach((t, index) => {
          t.position = index;
        });

        return { ...prevBoard, columns: newColumns };
      });

      // Add to pending updates
      setPendingUpdates((prev) => [
        ...prev.filter((u) => u.taskId !== taskId), // Remove old update for this task
        {
          taskId,
          columnId: newColumnId,
          position: newPosition,
          timestamp: Date.now(),
        },
      ]);
    },
    [board],
  );

  const createTask = useCallback(
    async (columnId: string, title: string, description?: string) => {
      if (!board) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId,
            title,
            description: description || null,
            workspaceId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        const newTask = await response.json();

        setBoard((prevBoard) => {
          if (!prevBoard) return prevBoard;

          const newColumns = prevBoard.columns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: [...column.tasks, newTask],
              };
            }
            return column;
          });

          return { ...prevBoard, columns: newColumns };
        });

        toast.success("Task created successfully");
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task");
      } finally {
        setIsLoading(false);
      }
    },
    [board, workspaceId],
  );

  const createColumn = useCallback(
    async (name: string) => {
      if (!board) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boardId: board.id,
            name,
            position: board.columns.length,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create column");
        }

        const newColumn = await response.json();

        setBoard((prevBoard) => {
          if (!prevBoard) return prevBoard;
          return {
            ...prevBoard,
            columns: [...prevBoard.columns, { ...newColumn, tasks: [] }],
          };
        });

        toast.success("Column created successfully");
      } catch (error) {
        console.error("Error creating column:", error);
        toast.error("Failed to create column");
      } finally {
        setIsLoading(false);
      }
    },
    [board],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!board) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        setBoard((prevBoard) => {
          if (!prevBoard) return prevBoard;

          const newColumns = prevBoard.columns.map((column) => ({
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }));

          return { ...prevBoard, columns: newColumns };
        });

        toast.success("Task deleted successfully");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      } finally {
        setIsLoading(false);
      }
    },
    [board],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!board) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();

        setBoard((prevBoard) => {
          if (!prevBoard) return prevBoard;

          const newColumns = prevBoard.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updatedTask } : task,
            ),
          }));

          return { ...prevBoard, columns: newColumns };
        });

        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
      } finally {
        setIsLoading(false);
      }
    },
    [board],
  );

  const forceSync = useCallback(async () => {
    await syncWithDatabase();
  }, [syncWithDatabase]);

  return (
    <KanbanContext.Provider
      value={{
        board,
        isLoading,
        isSyncing,
        moveTask,
        createTask,
        createColumn,
        deleteTask,
        updateTask,
        forceSync,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}
