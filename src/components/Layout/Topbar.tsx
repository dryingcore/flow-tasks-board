
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  companyName?: string;
}

export const Topbar = ({ companyName = "DeskCenter" }: TopbarProps) => {
  const { userData, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  
  // Get first letters of user name for avatar fallback
  const getInitials = () => {
    if (!userData?.nome) return "U";
    const names = userData.nome.split(' ');
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };

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
        <h1 className="text-xl font-semibold">{userData?.clinica || companyName}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-sm md:block">
          <p className="font-medium">{userData?.nome || "Usuário"}</p>
          <p className="text-xs text-muted-foreground">
            {userData?.email || "email@exemplo.com"}
          </p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
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
