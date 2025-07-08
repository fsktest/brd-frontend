import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useAuthStore from "@/Store/auth";

const Layout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = {
    email: "john.doe@example.com",
    username: "johndoe",
    imageUrl: "",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer ">
                  <AvatarImage src={user.imageUrl || ""} alt="User" />
                  <AvatarFallback className="bg-black text-white">
                    {(user.username || "User").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-4 space-y-2 ">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {user.username || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Separator className="my-2" />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    logout();
                  }}
                >
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
