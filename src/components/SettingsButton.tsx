
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SettingsButton = () => {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/api-settings")}
            className="rounded-full"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configurações da API</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Configurações da API</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingsButton;
