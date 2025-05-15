
/**
 * Proxy service para contornar problemas de CORS em desenvolvimento
 * Quando o modo de proxy está ativado, as requisições são encaminhadas por este serviço
 */

/**
 * Função para fazer requisições HTTP através de um proxy para contornar problemas de CORS
 * @param url - URL completa para fazer a requisição
 * @param options - Opções da requisição (método, headers, body, etc)
 * @returns Promise com a resposta da requisição
 */
export const fetchWithProxy = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Verifica se a URL já é uma URL de proxy
  if (url.startsWith('/api/proxy')) {
    // Extrai a URL real da query string
    const realUrl = new URL(url, window.location.origin).searchParams.get('url') || '';
    console.log('Usando proxy para:', realUrl);
    
    // Simulação de proxy local (em produção isso seria feito por um servidor)
    try {
      // Adiciona headers para evitar problemas de CORS
      const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      
      // Tenta fazer a requisição com modo 'no-cors' se for uma requisição GET
      if (options.method === 'GET' || !options.method) {
        return fetch(realUrl, {
          ...options,
          headers,
          mode: 'cors',
          credentials: 'omit',
        });
      } else {
        // Para outros métodos, tenta normal primeiro
        return fetch(realUrl, {
          ...options,
          headers,
          mode: 'cors',
          credentials: 'omit',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer requisição com proxy:', error);
      throw error;
    }
  } else {
    // Requisição normal sem proxy
    return fetch(url, options);
  }
};

/**
 * Função para verificar se uma resposta tem status de sucesso (2xx)
 * @param response - Resposta de uma requisição HTTP
 * @returns A mesma resposta, ou lança um erro se não for sucesso
 */
export const checkResponseStatus = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    // Tentar extrair mensagem de erro da resposta
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 
        `Erro na requisição: ${response.status} ${response.statusText}`
      );
    } catch (e) {
      // Se não conseguir extrair JSON, usa o status HTTP
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
  }
  return response;
};
