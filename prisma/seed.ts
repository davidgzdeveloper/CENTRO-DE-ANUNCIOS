import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Las contraseñas se leen de variables de entorno (SEED_PASSWORD_<USUARIO>),
// nunca se escriben en el código.
function passwordDe(usuario: string): string {
  const variable = `SEED_PASSWORD_${usuario.toUpperCase()}`;
  const valor = process.env[variable];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${variable}`);
  }
  return valor;
}

const USUARIOS_DEMO = [
  { nombre: 'admin', rol: Rol.admin, password: passwordDe('admin') },
  { nombre: 'playa', rol: Rol.empleado, password: passwordDe('playa') },
  { nombre: 'tienda', rol: Rol.empleado, password: passwordDe('tienda') },
  { nombre: 'deposito', rol: Rol.empleado, password: passwordDe('deposito') },
  { nombre: 'mantenimiento', rol: Rol.empleado, password: passwordDe('mantenimiento') },
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
