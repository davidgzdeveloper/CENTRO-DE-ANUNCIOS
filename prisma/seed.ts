import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USUARIOS_DEMO = [
  { nombre: 'admin', rol: Rol.admin, password: 'admin123' },
  { nombre: 'playa', rol: Rol.empleado, password: 'playa123' },
  { nombre: 'tienda', rol: Rol.empleado, password: 'tienda123' },
  { nombre: 'deposito', rol: Rol.empleado, password: 'deposito123' },
  { nombre: 'mantenimiento', rol: Rol.empleado, password: 'mantenimiento123' },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const userData of USUARIOS_DEMO) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.usuario.create({
      data: {
        nombre: userData.nombre,
        rol: userData.rol,
        password: hashedPassword,
      },
    });
    console.log(`Created user with id: ${user.id}`);
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
