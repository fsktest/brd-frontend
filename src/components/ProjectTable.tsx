import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

export type Project = {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  self: string;
  avatarUrls: { ["16x16"]: string };
};

interface ProjectTableProps {
  data: Project[];
  isLoading: boolean;
}

export default function ProjectTable({ data, isLoading }: ProjectTableProps) {
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => {
          const project = row.original;
          const avatar = project.avatarUrls?.["16x16"];
          return (
            <div className="flex items-center gap-2 font-medium">
              {avatar && (
                <img
                  src={avatar}
                  alt="avatar"
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              )}
              {project.name}
            </div>
          );
        },
      },
      {
        accessorKey: "key",
        header: "Project Key",
      },
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "projectTypeKey",
        header: "Type",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.projectTypeKey}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-black">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="text-white">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-row items-center justify-center py-10 gap-2">
                    <LoadingSpinner size={24} />
                    <h2 className="text-sm text-muted-foreground">
                      Loading Projects
                    </h2>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          Total project{data.length !== 1 ? "s" : ""}: {data.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
