# 📋 Backlog de Desarrollo - Sistema de Monitoreo de Anuncios

## 💱 Cotizaciones de Monedas
> **Información actualizada de tasas de cambio para referencia general**

### Dólar Estadounidense (USD)
- **Compra:** $XXX.XX ARS
- **Venta:** $XXX.XX ARS
- **Última actualización:** [Fecha/Hora]

### Real Brasileño (BRL)
- **Compra:** $XXX.XX ARS
- **Venta:** $XXX.XX ARS
- **Última actualización:** [Fecha/Hora]

---

## 🎯 Estado Actual del Proyecto

**✅ Completado:**
- Configuración base con Vite + React + TypeScript + ShadcN
- Sistema de autenticación básico implementado
- Modelos de base de datos con Prisma (PostgreSQL/Supabase)
- Componentes UI básicos (Login, Dashboard, Formularios)
- Hook useAnuncios con integración parcial a Prisma

## 🚀 Backlog de Desarrollo

### 🔥 Prioridad Alta (Funcionalidad Core)

#### 1. Configurar y migrar base de datos Prisma
- [ ] Ejecutar `prisma migrate dev` para aplicar esquema
- [ ] Ejecutar `prisma db seed` para datos iniciales
- [ ] Verificar conexión a Supabase
- [ ] Validar que todos los modelos estén funcionando

**Archivos afectados:** `prisma/schema.prisma`, `prisma/seed.ts`

#### 2. Corregir problemas de autenticación con Prisma
- [ ] Arreglar referencias en AuthContext.tsx (conectar por autorId)
- [ ] Validar hash de contraseñas con bcrypt
- [ ] Mejorar manejo de errores de login
- [ ] Actualizar persistencia de sesión en localStorage

**Archivos afectados:** `src/contexts/AuthContext.tsx`, `src/components/LoginForm.tsx`

#### 3. Migrar completamente useAnuncios a Prisma
- [ ] Corregir mapeo de comentarios (usar autorId correctamente)
- [ ] Actualizar todas las operaciones CRUD
- [ ] Sincronizar filtros con permisos de roles
- [ ] Validar que todas las funciones del hook funcionen con BD

**Archivos afectados:** `src/hooks/useAnuncios.ts`

#### 4. Sincronizar tipos TypeScript con esquema Prisma
- [ ] Actualizar interfaces en `src/types/index.ts`
- [ ] Usar tipos generados por Prisma donde sea apropiado
- [ ] Eliminar discrepancias entre frontend/backend
- [ ] Validar consistencia de tipos en toda la aplicación

**Archivos afectados:** `src/types/index.ts`, componentes que usan los tipos

---

### 🚀 Prioridad Media (Mejoras de Funcionalidad)

#### 5. Implementar validación de datos y manejo de errores
- [ ] Integrar Zod para validación de formularios
- [ ] Implementar manejo robusto de errores de BD
- [ ] Agregar mensajes de feedback para usuario
- [ ] Crear componentes de error consistentes

**Estimación:** 1-2 días

#### 6. Agregar funcionalidad de notificaciones en tiempo real
- [ ] Implementar WebSockets o Server-Sent Events
- [ ] Notificaciones de nuevos anuncios por sector
- [ ] Alertas de tareas urgentes
- [ ] Sistema de badges/contadores no leídos

**Estimación:** 2-3 días

#### 7. Implementar sistema de roles y permisos avanzado
- [ ] Permisos granulares por sector
- [ ] Jerarquía de roles (supervisor, encargado, etc.)
- [ ] Control de acceso a funciones específicas
- [ ] Middleware de autorización

**Estimación:** 2-3 días

#### 8. Crear dashboard de métricas y analíticas
- [ ] Estadísticas de anuncios por sector
- [ ] Gráficos de productividad (tareas completadas)
- [ ] Reportes de rendimiento por período
- [ ] Integración con librerías de gráficos (Recharts)

**Estimación:** 3-4 días

#### 9. Rediseñar la visualización de anuncios
- [ ] Modificar el componente `AnuncioCard.tsx` para que se asemeje al estilo de una biografía de red social (ej. Facebook, X).
- [ ] Priorizar un diseño más amigable y menos estructurado que una "card".
- [ ] Asegurar que la nueva vista muestre la información clave del anuncio de forma clara.

**Archivos afectados:** `src/components/AnuncioCard.tsx`, `src/pages/Dashboard.tsx`

---

### ⚡ Prioridad Baja (Funcionalidades Avanzadas)

#### 10. Implementar sistema de archivos adjuntos
- [ ] Subida de imágenes/documentos en anuncios
- [ ] Almacenamiento en cloud (Supabase Storage)
- [ ] Previsualización de archivos
- [ ] Control de tamaño y tipos de archivo

**Estimación:** 3-4 días

#### 11. Agregar funcionalidad de búsqueda avanzada
- [ ] Filtros combinados avanzados
- [ ] Búsqueda por contenido de comentarios
- [ ] Historial de búsquedas
- [ ] Búsqueda con autocompletado

**Estimación:** 2-3 días

#### 12. Implementar sistema de backup y exportación
- [ ] Exportación de datos a Excel/PDF
- [ ] Backup automático de base de datos
- [ ] Importación masiva de datos
- [ ] Programación de backups

**Estimación:** 3-4 días

---

### 🔧 Tareas de Infraestructura

#### 13. Optimizar rendimiento y agregar caching
- [ ] Configurar React Query para cache de datos
- [ ] Implementar paginación de anuncios
- [ ] Lazy loading de componentes
- [ ] Optimización de queries de BD

**Estimación:** 2-3 días

#### 14. Implementar tests automatizados
- [ ] Configurar Vitest para tests unitarios
- [ ] Tests de integración para hooks
- [ ] Tests E2E con Playwright
- [ ] Coverage reports

**Estimación:** 4-5 días

#### 15. Configurar deployment y CI/CD
- [ ] Deployment en Vercel/Netlify
- [ ] GitHub Actions para CI/CD
- [ ] Variables de entorno de producción
- [ ] Monitoreo de errores

**Estimación:** 2-3 días

---

## 📁 Estructura de Archivos Clave

```
src/
├── components/          # Componentes React
├── contexts/           # Contextos (AuthContext)
├── hooks/              # Custom hooks (useAnuncios)
├── lib/                # Utilidades (prisma.ts)
├── pages/              # Páginas principales
├── types/              # Definiciones de tipos TypeScript
└── ...

prisma/
├── schema.prisma       # Esquema de base de datos
└── seed.ts            # Datos de prueba
```

## 🏃‍♂️ Próximos Pasos Inmediatos

1. **Ejecutar migraciones de Prisma** - Asegurar que la BD esté sincronizada
2. **Corregir autenticación** - Resolver problemas de login con BD
3. **Finalizar integración de useAnuncios** - Completar migración a Prisma
4. **Sincronizar tipos** - Alinear TypeScript con esquema de BD

---

## 📝 Notas de Desarrollo

- **Base de datos:** PostgreSQL en Supabase
- **ORM:** Prisma
- **Frontend:** React + TypeScript + ShadcN/UI
- **Autenticación:** bcrypt para passwords
- **Estado:** Context API + custom hooks

## 🔗 Enlaces Útiles

- [Documentación de Prisma](https://www.prisma.io/docs)
- [ShadcN/UI Components](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
