import { createAuthClient } from "better-auth/react";
import {
  passkeyClient,
  twoFactorClient,
  adminClient,
  multiSessionClient,
  oneTapClient,
  oidcClient,
  genericOAuthClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { toast } from "sonner";

export const client = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    passkeyClient(),
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      context: "signin",
      promptOptions: { maxAttempts: 5 },
    }),
    oidcClient(),
    genericOAuthClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const { signUp, signIn, signOut, useSession } = client;
