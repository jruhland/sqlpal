import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), apiKeyClient(), genericOAuthClient()],
});
