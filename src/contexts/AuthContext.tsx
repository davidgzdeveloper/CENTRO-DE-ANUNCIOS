
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  login: (nombre: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ...eliminado USUARIOS_DEMO...

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const usuarioGuardado = localStorage.getItem('usuario_actual');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('usuario_actual');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (nombre: string, password: string): Promise<boolean> => {
    try {
      console.log('🔄 Iniciando login desde frontend...');
      console.log('🌐 URL del servidor:', `${import.meta.env.VITE_API_URL}/api/auth/login`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, password }),
      });

      console.log('📡 Respuesta recibida:', response.status, response.statusText);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('📊 Datos de respuesta:', data);

      if (data.success && data.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem('usuario_actual', JSON.stringify(data.usuario));
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        console.log('✅ Login exitoso');
        return true;
      }
      
      console.log('❌ Login fallido - datos inválidos');
      return false;
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ Tipo de error:', error instanceof TypeError ? 'TypeError' : typeof error);
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_actual');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
