import { parseWithZod } from "@conform-to/zod";
import { Cookie } from "@mjackson/headers";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useFetcher,
} from "react-router";
import { useCookieState } from "use-cookie-state";
import { z } from "zod";
import { Editor } from "~/components/editor";
import { ResizableHandle } from "~/components/ui/resizable";
import { ResizablePanelGroup } from "~/components/ui/resizable";
import { ResizablePanel } from "~/components/ui/resizable";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import {
  type ConnectionConfig,
  connectionManager,
} from "~/lib/connection-manager.server";
import { getConnection, listConnections } from "~/modules/connections.server";
import type { Route } from "./+types/route";
import { ConnectionSidebar } from "./connection-sidebar";
import { ResultsTable } from "./results-table";

export async function loader({ request }: LoaderFunctionArgs) {
  const conns = await listConnections();
  if (conns.length === 0) {
    return { conns: [], schema: {} };
  }

  const cookies = new Cookie(request.headers.get("Cookie") ?? "");
  const selectedConnectionId = cookies.get("selectedConnectionId");
  let selectedConn = conns.find((c) => c.id === selectedConnectionId);
  if (!selectedConn) {
    selectedConn = conns[0];
    cookies.set("selectedConnectionId", selectedConn.id);
  }

  const conn = await connectionManager.getConnection(
    selectedConn.id,
    selectedConn.config as ConnectionConfig,
  );
  const schemas = await conn.getSchemaInformation();
  return { conns, schemas };
}

const querySchema = z.object({
  statement: z.string(),
  connectionId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: querySchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { statement, connectionId } = submission.value;
  const conn = await getConnection(connectionId);
  if (!conn) {
    return submission.reply({
      formErrors: ["Connection not found"],
    });
  }

  const client = await connectionManager.getConnection(
    connectionId as string,
    conn.config as ConnectionConfig,
  );
  return client.query(statement);
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const [selectedConnectionId, _] = useCookieState("selectedConnectionId", "");
  const { conns, schemas } = loaderData;
  const fetcher = useFetcher<typeof action>();

  return (
    <SidebarProvider>
      <ConnectionSidebar connections={conns} schemas={schemas} />
      <SidebarInset className="p-4">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60}>
            <Editor
              connection={
                conns.find((c) => c.id === selectedConnectionId) ?? {
                  id: "undefined",
                  driver: "sqlite",
                }
              }
              onSubmit={({
                connectionId,
                statement,
              }: { connectionId: string; statement: string }) =>
                fetcher.submit({ connectionId, statement }, { method: "POST" })
              }
              schemas={schemas}
            />
          </ResizablePanel>
          {fetcher.data && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={40}>
                {"rows" in fetcher.data && (
                  <ResultsTable rows={fetcher.data.rows} />
                )}
                {"error" in fetcher.data && (
                  <div className="w-full text-red-500">
                    {fetcher.data.error}
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  );
}
