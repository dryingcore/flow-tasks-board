
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  ApiSettingsType, 
  defaultApiSettings, 
  getApiSettings, 
  saveApiSettings, 
  testApiConnection 
} from "@/utils/apiSettingsService";

const ApiSettings = () => {
  const [settings, setSettings] = useState<ApiSettingsType>({
    ...defaultApiSettings,
    useProxy: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved settings from localStorage if available
    const savedSettings = getApiSettings();
    setSettings(savedSettings);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    try {
      // Validate JSON in textareas
      const requestBodies = {
        createTicket: JSON.parse(settings.requestBodies.createTicket),
        updateTicket: JSON.parse(settings.requestBodies.updateTicket),
        createComment: JSON.parse(settings.requestBodies.createComment),
      };
      
      // Save settings with properly formatted JSON
      const formattedSettings = {
        ...settings,
        requestBodies: {
          createTicket: JSON.stringify(requestBodies.createTicket, null, 2),
          updateTicket: JSON.stringify(requestBodies.updateTicket, null, 2),
          createComment: JSON.stringify(requestBodies.createComment, null, 2),
        },
      };
      
      saveApiSettings(formattedSettings);
      setSettings(formattedSettings);
      
      // Reload the page to apply new settings
      window.location.reload();
    } catch (error) {
      console.error("Failed to save API settings:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Verifique se o formato JSON está correto.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Save current settings temporarily
      const tempSettings = {
        ...settings,
        requestBodies: {
          createTicket: settings.requestBodies.createTicket,
          updateTicket: settings.requestBodies.updateTicket,
          createComment: settings.requestBodies.createComment,
        },
      };
      
      // Save settings temporarily for the test
      saveApiSettings(tempSettings);
      
      const isConnected = await testApiConnection();
      
      if (isConnected) {
        toast({
          title: "Conexão estabelecida",
          description: "A conexão com a API foi estabelecida com sucesso!",
        });
      } else {
        toast({
          title: "Conexão falhou",
          description: "Não foi possível conectar à API. Verifique as configurações e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      toast({
        title: "Teste de conexão falhou",
        description: "Ocorreu um erro ao testar a conexão.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Deseja realmente restaurar as configurações padrão?")) {
      setSettings(defaultApiSettings);
      localStorage.removeItem("kanban-api-settings");
      toast({
        title: "Configurações restauradas",
        description: "As configurações da API foram restauradas para o padrão.",
      });
    }
  };

  const handleChange = (
    section: keyof ApiSettingsType,
    field: string,
    value: string | boolean
  ) => {
    setSettings((prev) => {
      if (section === "baseUrl") {
        return {
          ...prev,
          baseUrl: value as string,
        };
      } else if (section === "useProxy") {
        return {
          ...prev,
          useProxy: value as boolean,
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as Record<string, unknown>),
            [field]: value,
          },
        };
      }
    });
  };

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Configurações da API</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>URL Base</CardTitle>
            <CardDescription>
              Configure a URL base para todas as requisições da API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">URL Base</Label>
                <Input
                  id="baseUrl"
                  value={settings.baseUrl}
                  onChange={(e) => handleChange("baseUrl", "", e.target.value)}
                  placeholder="https://api.exemplo.com"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useProxy"
                  checked={settings.useProxy}
                  onCheckedChange={(checked) => handleChange("useProxy", "", checked)}
                />
                <Label htmlFor="useProxy">Usar proxy para contornar problemas de CORS</Label>
              </div>
              
              <Button 
                onClick={handleTestConnection} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>
              Configure os endpoints para cada operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(settings.endpoints).map(([key, value]) => (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={`endpoint-${key}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <Input
                    id={`endpoint-${key}`}
                    value={value}
                    onChange={(e) =>
                      handleChange("endpoints", key, e.target.value)
                    }
                    placeholder={`/${key}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corpos das Requisições</CardTitle>
            <CardDescription>
              Configure o formato JSON para os corpos das requisições
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {Object.entries(settings.requestBodies).map(([key, value]) => (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={`body-${key}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <Textarea
                    id={`body-${key}`}
                    value={value}
                    onChange={(e) =>
                      handleChange("requestBodies", key, e.target.value)
                    }
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleReset}>
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
