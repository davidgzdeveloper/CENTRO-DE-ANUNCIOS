import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USUARIOS_DEMO = [
  { nombre: 'admin', rol: Rol.admin, password: 'admin123', sector: 'admin' },
  { nombre: 'playa', rol: Rol.empleado, password: 'playa123', sector: 'Playa' },
  { nombre: 'tienda', rol: Rol.empleado, password: 'tienda123', sector: 'Tienda' },
  { nombre: 'deposito', rol: Rol.empleado, password: 'deposito123', sector: 'Depósito' },
  { nombre: 'mantenimiento', rol: Rol.empleado, password: 'mantenimiento123', sector: 'Mantenimiento' },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const userData of USUARIOS_DEMO) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.usuario.upsert({
      where: { nombre: userData.nombre },
      update: {
        password: hashedPassword,
        rol: userData.rol,
        sector: userData.sector,
      },
      create: {
        nombre: userData.nombre,
        rol: userData.rol,
        password: hashedPassword,
        sector: userData.sector,
      },
    });
    console.log(`Created or updated user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
