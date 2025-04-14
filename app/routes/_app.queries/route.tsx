import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { type LoaderFunctionArgs, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { recentQueries } from "~/db/schema.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/route";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page") ?? 0;
  const limitParam = url.searchParams.get("limit") ?? 25;
  const page = Number(pageParam);
  const limit = Number(limitParam);
  const offset = page * limit;

  const queries = await db
    .select()
    .from(recentQueries)
    .orderBy(recentQueries.createdAt)
    .limit(Number(limit) + 1)
    .offset(Number(offset));

  return {
    queries: queries.slice(0, limit),
    page,
    more: queries.length > limit,
  };
}

const columns: ColumnDef<typeof recentQueries.$inferSelect>[] = [
  {
    accessorKey: "queryText",
    header: "Query",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">{row.original.queryText}</div>
    ),
  },
  {
    accessorKey: "connectionId",
    header: "Connection",
    cell: ({ row }) => <div>{row.original.connectionId}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <div>{new Date(row.original.createdAt).toLocaleString()}</div>
    ),
  },
];

export default function QueriesPage({ loaderData }: Route.ComponentProps) {
  const { queries, page, more } = loaderData;
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: 25,
  });

  const navigate = useNavigate();
  const table = useReactTable({
    data: queries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: (updater) => {
      setPagination((old) => {
        const newPaginationValue =
          updater instanceof Function ? updater(old) : updater;
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(newPaginationValue.pageIndex));
        navigate(
          {
            search: searchParams.toString(),
          },
          { replace: true },
        );
        return newPaginationValue;
      });
    },
    state: {
      pagination,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={page <= 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!more}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
