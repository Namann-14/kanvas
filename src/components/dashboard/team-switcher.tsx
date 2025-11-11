"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setCurrentWorkspace } from "@/lib/actions/workspace-actions";
import { toast } from "sonner";
import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  role?: string;
};

export function TeamSwitcher({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const activeWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) return;

    setIsLoading(true);
    try {
      await setCurrentWorkspace(workspaceId);
      toast.success("Workspace switched successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to switch workspace:", error);
      toast.error("Failed to switch workspace");
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeWorkspace) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isLoading}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {activeWorkspace.role === "owner" ? "Owner" : "Member"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSwitch(workspace.id)}
                className="gap-2 p-2"
                disabled={isLoading || workspace.id === currentWorkspaceId}
              >
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium">{workspace.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {workspace.role === "owner" ? "Owner" : "Member"}
                  </span>
                </div>
                {workspace.id === currentWorkspaceId && (
                  <span className="ml-auto text-xs">✓</span>
                )}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateWorkspaceDialog
              trigger={
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Create organization
                  </div>
                </DropdownMenuItem>
              }
              onSuccess={async (workspaceId) => {
                await handleWorkspaceSwitch(workspaceId);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
