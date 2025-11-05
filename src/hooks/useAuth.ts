"use client";
import { useSession, signOut } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending: loading } = useSession();
  return {
    user: session?.user ?? null,
    loading,
    signOut,
  };
}
