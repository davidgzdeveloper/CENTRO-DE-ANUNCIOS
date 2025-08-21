import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest, LoginResponse } from '../types';

const prisma = new PrismaClient();

export const login = async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>) => {
  try {
    console.log('🔄 Iniciando proceso de login...');
    const { nombre, password } = req.body;
    console.log('📝 Datos recibidos:', { nombre, password: password ? '***' : 'undefined' });

    if (!nombre || !password) {
      console.log('❌ Faltan datos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Nombre y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario en BD...');
    // Buscar usuario por nombre
    const usuario = await prisma.usuario.findUnique({
      where: { nombre },
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    console.log('✅ Usuario encontrado:', usuario.nombre);
    console.log('🔐 Verificando contraseña...');
    
    // Verificar contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    console.log('🔐 Contraseña válida:', esValida);
    
    if (!esValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    console.log('🎫 Generando JWT...');
    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso para:', usuario.nombre);
    // Responder con token y datos del usuario (sin password)
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    // Verificar que el usuario aún existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};