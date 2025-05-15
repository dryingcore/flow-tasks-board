
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";

interface ApiSettingsType {
  baseUrl: string;
  endpoints: {
    healthCheck: string;
    getTickets: string;
    createTicket: string;
    updateTicket: string;
    deleteTicket: string;
    getComments: string;
    createComment: string;
  };
  requestBodies: {
    createTicket: string;
    updateTicket: string;
    createComment: string;
  };
}

const defaultApiSettings: ApiSettingsType = {
  baseUrl: "https://server.starlaudo.com.br/api",
  endpoints: {
    healthCheck: "/health",
    getTickets: "/tickets",
    createTicket: "/tickets",
    updateTicket: "/tickets/{id}",
    deleteTicket: "/tickets/{id}",
    getComments: "/comments",
    createComment: "/comments",
  },
  requestBodies: {
    createTicket: JSON.stringify(
      {
        titulo: "Título do ticket",
        descricao: "Descrição do ticket",
        status: "aberto",
        prioridade: "media",
        clinica_id: 1,
        usuario_id: 2
      },
      null,
      2
    ),
    updateTicket: JSON.stringify(
      {
        titulo: "Título atualizado",
        descricao: "Descrição atualizada",
        status: "em_desenvolvimento",
        prioridade: "alta"
      },
      null,
      2
    ),
    createComment: JSON.stringify(
      {
        texto: "Texto do comentário",
        ticket_id: 1,
        usuario_id: 2
      },
      null,
      2
    ),
  },
};

const SETTINGS_STORAGE_KEY = "kanban-api-settings";

const ApiSettings = () => {
  const [settings, setSettings] = useState<ApiSettingsType>(defaultApiSettings);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved settings from localStorage if available
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse saved API settings:", error);
      }
    }
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
      
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(formattedSettings));
      setSettings(formattedSettings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da API foram salvas com sucesso.",
      });
      
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

  const handleReset = () => {
    if (window.confirm("Deseja realmente restaurar as configurações padrão?")) {
      setSettings(defaultApiSettings);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      toast({
        title: "Configurações restauradas",
        description: "As configurações da API foram restauradas para o padrão.",
      });
    }
  };

  const handleChange = (
    section: keyof ApiSettingsType,
    field: string,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: section === "baseUrl" ? value : {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
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
            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL Base</Label>
              <Input
                id="baseUrl"
                value={settings.baseUrl}
                onChange={(e) => handleChange("baseUrl", "", e.target.value)}
                placeholder="https://api.exemplo.com"
              />
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
