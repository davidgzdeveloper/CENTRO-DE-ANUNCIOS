-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('admin', 'empleado', 'visualizador');

-- CreateEnum
CREATE TYPE "public"."TipoAnuncio" AS ENUM ('tarea', 'pizarra');

-- CreateEnum
CREATE TYPE "public"."Prioridad" AS ENUM ('alta', 'media', 'baja');

-- CreateEnum
CREATE TYPE "public"."Estado" AS ENUM ('pendiente', 'en_proceso', 'completado');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Anuncio" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TipoAnuncio" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "sectores" TEXT[],
    "prioridad" "public"."Prioridad" NOT NULL,
    "estado" "public"."Estado" NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comentario" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anuncioId" TEXT NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_key" ON "public"."Usuario"("nombre");

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "public"."Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
