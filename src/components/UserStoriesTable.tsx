"use client";

import * as React from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal } from "lucide-react";

// ... UserStory type and stories array as in your code ...
export type UserStory = {
  title: string;
  summary: string;
  story_type: "Feature" | "Bug" | "Task" | "Epic";
  description: string;
  priority: "High" | "Medium" | "Low";
  story_points: string;
  labels: string[];
  acceptance_criteria: string[];
};

const stories: UserStory[] = [
  {
    title: "Login with email and password",
    summary: "Enable user authentication using email/password",
    story_type: "Feature",
    description:
      "Implement a secure login system allowing users to sign in using their registered email and password, with proper validation and error handling.",
    priority: "High",
    story_points: "5",
    labels: ["auth", "frontend", "backend"],
    acceptance_criteria: [
      "Given a valid email and password, when submitted, then user is logged in successfully",
      "Given incorrect credentials, when submitted, then an error message is shown",
    ],
  },
  {
    title: "Fix sidebar toggle bug on mobile",
    summary: "Sidebar does not close on navigation in mobile view",
    story_type: "Bug",
    description:
      "On mobile devices, the sidebar remains open after selecting a menu item. It should automatically close to improve UX.",
    priority: "Medium",
    story_points: "2",
    labels: ["ui", "bug", "mobile"],
    acceptance_criteria: [
      "Given mobile screen, when a menu item is clicked, then sidebar closes",
      "Given desktop screen, when menu item is clicked, then sidebar stays open",
    ],
  },
  {
    title: "Create reusable card component",
    summary: "Add reusable UI card for stats display",
    story_type: "Task",
    description:
      "Build a Card component that can be reused to display statistics across the app with consistent design and spacing.",
    priority: "Medium",
    story_points: "3",
    labels: ["ui", "component", "reuse"],
    acceptance_criteria: [
      "Given count and title props, when rendered, then card displays data correctly",
      "Given custom styles, then component supports them without layout break",
    ],
  },
  {
    title: "Search functionality for stories",
    summary: "Allow users to search user stories by title",
    story_type: "Feature",
    description:
      "Add a search bar that filters user stories based on title or summary keywords typed by the user.",
    priority: "High",
    story_points: "5",
    labels: ["feature", "search", "ux"],
    acceptance_criteria: [
      "Given a keyword, when typed, then matching stories are displayed",
      "Given empty input, then all stories are shown",
    ],
  },
  {
    title: "Epic: User Management System",
    summary: "Group all features related to user management",
    story_type: "Epic",
    description:
      "This epic includes login, registration, user roles, profile management, and user list pages.",
    priority: "High",
    story_points: "13",
    labels: ["epic", "user-management", "backend"],
    acceptance_criteria: [
      "Given feature completion, then all user management stories are grouped under this epic",
      "Given epic view, then progress of individual stories is visible",
    ],
  },
  {
    title: "Implement dark mode toggle",
    summary: "User can switch between light and dark themes",
    story_type: "Feature",
    description:
      "Introduce a toggle that allows users to switch the UI theme, and persist preference across sessions.",
    priority: "Low",
    story_points: "3",
    labels: ["theme", "ux", "frontend"],
    acceptance_criteria: [
      "Given theme toggle, when clicked, then UI theme changes",
      "Given user preference, when page reloads, then last selected theme is restored",
    ],
  },
  {
    title: "Add pagination to story list",
    summary: "Story list should be paginated after 10 items",
    story_type: "Task",
    description:
      "To improve performance, add pagination control to the user story list component, showing 10 per page.",
    priority: "Medium",
    story_points: "3",
    labels: ["pagination", "list", "performance"],
    acceptance_criteria: [
      "Given more than 10 stories, then pagination controls are shown",
      "Given a page number, when clicked, then corresponding stories are displayed",
    ],
  },
  {
    title: "Bug: Stats not updating in real-time",
    summary: "Dashboard stats remain stale until manual refresh",
    story_type: "Bug",
    description:
      "The dashboard does not reflect updated story counts unless the page is refreshed. This needs to be fixed using polling or socket updates.",
    priority: "High",
    story_points: "5",
    labels: ["bug", "dashboard", "realtime"],
    acceptance_criteria: [
      "Given story update, when done, then stats are updated without page reload",
      "Given dashboard open, then stats refresh every 30 seconds",
    ],
  },
  {
    title: "Integrate toast notifications",
    summary: "Show toast messages for success and errors",
    story_type: "Feature",
    description:
      "Implement a toast system that gives real-time feedback to users for actions like form submissions or errors.",
    priority: "Medium",
    story_points: "2",
    labels: ["notification", "ux", "frontend"],
    acceptance_criteria: [
      "Given an action success, when triggered, then success toast is shown",
      "Given a failed action, when triggered, then error toast is shown",
    ],
  },
  {
    title: "Set up unit testing with Vitest",
    summary: "Add basic test setup using Vitest",
    story_type: "Task",
    description:
      "Set up a testing framework using Vitest to ensure component and logic reliability with at least one test case per core component.",
    priority: "Medium",
    story_points: "5",
    labels: ["testing", "vitest", "quality"],
    acceptance_criteria: [
      "Given test command, when run, then Vitest executes all test cases",
      "Given sample component, then at least one passing test is written",
    ],
  },
];

export const columns: ColumnDef<UserStory>[] = [
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    filterFn: "includesString",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "story_type",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("story_type")}</div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    enableSorting: true,
  },
  {
    accessorKey: "story_points",
    header: () => <div className="text-center">Points</div>,
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("story_points")}</div>
    ),
  },
  {
    accessorKey: "labels",
    header: "Labels",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.labels.map((label, i) => (
          <span key={i} className="bg-muted text-xs rounded-full px-2 py-0.5">
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const story = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(story.title)}
            >
              Copy Title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Description</DropdownMenuItem>
            <DropdownMenuItem>Open in Jira</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserStoriesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable<UserStory>({
    data: stories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("title")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Priority <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["All", "High", "Medium", "Low"].map((priority) => (
              <DropdownMenuItem
                key={priority}
                onClick={() => {
                  table
                    .getColumn("priority")
                    ?.setFilterValue(priority === "All" ? undefined : priority);
                }}
              >
                {priority}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-black">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead className="text-white" key={header.id}>
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
            {table.getRowModel().rows.length ? (
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
                  No user stories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected
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
