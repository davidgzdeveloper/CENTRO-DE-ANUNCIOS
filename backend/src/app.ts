import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import anunciosRoutes from './routes/anuncios';

dotenv.config();

const app = express();

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
console.log('✅ Rutas registradas');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});



export default app;