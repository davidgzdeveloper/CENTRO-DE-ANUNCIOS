export interface LoginRequest {
  nombre: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  usuario?: {
    id: string;
    nombre: string;
    rol: string;
  };
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id: string;
    nombre: string;
    rol: string;
  };
}