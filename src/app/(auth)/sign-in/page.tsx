"use client";

import SignIn from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { client } from "@/lib/auth-client";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect } from "react";
// import { toast } from "sonner";
// import { getCallbackURL } from "@/lib/shared";

export default function Page() {
  // const router = useRouter();
  // const params = useSearchParams();

  // Google One Tap disabled due to FedCM requirements
  // Use the "Continue with Google" button instead for reliable OAuth flow
  /*
  useEffect(() => {
    client.oneTap({
      fetchOptions: {
        onError: ({ error }) => {
          // Silently fail for FedCM and credential errors (these are expected when FedCM is not properly configured)
          const isFedCMError = error.message?.includes('FedCM') || 
                               error.message?.includes('IdentityCredentialError') ||
                               error.message?.includes('AbortError') ||
                               error.message?.includes('retrieving a token');
          
          if (!isFedCMError) {
            toast.error(error.message || "An error occurred");
          }
        },
        onSuccess: () => {
          toast.success("Successfully signed in");
          router.push(getCallbackURL(params));
        },
      },
    });
  }, [router, params]);
  */

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Kanvas</h1>
        <p className="text-muted-foreground">
          Sign in to your account or create a new one
        </p>
      </div>

      <Tabs defaultValue="sign-in" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <SignIn />
        </TabsContent>
        <TabsContent value="sign-up">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  );
}
