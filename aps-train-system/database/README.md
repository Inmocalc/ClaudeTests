# Database Setup

Este directorio contiene el esquema y migraciones para la base de datos PostgreSQL del Sistema APS.

## Estructura

- `schema.sql` - Esquema completo de la base de datos con datos de prueba

## Requisitos

- PostgreSQL 12 o superior
- Cliente `psql` (opcional, para ejecutar migraciones manualmente)

## Configuración con Docker Compose

La forma más sencilla es usar Docker Compose (ver `docker-compose.yml` en la raíz del proyecto):

```bash
# Levantar servicios (PostgreSQL + Redis)
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

## Aplicar el Esquema

### Opción 1: Automática (desde la aplicación)

La aplicación puede inicializar el esquema automáticamente cuando usa PostgresOrderRepository:

```typescript
const repository = new PostgresOrderRepository();
await repository.initializeSchema();
```

### Opción 2: Manual con psql

```bash
# Conectar a PostgreSQL
psql -h localhost -U aps_user -d aps_train_system

# Ejecutar el esquema
\i database/schema.sql

# Verificar tablas
\dt

# Ver datos de ejemplo
SELECT * FROM production_orders;
```

### Opción 3: Con Docker

```bash
# Ejecutar esquema en contenedor Docker
docker-compose exec postgres psql -U aps_user -d aps_train_system -f /docker-entrypoint-initdb.d/schema.sql
```

## Variables de Entorno

Configura estas variables en tu archivo `.env`:

```env
DATABASE_URL=postgresql://aps_user:aps_password@localhost:5432/aps_train_system
REDIS_URL=redis://localhost:6379
```

## Estructura de Tablas

### production_orders

Almacena todas las órdenes de producción del sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(50) | Identificador único de la orden |
| model_type | VARCHAR(10) | Tipo de modelo de tren (A, B, C) |
| due_date | DATE | Fecha límite de entrega |
| priority | INTEGER | Prioridad (menor = más prioritario) |
| status | VARCHAR(20) | Estado actual |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### Índices

- `idx_orders_status` - Búsqueda por estado
- `idx_orders_due_date` - Ordenamiento por fecha límite
- `idx_orders_model_type` - Filtrado por modelo
- `idx_orders_priority` - Ordenamiento por prioridad
- `idx_orders_created_at` - Ordenamiento cronológico

## Datos de Prueba

El esquema incluye 5 órdenes de ejemplo:
- ORD-001 a ORD-005
- Distribuidas entre modelos A, B, C
- Todas en estado 'pending'

## Troubleshooting

### Error de conexión

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Error de permisos

```bash
# Conectar como superusuario
docker-compose exec postgres psql -U postgres

# Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE aps_train_system TO aps_user;
```

### Resetear base de datos

```bash
# Eliminar y recrear
docker-compose down -v
docker-compose up -d
docker-compose exec postgres psql -U aps_user -d aps_train_system -f /docker-entrypoint-initdb.d/schema.sql
```
