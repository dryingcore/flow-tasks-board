
import { fetchTickets, checkApiConnection } from '@/services/api';
import { processApiData } from './apiMapping';
import { loadState, saveState } from '../../../utils/storage';
import { toast } from '@/components/ui/use-toast';

export const fetchData = async (
  initialState: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsConnectedToApi: React.Dispatch<React.SetStateAction<boolean>>,
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    setLoading(true);
    setError(null);
    console.log('Verificando conexão com a API...');
    
    // Verificar a conexão com a API primeiro
    const isConnected = await checkApiConnection();
    setIsConnectedToApi(isConnected);
    
    if (isConnected) {
      toast({
        title: "API Conectada",
        description: "Usando dados reais do servidor.",
      });
      
      console.log('Buscando tickets da API...');
      const tickets = await fetchTickets(1); // Buscando tickets da clínica com ID 1
      console.log('Tickets recebidos:', tickets);
      const newState = processApiData(tickets, initialState);
      setState(newState);
      saveState(newState);
      console.log('Estado atualizado com sucesso!');
    } else {
      setError('Não foi possível conectar à API. Verifique as configurações ou sua conexão.');
      toast({
        title: "API Desconectada",
        description: "Não foi possível conectar à API. Verifique as configurações ou sua conexão.",
        variant: "destructive",
      });
      
      // Não usamos dados mock, mas tentamos carregar do localStorage como último recurso
      const savedState = loadState();
      if (savedState) {
        console.log('Carregando estado do localStorage como último recurso');
        setState(savedState);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados da API:', err);
    setError('Erro ao carregar dados da API. Verifique sua conexão.');
    
    // Tentar carregar do localStorage como último recurso
    const savedState = loadState();
    if (savedState) {
      console.log('Carregando estado do localStorage como último recurso');
      setState(savedState);
    }
  } finally {
    setLoading(false);
  }
};

export const refreshDataOperation = async (
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsConnectedToApi: React.Dispatch<React.SetStateAction<boolean>>,
  fetchDataFn: () => Promise<void>
) => {
  setIsRefreshing(true);
  try {
    // Verificar conexão com a API novamente
    const isConnected = await checkApiConnection();
    setIsConnectedToApi(isConnected);
    
    if (isConnected) {
      await fetchDataFn();
      toast({
        title: "Dados atualizados",
        description: "Todos os cards foram atualizados com sucesso (dados reais)",
      });
    } else {
      toast({
        title: "API Desconectada",
        description: "Não foi possível conectar à API para atualizar os dados.",
        variant: "destructive",
      });
    }
  } catch (err) {
    toast({
      title: "Erro ao atualizar",
      description: "Não foi possível atualizar os dados.",
      variant: "destructive",
    });
  } finally {
    setIsRefreshing(false);
  }
};
