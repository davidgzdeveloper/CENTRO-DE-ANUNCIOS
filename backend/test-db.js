const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log('Probando conexión a la base de datos...');
    const usuarios = await prisma.usuario.findMany();
    console.log('✅ Conexión exitosa!');
    console.log('Usuarios encontrados:', usuarios.length);
    usuarios.forEach(u => console.log(`- ${u.nombre} (${u.rol})`));
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();