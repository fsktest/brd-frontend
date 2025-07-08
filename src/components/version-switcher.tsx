// import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function VersionSwitcher({ versions, defaultVersion }: { versions: string[]; defaultVersion: string }) {
  // const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
      <div className="flex items-center gap-2 mt-3 mb-1">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
          {/* <GalleryVerticalEnd className="size-4" /> */}
          <img src="logo.svg" alt="logo" width={24} height={24} />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-medium">AI Analyzer</span>
          <span className="text-[10px]">Powered By HiPaaS</span>
        </div>
      </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
