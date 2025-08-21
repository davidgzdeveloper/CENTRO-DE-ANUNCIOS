import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=€ Backend servidor corriendo en puerto ${PORT}`);
  console.log(`=Ê Health check: http://localhost:${PORT}/api/health`);
});