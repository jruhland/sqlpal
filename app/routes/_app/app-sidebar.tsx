import { Code, Cog, Command, DatabaseZap, ShieldEllipsis } from "lucide-react";

import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { users } from "~/db/auth-schema.server";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "./theme-toggle";

const navItems = {
  navMain: [
    {
      title: "Editor",
      url: "/",
      icon: Code,
    },
    {
      title: "Queries",
      url: "/queries",
      icon: DatabaseZap,
    },
  ],
  navAdmin: [
    {
      title: "Audit Log",
      url: "/audit-log",
      icon: ShieldEllipsis,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Cog,
    },
  ],
};

type AppSidebarProps = {
  user: Pick<typeof users.$inferSelect, "id" | "name" | "email"> & {
    image?: Pick<typeof users.$inferSelect, "image">["image"];
  };
};

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link to="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <NavSection items={navItems.navMain} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavSection items={navItems.navAdmin} />
          <ThemeToggle />
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  );
}

function NavSection({
  items,
}: { items: { title: string; url: string; icon: React.ElementType }[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            tooltip={{
              children: item.title,
              hidden: false,
            }}
            className="px-2.5 md:px-2"
          >
            <Link to={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
