import { useCallback } from "react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  data,
  redirect,
} from "react-router";
import { z } from "zod";
import { GithubIcon } from "~/components/icons/github";
import { GoogleIcon } from "~/components/icons/google";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";
import { authConfig } from "~/lib/config.server";
import type { Route } from "./+types/route";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") ?? "/";

  return {
    authStrategy: authConfig.AUTH_PROVIDER,
    redirectTo,
  };
}

export default function LoginPage({ loaderData }: Route.ComponentProps) {
  const { authStrategy, redirectTo } = loaderData;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const { email, password } = schema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      });
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message, { cause: error.code });
      }

      redirect(redirectTo);
    },
    [redirectTo],
  );

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {authStrategy === "password" && (
            <Form
              method="POST"
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="cursor-pointer w-full">
                  Login
                </Button>
              </div>
            </Form>
          )}
          {authStrategy === "oauth" && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="cursor-pointer w-full"
                onClick={() => {
                  authClient.signIn.oauth2({
                    providerId: "default",
                    callbackURL: redirectTo,
                  });
                }}
              >
                Login with SSO
              </Button>
            </div>
          )}
          {authStrategy === "google" && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="cursor-pointer w-full"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: redirectTo,
                  });
                }}
              >
                <GoogleIcon />
                Login with Google
              </Button>
            </div>
          )}
          {authStrategy === "github" && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="cursor-pointer w-full"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "github",
                    callbackURL: redirectTo,
                  });
                }}
              >
                <GithubIcon />
                Login with GitHub
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
