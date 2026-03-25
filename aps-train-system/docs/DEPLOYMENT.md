# Guía de Despliegue - APS Train System

Esta guía explica cómo desplegar el sistema APS Train con persistencia completa (PostgreSQL + Redis).

## 📋 Tabla de Contenidos

1. [Despliegue Local con Docker Compose (Llave en Mano)](#1-despliegue-local-con-docker-compose-llave-en-mano)
2. [Despliegue en Easypanel](#2-despliegue-en-easypanel)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Verificación del Despliegue](#4-verificación-del-despliegue)

---

## 1. Despliegue Local con Docker Compose (Llave en Mano)

Esta es la forma **más sencilla** de desplegar todo el sistema. Con un solo comando se levantan los 4 servicios necesarios.

### Servicios Incluidos

- **PostgreSQL**: Base de datos para órdenes de producción
- **Redis**: Caché para configuraciones (operaciones, líneas, procesos)
- **Backend API**: Servidor Express que expone los endpoints REST
- **Frontend**: Aplicación React servida con Nginx

### Opción A: Desarrollo Local (solo bases de datos)

Para desarrollo, ejecuta solo PostgreSQL y Redis, y el backend/frontend desde Node.js:

```bash
# 1. Levantar solo las bases de datos
docker-compose up -d postgres redis

# 2. En una terminal, iniciar el backend
npm run dev:backend

# 3. En otra terminal, iniciar el frontend
npm run dev

# Acceder a:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Opción B: Producción Local (todos los servicios)

Para simular producción completa con Docker:

```bash
# Levantar todos los servicios (PostgreSQL, Redis, Backend, Frontend)
docker-compose --profile production up -d

# Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
```

### Opción C: Con herramientas de administración

Para incluir pgAdmin (PostgreSQL) y Redis Commander:

```bash
# Levantar todo incluyendo herramientas de administración
docker-compose --profile tools --profile production up -d

# Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - pgAdmin: http://localhost:8080 (admin@aps.local / admin)
# - Redis Commander: http://localhost:8081
```

### Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! borra los datos)
docker-compose down -v

# Reconstruir las imágenes
docker-compose build

# Reconstruir y reiniciar
docker-compose up -d --build
```

---

## 2. Despliegue en Easypanel

Easypanel requiere crear cada servicio por separado. Sigue estos pasos:

### Paso 1: Crear servicio PostgreSQL

1. En Easypanel, crea un nuevo servicio
2. Selecciona **"App"** → **"PostgreSQL"** (template)
3. Configuración:
   - **Nombre**: `aps-postgres`
   - **Database Name**: `aps_train_system`
   - **Username**: `aps_user`
   - **Password**: `aps_password` (genera una segura)
   - **Puerto interno**: `5432`
4. Guarda la **URL de conexión interna** (ej: `postgresql://aps_user:aps_password@aps-postgres:5432/aps_train_system`)

### Paso 2: Crear servicio Redis

1. Crea un nuevo servicio
2. Selecciona **"App"** → **"Redis"** (template)
3. Configuración:
   - **Nombre**: `aps-redis`
   - **Puerto interno**: `6379`
4. Guarda la **URL de conexión interna** (ej: `redis://aps-redis:6379`)

### Paso 3: Crear servicio Backend API

1. Crea un nuevo servicio
2. Selecciona **"App"** → **"GitHub"**
3. Configuración:
   - **Nombre**: `aps-backend`
   - **Repositorio**: Tu repositorio de GitHub
   - **Rama**: `claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL`
   - **Build Method**: Dockerfile
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Puerto**: `3001`

4. **Variables de entorno**:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://aps_user:TU_PASSWORD@aps-postgres:5432/aps_train_system
   REDIS_URL=redis://aps-redis:6379
   PERSISTENCE_MODE=hybrid
   ```

5. **Importante**: En la sección de "Health Check":
   - Path: `/health`
   - Puerto: `3001`
   - Interval: `30s`

6. Guarda la **URL pública** del backend (ej: `https://aps-backend.easypanel.host`)

### Paso 4: Crear servicio Frontend

1. Crea un nuevo servicio
2. Selecciona **"App"** → **"GitHub"**
3. Configuración:
   - **Nombre**: `aps-frontend`
   - **Repositorio**: Tu repositorio de GitHub
   - **Rama**: `claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL`
   - **Build Method**: Dockerfile
   - **Dockerfile Path**: `Dockerfile`
   - **Puerto**: `80`

4. **Variables de entorno**:
   ```
   VITE_API_URL=https://aps-backend.easypanel.host/api
   ```
   ⚠️ **IMPORTANTE**: Usa la URL pública del backend del Paso 3

5. **Dominios**: Configura el dominio público para acceder a la aplicación

### Paso 5: Inicializar Base de Datos

La primera vez que despliegues, necesitas ejecutar el schema SQL:

**Opción A: Desde pgAdmin (si lo instalaste)**
1. Accede a pgAdmin en Easypanel
2. Conecta a la base de datos `aps-postgres`
3. Ejecuta el archivo `database/schema.sql`

**Opción B: Desde la consola del contenedor**
1. En Easypanel, accede a la consola del servicio `aps-backend`
2. Ejecuta:
   ```bash
   # El backend automáticamente inicializa el schema al arrancar
   # Si no, puedes hacerlo manualmente con psql
   ```

**Nota**: El backend ya está configurado para inicializar el schema automáticamente en el primer arranque (ver `RepositoryFactory.initializeDatabase()` en `server.ts`).

---

## 3. Variables de Entorno

### Backend API

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` | ✅ Sí |
| `REDIS_URL` | URL de conexión a Redis | `redis://host:6379` | ✅ Sí |
| `PERSISTENCE_MODE` | Modo de persistencia | `hybrid` (recomendado) | ✅ Sí |
| `NODE_ENV` | Entorno de ejecución | `production` | ❌ No |
| `PORT` | Puerto del servidor | `3001` | ❌ No |

#### Modos de persistencia

- **`memory`**: Todo en memoria (solo para desarrollo/testing)
- **`redis`**: Configuración en Redis, órdenes en memoria
- **`postgres`**: Órdenes en PostgreSQL, configuración en memoria
- **`hybrid`**: ✅ **Recomendado** - Configuración en Redis + Órdenes en PostgreSQL

### Frontend

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `VITE_API_URL` | URL del backend API | `http://localhost:3001/api` | ✅ Sí |

---

## 4. Verificación del Despliegue

### Verificar Backend API

```bash
# Health check
curl http://localhost:3001/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "persistenceMode": "hybrid"
}
```

### Verificar Conexiones

```bash
# Verificar operaciones
curl http://localhost:3001/api/operations

# Verificar líneas
curl http://localhost:3001/api/lines

# Verificar órdenes
curl http://localhost:3001/api/orders
```

### Verificar Frontend

1. Accede a la URL del frontend
2. Deberías ver el Dashboard con:
   - Resumen de órdenes
   - Estadísticas
   - Formulario para añadir órdenes
3. Prueba crear una operación en **Configuración → Operaciones**
4. Verifica que se guarde (recarga la página y debe aparecer)

### Logs

**Docker Compose Local:**
```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ver logs de Redis
docker-compose logs -f redis
```

**Easypanel:**
- Accede a cada servicio y ve a la pestaña "Logs"
- Busca errores de conexión o inicialización

---

## 🚀 Resumen Rápido

### Desarrollo Local
```bash
docker-compose up -d postgres redis
npm run dev:all
```

### Producción Local (Llave en Mano)
```bash
docker-compose --profile production up -d
```

### Easypanel
1. Crea PostgreSQL service
2. Crea Redis service
3. Crea Backend service (con Dockerfile.backend)
4. Crea Frontend service (con Dockerfile)
5. Configura variables de entorno
6. ¡Listo!

---

## 🔧 Solución de Problemas

### Error: Backend no puede conectarse a PostgreSQL

- Verifica que la `DATABASE_URL` sea correcta
- En Easypanel, usa el nombre interno del servicio (ej: `aps-postgres`)
- Espera a que PostgreSQL esté listo antes de iniciar el backend

### Error: Frontend no puede comunicarse con Backend

- Verifica `VITE_API_URL` en el frontend
- En Easypanel, usa la **URL pública** del backend
- Verifica que el backend tenga CORS habilitado (ya incluido en `server.ts`)

### Error: 502 Bad Gateway

- El backend no está listo o falló al iniciar
- Revisa los logs del backend
- Verifica las variables de entorno

### Los datos no persisten

- Verifica que `PERSISTENCE_MODE=hybrid`
- Verifica que PostgreSQL y Redis estén corriendo
- Revisa los logs del backend para errores de conexión
