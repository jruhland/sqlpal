import { type LoaderFunctionArgs, Outlet, redirect } from "react-router";
import { auth } from "~/auth.server";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

import type { Route } from "./+types/route";
import { AppSidebar } from "./app-sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession(request);
  if (!session) throw redirect("/login");

  return { user: session.user };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "var(--sidebar-width-icon)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
