"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateWorkspaceDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (workspaceId: string) => void;
}

export function CreateWorkspaceDialog({
  trigger,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [workspaceName, setWorkspaceName] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create organization");
      }

      const workspace = await response.json();

      toast.success("Organization created successfully!");
      setOpen(false);
      setWorkspaceName("");

      if (onSuccess) {
        onSuccess(workspace.id);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create organization",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Building2 className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Create New Organization
            </DialogTitle>
            <DialogDescription className="text-center">
              Organizations help you manage multiple teams and projects in one
              place. Give your organization a name to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Organization Name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g., Acme Inc, My Company"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={isLoading}
                autoFocus
                required
                maxLength={100}
              />
              <p className="text-muted-foreground text-xs">
                You can always change this later in settings.
              </p>
            </div>

            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-medium">
                What you&apos;ll get:
              </h4>
              <ul className="text-muted-foreground space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Dedicated workspace for your team</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Multiple boards and projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Invite team members and collaborate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Full control as organization owner</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !workspaceName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
