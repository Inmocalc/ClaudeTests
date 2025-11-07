# Capa de Persistencia - Fase 5

Esta guía explica cómo usar la capa de persistencia con Redis y PostgreSQL.

## Modos de Persistencia

El sistema soporta 4 modos de persistencia configurables:

### 1. Memory (Por Defecto)
```env
PERSISTENCE_MODE=memory
```
- **Configuración**: En memoria
- **Órdenes**: En memoria
- **Uso**: Desarrollo y pruebas
- **Ventajas**: No requiere servicios externos, rápido
- **Desventajas**: Los datos se pierden al reiniciar

### 2. Redis
```env
PERSISTENCE_MODE=redis
REDIS_URL=redis://localhost:6379
```
- **Configuración**: Redis
- **Órdenes**: En memoria
- **Uso**: Desarrollo con persistencia de configuración
- **Ventajas**: Configuración persiste entre reinicios
- **Desventajas**: Órdenes se pierden al reiniciar

### 3. PostgreSQL
```env
PERSISTENCE_MODE=postgres
DATABASE_URL=postgresql://aps_user:aps_password@localhost:5432/aps_train_system
```
- **Configuración**: En memoria
- **Órdenes**: PostgreSQL
- **Uso**: Desarrollo con historial de órdenes
- **Ventajas**: Historial completo de órdenes
- **Desventajas**: Configuración se pierde al reiniciar

### 4. Hybrid (Recomendado para Producción)
```env
PERSISTENCE_MODE=hybrid
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://aps_user:aps_password@localhost:5432/aps_train_system
```
- **Configuración**: Redis
- **Órdenes**: PostgreSQL
- **Uso**: Producción
- **Ventajas**: Persistencia completa, rendimiento óptimo
- **Desventajas**: Requiere ambos servicios

## Quick Start

### Con Docker Compose (Recomendado)

1. **Iniciar servicios**:
```bash
# Solo PostgreSQL y Redis
docker-compose up -d postgres redis

# Con herramientas de administración (opcional)
docker-compose --profile tools up -d
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env`:
```env
PERSISTENCE_MODE=hybrid
DATABASE_URL=postgresql://aps_user:aps_password@localhost:5432/aps_train_system
REDIS_URL=redis://localhost:6379
```

3. **Iniciar aplicación**:
```bash
npm run dev
```

La aplicación automáticamente:
- Se conectará a Redis y PostgreSQL
- Inicializará el esquema de base de datos
- Cargará datos de ejemplo si la BD está vacía

### Sin Docker (Instalación Manual)

1. **Instalar PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql

# macOS
brew install postgresql

# Crear base de datos
createdb aps_train_system
psql aps_train_system < database/schema.sql
```

2. **Instalar Redis**:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Iniciar Redis
redis-server
```

3. **Configurar y ejecutar**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   Application Layer                 │
│                    (Use Cases)                      │
└────────────┬─────────────────────────┬──────────────┘
             │                         │
             ▼                         ▼
    ┌────────────────┐        ┌────────────────┐
    │ IConfigRepo    │        │ IOrderRepo     │
    │  (Interface)   │        │  (Interface)   │
    └────────┬───────┘        └────────┬───────┘
             │                         │
    ┌────────┴─────────┐      ┌────────┴──────────┐
    │                  │      │                   │
    ▼                  ▼      ▼                   ▼
┌────────┐     ┌─────────┐  ┌───────┐    ┌─────────┐
│ Memory │     │  Redis  │  │Memory │    │Postgres │
└────────┘     └─────────┘  └───────┘    └─────────┘
```

### Decisiones de Diseño

**¿Por qué Redis para configuración?**
- Operaciones CRUD frecuentes
- Datos pequeños (operaciones, líneas, procesos)
- Necesita ser rápido y accesible
- Estructuras de datos flexibles (hash, sets, listas)

**¿Por qué PostgreSQL para órdenes?**
- Historial y auditoría importantes
- Consultas complejas (filtrado, ordenamiento)
- Relaciones y constraints
- Transacciones ACID

## Uso en Código

### Factory Pattern

```typescript
import { RepositoryFactory } from './infrastructure/persistence/RepositoryFactory';

// Automático: lee PERSISTENCE_MODE de .env
const configRepo = RepositoryFactory.createConfigRepository();
const orderRepo = RepositoryFactory.createOrderRepository();

// Manual: especificar modo
const configRepo = RepositoryFactory.createConfigRepository('hybrid');
const orderRepo = RepositoryFactory.createOrderRepository('hybrid');
```

### Inicialización

```typescript
// Inicializar esquema de base de datos (solo PostgreSQL)
await RepositoryFactory.initializeDatabase();

// Los repositorios son singleton, siempre obtienes la misma instancia
const repo1 = RepositoryFactory.createConfigRepository();
const repo2 = RepositoryFactory.createConfigRepository();
// repo1 === repo2 ✅
```

### Ejemplos de Uso

#### Configuración con Redis

```typescript
import { RepositoryFactory } from './infrastructure/persistence/RepositoryFactory';
import { OperationType } from './domain/entities/OperationType';

const configRepo = RepositoryFactory.createConfigRepository('redis');

// Guardar operación
const operation = OperationType.create({
  name: 'Montaje',
  description: 'Montaje de componentes principales',
  defaultDurationDays: 3,
  defaultWorkersRequired: 2,
  color: '#FF6B6B'
});

await configRepo.saveOperation(operation);

// Obtener todas las operaciones
const operations = await configRepo.getOperations();
console.log(operations); // [OperationType { name: 'Montaje', ... }]

// Eliminar operación
await configRepo.deleteOperation('Montaje');
```

#### Órdenes con PostgreSQL

```typescript
import { RepositoryFactory } from './infrastructure/persistence/RepositoryFactory';
import { ProductionOrder, OrderStatus } from './domain/entities/ProductionOrder';

const orderRepo = RepositoryFactory.createOrderRepository('postgres');

// Crear orden
const order = ProductionOrder.create({
  id: 'ORD-100',
  modelType: 'A',
  dueDate: '2025-12-01',
  priority: 1,
  status: OrderStatus.PENDING,
  createdAt: new Date().toISOString()
});

await orderRepo.save(order);

// Obtener órdenes pendientes
const pendingOrders = await orderRepo.getPendingOrdersSorted();

// Actualizar estado
await orderRepo.updateStatus('ORD-100', OrderStatus.IN_PROGRESS);

// Filtrar por modelo
const modelAOrders = await orderRepo.getByModel('A');
```

## Herramientas de Administración

### Redis Commander

Interface web para explorar datos en Redis:

```bash
# Iniciar con Docker Compose
docker-compose --profile tools up -d redis-commander

# Acceder en: http://localhost:8081
```

Operaciones útiles:
- Ver todas las claves: `KEYS *`
- Ver operaciones: `SMEMBERS operations:list`
- Ver una operación: `HGETALL operations:Montaje`

### pgAdmin

Interface web para administrar PostgreSQL:

```bash
# Iniciar con Docker Compose
docker-compose --profile tools up -d pgadmin

# Acceder en: http://localhost:8080
# Email: admin@aps.local
# Password: admin
```

## Troubleshooting

### Error de conexión a PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Error de conexión a Redis

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solución**:
```bash
# Verificar que Redis está corriendo
docker-compose ps redis

# Probar conexión
redis-cli ping  # Debe responder: PONG

# Reiniciar
docker-compose restart redis
```

### Tabla no existe en PostgreSQL

```
Error: relation "production_orders" does not exist
```

**Solución**:
```bash
# Opción 1: Ejecutar esquema manualmente
docker-compose exec postgres psql -U aps_user -d aps_train_system -f /docker-entrypoint-initdb.d/schema.sql

# Opción 2: Dejar que la aplicación lo inicialice
# La aplicación ejecuta initializeSchema() automáticamente en modo postgres/hybrid
```

### Datos antiguos en Redis

```bash
# Limpiar todos los datos
redis-cli FLUSHALL

# O usando el repositorio
const configRepo = new RedisConfigRepository();
await configRepo.clear();
```

### Resetear base de datos

```bash
# Eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d postgres redis
```

## Migraciones

Para cambios en el esquema de base de datos:

1. Modificar `database/schema.sql`
2. Crear script de migración en `database/migrations/`
3. Aplicar manualmente o mediante herramienta de migración

Ejemplo de migración:
```sql
-- database/migrations/001_add_order_notes.sql
ALTER TABLE production_orders
ADD COLUMN notes TEXT;
```

## Testing

### Testing con Modo Memory

```typescript
import { RepositoryFactory } from './infrastructure/persistence/RepositoryFactory';

beforeEach(() => {
  // Resetear repositorios entre tests
  RepositoryFactory.reset();
});

test('should save and retrieve order', async () => {
  const repo = RepositoryFactory.createOrderRepository('memory');

  const order = ProductionOrder.create({...});
  await repo.save(order);

  const retrieved = await repo.getById(order.id);
  expect(retrieved).toEqual(order);
});
```

### Testing con Base de Datos Real

```typescript
import { PostgresOrderRepository } from './infrastructure/persistence/postgres/PostgresOrderRepository';

beforeAll(async () => {
  // Usar base de datos de test
  process.env.DATABASE_URL = 'postgresql://localhost/aps_test';
  const repo = new PostgresOrderRepository();
  await repo.initializeSchema();
});

afterEach(async () => {
  // Limpiar datos entre tests
  const repo = new PostgresOrderRepository();
  await repo.clear();
});

afterAll(async () => {
  const repo = new PostgresOrderRepository();
  await repo.disconnect();
});
```

## Performance

### Redis

- **Operaciones**: ~50,000 ops/sec
- **Latencia**: <1ms
- **Uso de memoria**: ~1MB por 1000 configuraciones

### PostgreSQL

- **Queries simples**: ~1000 ops/sec
- **Queries complejas**: ~100 ops/sec
- **Espacio en disco**: ~1KB por orden

### Recomendaciones

1. Usar índices en PostgreSQL para consultas frecuentes (ya incluidos en schema.sql)
2. Usar conexión pool para PostgreSQL (ya configurado, max: 20 conexiones)
3. Configurar Redis con persistencia AOF para durabilidad
4. Monitorear uso de memoria de Redis
5. Hacer backup regular de PostgreSQL

## Seguridad

### Producción

1. **Credenciales**:
   - Usar contraseñas fuertes
   - No commitear archivo .env
   - Usar secrets management (AWS Secrets Manager, etc.)

2. **Networking**:
   - No exponer puertos de BD a internet
   - Usar VPC o redes privadas
   - Configurar firewall

3. **SSL/TLS**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
REDIS_URL=rediss://user:pass@host:6379  # note: rediss://
```

4. **Backup**:
```bash
# PostgreSQL
pg_dump aps_train_system > backup.sql

# Redis
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup-$(date +%Y%m%d).rdb
```

## Monitoreo

### Métricas Importantes

**Redis**:
- Memoria usada
- Comandos por segundo
- Hit rate de cache
- Conexiones activas

**PostgreSQL**:
- Conexiones activas
- Slow queries
- Tamaño de base de datos
- Cache hit ratio

### Comandos Útiles

```bash
# Redis stats
redis-cli INFO

# PostgreSQL stats
psql -c "SELECT * FROM pg_stat_activity;"
psql -c "SELECT pg_size_pretty(pg_database_size('aps_train_system'));"
```
