const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Probando login para admin...');
    
    const usuario = await prisma.usuario.findUnique({
      where: { nombre: 'admin' },
    });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', usuario.nombre);
    
    const esValida = await bcrypt.compare(process.env.SEED_PASSWORD_ADMIN || '', usuario.password);
    console.log('✅ Password válida:', esValida);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();