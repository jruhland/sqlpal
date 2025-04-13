"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo } from "react";
import { useCookieState } from "use-cookie-state";
import { ConnectionIcon } from "~/components/connection-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { connections } from "~/db/schema.server";

type ConnectionSelectorProps = {
  connections: Pick<
    typeof connections.$inferSelect,
    "id" | "name" | "driver"
  >[];
};

export function ConnectionSelector({ connections }: ConnectionSelectorProps) {
  const [selectedConnectionId, setSelectedConnectionId] = useCookieState(
    "selectedConnectionId",
    null,
  );

  const selectedConnection = useMemo(
    () =>
      connections.find((connection) => connection.id === selectedConnectionId),
    [connections, selectedConnectionId],
  );

  if (connections.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <div>Configure a connection to get started</div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {selectedConnection && (
                <>
                  <div className="flex aspect-square size-2 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <ConnectionIcon
                      driver={selectedConnection.driver}
                      className="size-4"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">
                      {selectedConnection.name}
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[calc(var(--sidebar-width))]"
            align="start"
          >
            {connections.map((connection) => (
              <DropdownMenuItem
                key={connection.id}
                onSelect={async () => setSelectedConnectionId(connection.id)}
              >
                <ConnectionIcon driver={connection.driver} className="size-4" />
                {connection.name}
                {connection.id === selectedConnectionId && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
