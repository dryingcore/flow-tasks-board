
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface TopbarProps {
  companyName?: string;
}

export const Topbar = ({ companyName = "DeskCenter" }: TopbarProps) => {
  const { userData, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        <h1 className="text-xl font-semibold">{companyName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-sm md:block">
          <p className="font-medium">{userData?.nome || "Usuário"}</p>
          <p className="text-xs text-muted-foreground">
            {userData?.email || "email@exemplo.com"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout} 
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
