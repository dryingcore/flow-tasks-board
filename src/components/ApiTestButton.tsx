
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { testApiConnection } from "@/utils/apiSettingsService";

const ApiTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const connected = await testApiConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "API Conectada",
          description: "A conexão com a API foi estabelecida com sucesso! Atualize a página para carregar os dados reais.",
        });
      } else {
        toast({
          title: "API Desconectada",
          description: "Não foi possível conectar à API. Verifique as configurações e o CORS no servidor.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao testar API:", error);
      setIsConnected(false);
      toast({
        title: "Erro ao testar API",
        description: "Ocorreu um erro ao testar a conexão com a API. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={handleTestConnection} 
      disabled={isTesting}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isTesting ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : isConnected === true ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : isConnected === false ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Testar API
    </Button>
  );
};

export default ApiTestButton;
