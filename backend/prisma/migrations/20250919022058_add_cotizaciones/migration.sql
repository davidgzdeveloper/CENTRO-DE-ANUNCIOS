-- CreateTable
CREATE TABLE "public"."Cotizacion" (
    "id" TEXT NOT NULL,
    "dolar" DOUBLE PRECISION NOT NULL,
    "dolarViejo" DOUBLE PRECISION NOT NULL,
    "real" DOUBLE PRECISION NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoPorId" TEXT NOT NULL,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Cotizacion" ADD CONSTRAINT "Cotizacion_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
