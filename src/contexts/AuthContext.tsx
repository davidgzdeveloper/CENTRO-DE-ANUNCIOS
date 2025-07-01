
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  login: (nombre: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios predefinidos para demo
const USUARIOS_DEMO: (Usuario & { password: string })[] = [
  { id: '1', nombre: 'Admin Sistema', rol: 'admin', password: 'admin123' },
  { id: '2', nombre: 'Juan Pérez', rol: 'empleado', password: 'empleado123' },
  { id: '3', nombre: 'Ana García', rol: 'empleado', password: 'empleado123' },
  { id: '4', nombre: 'Monitor TV', rol: 'visualizador', password: 'monitor123' },
];

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

  const login = (nombre: string, password: string): boolean => {
    const usuarioEncontrado = USUARIOS_DEMO.find(
      u => u.nombre.toLowerCase() === nombre.toLowerCase() && u.password === password
    );

    if (usuarioEncontrado) {
      const { password: _, ...usuarioSinPassword } = usuarioEncontrado;
      setUsuario(usuarioSinPassword);
      localStorage.setItem('usuario_actual', JSON.stringify(usuarioSinPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_actual');
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
