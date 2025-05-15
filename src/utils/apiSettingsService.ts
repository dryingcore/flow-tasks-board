
import { toast } from "@/components/ui/use-toast";

const SETTINGS_STORAGE_KEY = "kanban-api-settings";

export interface ApiSettingsType {
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
  useProxy: boolean;
}

export const defaultApiSettings: ApiSettingsType = {
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
  useProxy: true
};

export const getApiSettings = (): ApiSettingsType => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Failed to load API settings:", error);
    toast({
      title: "Erro ao carregar configurações",
      description: "Usando configurações padrão da API.",
      variant: "destructive",
    });
  }
  return defaultApiSettings;
};

export const saveApiSettings = (settings: ApiSettingsType): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    toast({
      title: "Configurações salvas",
      description: "As configurações da API foram salvas com sucesso.",
    });
  } catch (error) {
    console.error("Failed to save API settings:", error);
    toast({
      title: "Erro ao salvar configurações",
      description: "Não foi possível salvar as configurações da API.",
      variant: "destructive",
    });
  }
};

export const getApiUrl = (endpoint: keyof ApiSettingsType["endpoints"], id?: number): string => {
  const settings = getApiSettings();
  let path = settings.endpoints[endpoint];
  
  // Replace {id} placeholder with actual ID if provided
  if (id !== undefined) {
    path = path.replace("{id}", id.toString());
  }
  
  // Make sure URL doesn't have double slashes
  const baseWithSlash = settings.baseUrl.endsWith("/") 
    ? settings.baseUrl.slice(0, -1) 
    : settings.baseUrl;
  const pathWithSlash = path.startsWith("/") ? path : `/${path}`;
  
  // If using proxy, prepend with proxy URL
  if (settings.useProxy) {
    return `/api/proxy?url=${encodeURIComponent(`${baseWithSlash}${pathWithSlash}`)}`;
  }
  
  return `${baseWithSlash}${pathWithSlash}`;
};

export const getRequestBody = (type: keyof ApiSettingsType["requestBodies"], data: Record<string, any> = {}): Record<string, any> => {
  const settings = getApiSettings();
  try {
    // Get the template body
    const templateBody = JSON.parse(settings.requestBodies[type]);
    
    // Merge with provided data
    return { ...templateBody, ...data };
  } catch (error) {
    console.error(`Failed to parse ${type} template:`, error);
    return data;
  }
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    const url = getApiUrl('healthCheck');
    console.log('Testing connection to API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      cache: 'no-cache',
    });
    
    console.log('API test response status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
