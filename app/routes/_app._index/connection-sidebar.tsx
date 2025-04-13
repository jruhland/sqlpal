import { ChevronRight, Database, TableIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "~/components/ui/sidebar";
import type {
  Column,
  Schema,
  SchemaQueryResults,
  Table,
} from "~/lib/drivers/utils";
import { ConnectionSelector } from "./connection-selector";

type ConnectionSidebarProps = Parameters<typeof ConnectionSelector>[0] & {
  schemas: SchemaQueryResults | undefined;
};

export function ConnectionSidebar({
  connections,
  schemas: schemasProp,
}: ConnectionSidebarProps) {
  if (!schemasProp) {
    return null;
  }

  const schemas = "schemas" in schemasProp ? schemasProp.schemas : undefined;
  const tables = "tables" in schemasProp ? schemasProp.tables : undefined;

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b">
        <ConnectionSelector connections={connections} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu className="text-sm">
              {Array.isArray(schemas)
                ? schemas.map((schema) => (
                    <Tree key={schema.name} item={schema} />
                  ))
                : null}

              {Array.isArray(tables)
                ? tables.map((table) => <Tree key={table.name} item={table} />)
                : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Tree({ item }: { item: Schema | Table | Column }) {
  const isSchema = "tables" in item;
  const isTable = "columns" in item;
  const isColumn = !isSchema && !isTable;

  const { name } = item;

  if (isColumn) {
    return (
      <SidebarMenuButton asChild>
        <div className="data-[active=true]:bg-transparent text-xs gap-1 w-full">
          {name}
          <span className="text-xs text-muted-foreground uppercase">
            ({item.dataType})
          </span>
        </div>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={false}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="text-xs gap-1 w-full">
            <ChevronRight className="transition-transform" />
            {isTable ? <TableIcon /> : <Database />}
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {isSchema &&
              item.tables.map((subItem: Table) => (
                <Tree key={subItem.name} item={subItem} />
              ))}
            {isTable &&
              item.columns.map((subItem: Column) => (
                <Tree key={subItem.name} item={subItem} />
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
