
import { NavLink } from "react-router-dom";
import { Home, Kanban, Settings } from "lucide-react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";

export const Sidebar = () => {
  return (
    <SidebarComponent>
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-6 w-6" />
          </div>
          <h1 className="ml-3 text-lg font-semibold">DeskCenter</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                  <NavLink to="/">
                    <Home />
                    <span>Início</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/kanban"}>
                  <NavLink to="/">
                    <Kanban />
                    <span>Kanban</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/api-settings"}
                >
                  <NavLink to="/api-settings">
                    <Settings />
                    <span>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};
