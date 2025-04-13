import { parseWithZod } from "@conform-to/zod";
import { TrashIcon } from "lucide-react";
import { PencilIcon } from "lucide-react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { z } from "zod";
import { auth } from "~/auth.server";
import { ConnectionIcon } from "~/components/connection-icon";
import { Button } from "~/components/ui/button";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { connections } from "~/db/schema.server";
import { db } from "~/lib/db.server";
import { createConnectionSchema } from "~/modules/connections";
import { createConnection } from "~/modules/connections.server";
import type { Route } from "./+types/route";
import { ConnectionForm } from "./connection-form";
import { SettingsSidebar } from "./settings-sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession(request);
  if (!session) throw redirect("/login");

  if (session.user.role !== "admin") throw redirect("/");

  const conns = await db.select().from(connections);
  return { conns };
}

const actionSchema = z.object({
  intent: z.enum(["create-connection", "edit-connection", "delete-connection"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const form = parseWithZod(formData, { schema: actionSchema });
  if (form.status !== "success") return form.reply();

  const { intent } = form.value;
  if (intent === "create-connection") {
    const submission = parseWithZod(formData, {
      schema: createConnectionSchema,
    });
    if (submission.status !== "success") return submission.reply();
    try {
      await createConnection(submission.value);
      return submission.reply({
        resetForm: true,
      });
    } catch (error) {
      return submission.reply({
        formErrors: ["Failed to create connection"],
      });
    }
  }
}

export default function SettingsLayout({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const { conns } = loaderData;
  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset>
        <div className="flex flex-col mt-4">
          <div className="w-lg mx-auto flex flex-col gap-3">
            <h2 className="text-2xl font-bold" id="connections">
              Connections
            </h2>
            <ConnectionForm
              actionData={actionData}
              intent="create-connection"
            />
            <div className="space-y-2">
              {conns.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ConnectionIcon className="h-5 w-5" driver={conn.driver} />
                    <span className="font-medium">{conn.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
