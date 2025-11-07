"use client";

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { Suspense, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const columns = [
  { id: "planned", name: "Planned", color: "#6B7280" },
  { id: "in-progress", name: "In Progress", color: "#F59E0B" },
  { id: "done", name: "Done", color: "#10B981" },
];

const users = [
  {
    id: "user-1",
    name: "Alice Johnson",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  },
  {
    id: "user-2",
    name: "Bob Smith",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  },
  {
    id: "user-3",
    name: "Carol Williams",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
  },
  {
    id: "user-4",
    name: "David Brown",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
];

const exampleFeatures = [
  {
    id: "task-1",
    name: "Design new landing page",
    startAt: new Date("2024-10-15"),
    endAt: new Date("2025-01-20"),
    column: "planned",
    owner: users[0],
  },
  {
    id: "task-2",
    name: "Implement user authentication",
    startAt: new Date("2024-11-01"),
    endAt: new Date("2025-02-10"),
    column: "planned",
    owner: users[1],
  },
  {
    id: "task-3",
    name: "Set up database schema",
    startAt: new Date("2024-10-20"),
    endAt: new Date("2025-01-15"),
    column: "planned",
    owner: users[2],
  },
  {
    id: "task-4",
    name: "Create API endpoints",
    startAt: new Date("2024-11-05"),
    endAt: new Date("2025-02-28"),
    column: "in-progress",
    owner: users[0],
  },
  {
    id: "task-5",
    name: "Build dashboard UI",
    startAt: new Date("2024-10-25"),
    endAt: new Date("2025-01-30"),
    column: "in-progress",
    owner: users[3],
  },
  {
    id: "task-6",
    name: "Integrate payment system",
    startAt: new Date("2024-11-10"),
    endAt: new Date("2025-03-15"),
    column: "in-progress",
    owner: users[1],
  },
  {
    id: "task-7",
    name: "Write unit tests",
    startAt: new Date("2024-10-30"),
    endAt: new Date("2025-02-05"),
    column: "in-progress",
    owner: users[2],
  },
  {
    id: "task-8",
    name: "Configure CI/CD pipeline",
    startAt: new Date("2024-09-15"),
    endAt: new Date("2024-10-30"),
    column: "done",
    owner: users[0],
  },
  {
    id: "task-9",
    name: "Set up project repository",
    startAt: new Date("2024-09-01"),
    endAt: new Date("2024-09-20"),
    column: "done",
    owner: users[3],
  },
  {
    id: "task-10",
    name: "Design system architecture",
    startAt: new Date("2024-09-10"),
    endAt: new Date("2024-10-15"),
    column: "done",
    owner: users[1],
  },
  {
    id: "task-11",
    name: "Setup development environment",
    startAt: new Date("2024-09-05"),
    endAt: new Date("2024-09-25"),
    column: "done",
    owner: users[2],
  },
  {
    id: "task-12",
    name: "Optimize performance",
    startAt: new Date("2024-11-15"),
    endAt: new Date("2025-03-20"),
    column: "planned",
    owner: users[3],
  },
  {
    id: "task-13",
    name: "Add analytics tracking",
    startAt: new Date("2024-11-08"),
    endAt: new Date("2025-02-25"),
    column: "in-progress",
    owner: users[0],
  },
  {
    id: "task-14",
    name: "Create mobile responsive design",
    startAt: new Date("2024-11-12"),
    endAt: new Date("2025-03-10"),
    column: "planned",
    owner: users[1],
  },
  {
    id: "task-15",
    name: "Implement search functionality",
    startAt: new Date("2024-11-03"),
    endAt: new Date("2025-02-18"),
    column: "in-progress",
    owner: users[2],
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const Example = () => {
  const [features, setFeatures] = useState(exampleFeatures);

  return (
    <div className="max-h-100% px-8 py-4">
      <Suspense fallback={<div>Loading...</div>}>
        <KanbanProvider
          columns={columns}
          data={features}
          onDataChange={setFeatures}
        >
          {(column) => (
            <KanbanBoard id={column.id} key={column.id} className="min-h-100%">
              <KanbanHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span>{column.name}</span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(feature: (typeof features)[number]) => (
                  <KanbanCard
                    column={column.id}
                    id={feature.id}
                    key={feature.id}
                    name={feature.name}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 text-sm font-medium">
                          {feature.name}
                        </p>
                      </div>
                      {feature.owner && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={feature.owner.image} />
                          <AvatarFallback>
                            {feature.owner.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="text-muted-foreground m-0 text-xs">
                      {shortDateFormatter.format(feature.startAt)} -{" "}
                      {dateFormatter.format(feature.endAt)}
                    </p>
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </Suspense>
    </div>
  );
};

export default Example;
