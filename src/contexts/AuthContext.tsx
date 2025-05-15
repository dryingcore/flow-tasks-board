
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from 'react-router-dom';
import { login as loginService, LoginResponse } from "../services/authService";
import { decodeToken, isTokenExpired } from "../utils/jwtUtils";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  token: string | null;
  userData: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUserData(decodeToken(storedToken));
        } else {
            localStorage.removeItem("token"); // Remove token expirado
            logout();
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await loginService(email, password);
            const newToken = data.token;
            const decodedToken = decodeToken(newToken);
            
            if (!decodedToken) {
                throw new Error("Token inválido");
            }

            setToken(newToken);
            setUserData(decodedToken);
            localStorage.setItem("token", newToken);
            
            toast({
              title: "Login realizado com sucesso",
              description: `Bem-vindo, ${decodedToken.nome || 'usuário'}!`,
            });
            
            navigate('/');
            return decodedToken;
        } catch (error) {
            toast({
              variant: "destructive",
              title: "Erro ao fazer login",
              description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente",
            });
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUserData(null);
        localStorage.removeItem("token");
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ 
          token, 
          userData, 
          login, 
          logout, 
          isAuthenticated: !!token 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
