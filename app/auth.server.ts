import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, genericOAuth, oAuthProxy } from "better-auth/plugins";
import * as authSchema from "~/db/auth-schema.server";
import { authConfig, config } from "~/lib/config.server";
import { db } from "~/lib/db.server";

export const auth = betterAuth({
  baseURL: config.BASE_URL,
  secret: config.ENCRYPTION_SECRET,
  cookie: {
    options: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    apiKey(),
    oAuthProxy(),
    genericOAuth({
      config: [
        {
          providerId: "default",
          clientId: authConfig.OAUTH_CLIENT_ID!,
          clientSecret: authConfig.OAUTH_CLIENT_SECRET!,
          discoveryUrl: authConfig.OAUTH_DISCOVERY_URL!,
        },
      ],
    }),
  ],
  socialProviders: {
    google: {
      clientId: authConfig.GOOGLE_CLIENT_ID!,
      clientSecret: authConfig.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: authConfig.GITHUB_CLIENT_ID!,
      clientSecret: authConfig.GITHUB_CLIENT_SECRET!,
    },
  },
});
