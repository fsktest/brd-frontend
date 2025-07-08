import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import LoadingSpinner from "./LoadingSpinner";
// import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";

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
  jiraAccessToken: string;
  CLOUDID: string;
  API_BASE_URL: string;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function ProjectTable({
  data,
  isLoading,
  jiraAccessToken,
  CLOUDID,
  API_BASE_URL,
  setProjects,
}: ProjectTableProps) {
  const [selectedRows /* , setSelectedRows */] = React.useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(
    null
  );
  const [activeProject /* , setActiveProject */] =
    React.useState<Project | null>(null);

  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [projectToView, setProjectToView] = React.useState<Project | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // const toggleSelectRow = (id: string) => {
  //   setSelectedRows((prev) => {
  //     const copy = new Set(prev);
  //     copy.has(id) ? copy.delete(id) : copy.add(id);
  //     return copy;
  //   });
  // };

  const handleDelete = async () => {
    if (!activeProject || !jiraAccessToken || !CLOUDID) return;

    setIsDeleting(true); // ✅ start spinner
    try {
      const formData = new FormData();
      formData.append("token", jiraAccessToken);
      formData.append("cloudId", CLOUDID);
      formData.append("projectKey", activeProject.key);

      const res = await fetch(`${API_BASE_URL}/delete-project`, {
        method: "DELETE",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`✅ ${result.message}`);
        setProjects((prev) =>
          prev.filter((proj) => proj.key !== activeProject.key)
        );
      } else {
        toast.error(result.detail || "Failed to delete project.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false); // ✅ stop spinner
      setOpenConfirm(false);
    }
  };

  const filteredData = React.useMemo(() => {
    return data.filter((project) =>
      project.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data, debouncedSearch]);

  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      // {
      //   id: "select",
      //   header: "",
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={selectedRows.has(row.original.id)}
      //       onCheckedChange={() => toggleSelectRow(row.original.id)}
      //     />
      //   ),
      // },
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setProjectToView(row.original); // Set project to view
                  setOpenViewDialog(true); // Open dialog
                }}
              >
                View
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={() => {
                  setProjectToDelete(row.original);
                  setOpenConfirm(true);
                }}
              >
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    [selectedRows]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="flex flex-col gap-1 max-w-sm">
        <label
          htmlFor="search"
          className="text-sm font-medium text-muted-foreground"
        >
          Search Projects
        </label>
        <Input
          id="search"
          type="text"
          placeholder="Search by project name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
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
                  <div className="flex justify-center items-center py-10 gap-2">
                    <LoadingSpinner size={24} />
                    <span className="text-sm text-muted-foreground">
                      Loading Projects
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
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
                  {data.length
                    ? "No projects match your search."
                    : "No projects found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

      {/* Alert Dialog for Deletion */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{projectToDelete?.name}</span>?
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size={16} />
                  Deleting...
                </div>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Project Details</h2>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold">Name:</span> {projectToView?.name}
            </p>
            <p>
              <span className="font-semibold">Key:</span> {projectToView?.key}
            </p>
            <p>
              <span className="font-semibold">ID:</span> {projectToView?.id}
            </p>
            <p>
              <span className="font-semibold">Type:</span>{" "}
              {projectToView?.projectTypeKey}
            </p>
            <p>
              <span className="font-semibold">Self URL:</span>{" "}
              {projectToView?.self}
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
