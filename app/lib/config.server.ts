import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  BASE_URL: z.string().url(),
  SESSION_SECRET: z.string({
    required_error: "SESSION_SECRET is required",
  }),
  ENCRYPTION_SECRET: z
    .string({
      required_error: "ENCRYPTION_SECRET is required",
    })
    .regex(/^[a-zA-Z0-9]{32}$/, {
      message:
        "ENCRYPTION_SECRET must be a hex string of at least 32 characters (`openssl rand -hex 16`)",
    }),
  AUTH_PROVIDER: z
    .enum(["oauth", "password", "google", "github"])
    .default("password"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OAUTH_PROVIDER_ID: z.string().optional(),
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  OAUTH_DISCOVERY_URL: z.string().url().optional(),
});

export const config = configSchema.parse(process.env);

const oauthSchema = z.object({
  AUTH_PROVIDER: z.literal("oauth"),
  OAUTH_CLIENT_ID: z.string(),
  OAUTH_CLIENT_SECRET: z.string(),
  OAUTH_DISCOVERY_URL: z.string().url().optional(),
});

const passwordSchema = z.object({
  AUTH_PROVIDER: z.literal("password"),
  REQUIRED_PASSWORD_LENGTH: z.number().min(8).optional().default(8),
});

const googleSchema = z.object({
  AUTH_PROVIDER: z.literal("google"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

const githubSchema = z.object({
  AUTH_PROVIDER: z.literal("github"),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
});

const authConfigSchema = z.discriminatedUnion("AUTH_PROVIDER", [
  oauthSchema,
  passwordSchema,
  googleSchema,
  githubSchema,
]);

export let authConfig: z.infer<typeof authConfigSchema>;
switch (config.AUTH_PROVIDER) {
  case "oauth":
    authConfig = oauthSchema.parse(config);
    break;
  case "password":
    authConfig = passwordSchema.parse(config);
    break;
  case "google":
    authConfig = googleSchema.parse(config);
    break;
  case "github":
    authConfig = githubSchema.parse(config);
    break;
}
