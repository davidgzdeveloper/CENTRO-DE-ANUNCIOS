# Centro de Anuncios

Aplicación web full-stack de comunicación interna para una estación de servicio. Centraliza los anuncios, tareas y novedades de cada sector (playa, tienda, depósito, mantenimiento) en un único panel, con control de acceso por roles y seguimiento del estado de cada tarea.

## Capturas

**Tablero de tareas** (vista de administrador): tareas organizadas por estado, con filtros, cotizaciones de divisas y contadores en el encabezado.

![Tablero de tareas en la vista de administrador](docs/captura_vista_admins.jpg)

**Pizarra**: avisos generales dirigidos a uno o varios sectores.

![Pizarra de avisos por sector](docs/captura_pizarra.jpg)

## Funcionalidades

- **Autenticación con JWT**: inicio de sesión con contraseñas cifradas con bcrypt y verificación de sesión.
- **Roles de usuario**: `admin`, `empleado` y `visualizador`, con permisos distintos sobre los anuncios.
- **Dos tipos de anuncio**:
  - **Tareas**: con prioridad (alta, media, baja) y estado (pendiente, en proceso, completado), en un tablero de tres columnas.
  - **Pizarra**: avisos informativos de carácter general.
- **Segmentación por sectores**: cada anuncio puede dirigirse a uno o varios sectores.
- **Comentarios** en cada anuncio para el seguimiento entre equipos.
- **Filtros** por tipo, sector, prioridad y estado.
- **Cotizaciones de divisas** (dólar y real) con historial de actualizaciones.
- **Reloj en tiempo real** en el encabezado del panel.
- **Interfaz adaptable** a escritorio y dispositivos móviles.

## Tecnologías

| Capa | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), React Router, TanStack Query, React Hook Form, Zod |
| Backend | Node.js, Express 5, TypeScript, JSON Web Tokens, bcrypt |
| Base de datos | PostgreSQL (Supabase), Prisma ORM |

## Arquitectura

```
├── src/                  # Frontend (React + Vite)
│   ├── components/       # Componentes de la interfaz
│   ├── contexts/         # AuthContext: estado de sesión
│   ├── hooks/            # useAnuncios, useCotizaciones
│   ├── pages/            # Index, Dashboard, NotFound
│   └── types/            # Tipos compartidos
├── backend/              # API REST (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Definición de endpoints
│   │   ├── app.ts        # Configuración de Express
│   │   └── server.ts     # Punto de entrada
│   └── prisma/           # Esquema, migraciones y datos iniciales
└── prisma/               # Esquema de Prisma del frontend
```

El frontend consume la API REST del backend, que gestiona la autenticación y el acceso a PostgreSQL a través de Prisma.

### Modelo de datos

- **Usuario**: nombre, contraseña (hash) y rol.
- **Anuncio**: tipo, título, descripción, sectores, prioridad, estado, autor y fechas.
- **Comentario**: texto, autor, fecha y anuncio asociado.

## API REST

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve un token JWT |
| `GET` | `/api/auth/verify` | Verifica un token |
| `GET` | `/api/anuncios` | Lista los anuncios |
| `POST` | `/api/anuncios` | Crea un anuncio |
| `PUT` | `/api/anuncios/:id` | Actualiza un anuncio |
| `DELETE` | `/api/anuncios/:id` | Elimina un anuncio |
| `POST` | `/api/anuncios/:id/comentarios` | Agrega un comentario |
| `GET` | `/api/cotizaciones` | Devuelve la cotización vigente |
| `POST` | `/api/cotizaciones` | Actualiza las cotizaciones |
| `GET` | `/api/cotizaciones/historial` | Historial de cotizaciones |
| `GET` | `/api/health` | Estado del servidor |

## Instalación y ejecución local

### Requisitos

- Node.js 18 o superior
- Una base de datos PostgreSQL (local o en Supabase)

### 1. Clonar el repositorio

```sh
git clone https://github.com/davidgzdeveloper/CENTRO-DE-ANUNCIOS.git
cd CENTRO-DE-ANUNCIOS
```

### 2. Configurar las variables de entorno

`backend/.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/base_de_datos"
JWT_SECRET="una_clave_secreta"
PORT=3001
FRONTEND_URL="http://localhost:8080"

# Contraseñas de los usuarios de prueba que crea `npm run seed`
SEED_PASSWORD_ADMIN="..."
SEED_PASSWORD_PLAYA="..."
SEED_PASSWORD_TIENDA="..."
SEED_PASSWORD_DEPOSITO="..."
SEED_PASSWORD_MANTENIMIENTO="..."
```

`.env` (raíz del proyecto):

```env
VITE_API_URL="http://localhost:3001"
```

### 3. Levantar el backend

```sh
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

La API queda disponible en `http://localhost:3001`.

### 4. Levantar el frontend

En otra terminal, desde la raíz del proyecto:

```sh
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:8080`. El comando `seed` crea usuarios de prueba para cada rol y sector.

## Próximas mejoras

- Middleware de autorización por rol en todas las rutas protegidas.
- Validación de datos con Zod en el backend.
- Notificaciones en tiempo real con WebSockets.
- Panel de métricas por sector.
- Tests automatizados y CI/CD con GitHub Actions.

## Autor

Desarrollado por [@davidgzdeveloper](https://github.com/davidgzdeveloper).
