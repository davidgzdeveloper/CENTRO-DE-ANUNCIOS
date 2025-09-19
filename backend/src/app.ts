import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import anunciosRoutes from './routes/anuncios';
import cotizacionesRoutes from './routes/cotizaciones';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Debug: mostrar la URL del frontend
console.log('🔧 FRONTEND_URL configurada:', process.env.FRONTEND_URL);

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, req.body);
  next();
});

// Routes
console.log('🔧 Registrando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
console.log('✅ Rutas registradas');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Conexión a base de datos exitosa');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    await prisma.$disconnect();
    
    res.json({ 
      status: 'OK', 
      message: 'Conexión a base de datos exitosa',
      database: 'Connected',
      testQuery: result
    });
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error de conexión a base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});



export default app;