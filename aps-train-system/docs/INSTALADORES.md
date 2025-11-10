# Guía de Instaladores Automáticos

Esta guía explica cómo usar los instaladores automáticos para desplegar el sistema APS Train de forma fácil y rápida.

---

## 📦 Instaladores Disponibles

### 1. `install.sh` - Instalador Local con Docker

**Para qué sirve:** Desplegar todo el sistema en tu máquina local con Docker Compose.

**Ideal para:**
- ✅ Desarrollo local
- ✅ Testing en tu máquina
- ✅ Demo local del sistema

**Requisitos:**
- Docker
- Docker Compose
- Node.js y npm (opcional, solo para modo desarrollo)

---

### 2. `install-easypanel.js` - Generador de Guía para Easypanel

**Para qué sirve:** Crear una guía personalizada paso a paso para desplegar en Easypanel.

**Ideal para:**
- ✅ Despliegue en producción
- ✅ Sistema accesible desde internet
- ✅ Persistencia real con PostgreSQL y Redis

**Requisitos:**
- Node.js
- Cuenta en Easypanel

---

## 🚀 Uso del Instalador Local (install.sh)

### Instalación Rápida

```bash
# 1. Ve al directorio del proyecto
cd aps-train-system

# 2. Dale permisos de ejecución al instalador
chmod +x install.sh

# 3. Ejecuta el instalador
./install.sh
```

### Opciones de Instalación

El instalador te preguntará qué modo quieres usar:

#### Opción 1: Modo Desarrollo
```
Solo bases de datos en Docker, frontend/backend con npm
```

**Qué hace:**
- Inicia PostgreSQL y Redis en Docker
- Necesitas ejecutar manualmente: `npm run dev:all`

**Cuándo usar:**
- Estás desarrollando y quieres hot-reload
- Quieres ver cambios en tiempo real

**Acceso:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

#### Opción 2: Producción Local ⭐ RECOMENDADO
```
Todo en Docker (PostgreSQL, Redis, Backend, Frontend)
```

**Qué hace:**
- Inicia todos los servicios en Docker
- No necesitas Node.js instalado
- Listo para usar inmediatamente

**Cuándo usar:**
- Quieres probar el sistema completo
- Quieres simular producción localmente
- No quieres instalar dependencias npm

**Acceso:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

#### Opción 3: Con Herramientas de Admin
```
Producción + pgAdmin + Redis Commander
```

**Qué hace:**
- Todo lo de la opción 2
- Además: pgAdmin y Redis Commander para administrar las bases de datos

**Cuándo usar:**
- Quieres ver los datos directamente en PostgreSQL
- Necesitas debuggear problemas de persistencia

**Acceso:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- pgAdmin: http://localhost:8080 (usuario: admin@aps.local, password: admin)
- Redis Commander: http://localhost:8081

### Ejemplo de Uso Completo

```bash
# Ejecutar instalador
./install.sh

# El instalador pregunta:
# Selecciona una opción [1-3] (default: 2):
# Escribe: 2 (Enter)

# Espera 2-3 minutos mientras descarga imágenes...

# ✓ Instalación Completa
# Abre tu navegador en: http://localhost:3000
```

### Comandos Útiles Después de Instalar

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Actualizar código y reiniciar
git pull
docker-compose up -d --build

# Ver qué servicios están corriendo
docker-compose ps

# Health check del backend
curl http://localhost:3001/health
```

---

## 🌐 Uso del Generador para Easypanel (install-easypanel.js)

### Paso 1: Ejecutar el Generador

```bash
# 1. Ve al directorio del proyecto
cd aps-train-system

# 2. Ejecuta el generador interactivo
node install-easypanel.js
```

### Paso 2: Responder las Preguntas

El generador te preguntará:

```
1. Nombre del proyecto
   → default: aps-train-system

2. Repositorio GitHub
   → ejemplo: usuario/repositorio

3. Rama de GitHub
   → default: claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL

4. Configuración de PostgreSQL
   → Nombre de base de datos (default: aps_train_system)
   → Usuario (default: aps_user)
   → ¿Generar contraseña aleatoria? (S/n)

5. Nombres de servicios en Easypanel
   → PostgreSQL (default: aps-postgres)
   → Redis (default: aps-redis)
   → Backend (default: aps-backend)
   → Frontend (default: aps-frontend)

6. ¿Tienes dominio personalizado?
   → Si no, usa subdominios de Easypanel
```

### Paso 3: Archivos Generados

El generador crea **2 archivos**:

1. **`EASYPANEL_INSTALL.md`** - Guía paso a paso personalizada
   - Contiene todos los comandos exactos
   - Valores pre-rellenados con tus respuestas
   - Copy-paste directo a Easypanel

2. **`.env.easypanel`** - Variables de entorno listas
   - Puedes copiar/pegar directamente
   - Contraseñas generadas automáticamente
   - URLs internas configuradas

### Paso 4: Seguir la Guía Generada

Abre el archivo `EASYPANEL_INSTALL.md` y sigue los pasos:

```bash
# Ver la guía en terminal
cat EASYPANEL_INSTALL.md

# O abrirla en tu editor
code EASYPANEL_INSTALL.md
```

La guía incluye:
- ✅ Configuración exacta de cada servicio
- ✅ Variables de entorno pre-rellenadas
- ✅ Verificaciones para cada paso
- ✅ Troubleshooting de problemas comunes
- ✅ Comandos de verificación

### Ejemplo de Uso Completo

```bash
# 1. Ejecutar generador
node install-easypanel.js

# 2. Responder preguntas
Nombre del proyecto: mi-aps-system
Repositorio GitHub: usuario/mi-repo
... etc

# 3. Confirmar
¿Generar guía de instalación? (S/n): S

# 4. Archivos creados
✓ EASYPANEL_INSTALL.md - Guía paso a paso
✓ .env.easypanel - Variables de entorno

# 5. Abrir la guía
cat EASYPANEL_INSTALL.md

# 6. Seguir los 5 pasos en Easypanel:
#    - Crear PostgreSQL
#    - Crear Redis
#    - Crear Backend
#    - Crear Frontend
#    - Verificar
```

---

## 🆚 ¿Cuál Instalador Usar?

### Usa `install.sh` si:
- ✅ Quieres probar el sistema localmente
- ✅ Estás desarrollando funcionalidades nuevas
- ✅ No tienes cuenta en Easypanel aún
- ✅ Quieres hacer una demo offline
- ✅ No necesitas que sea accesible desde internet

### Usa `install-easypanel.js` si:
- ✅ Quieres desplegar en producción
- ✅ Necesitas que sea accesible desde internet
- ✅ Quieres persistencia real y duradera
- ✅ Tienes cuenta en Easypanel
- ✅ Quieres un sistema listo para producción

---

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd aps-train-system

# 2. Instalar localmente (modo desarrollo)
./install.sh
# Elige opción 1

# 3. Desarrollar
npm run dev:all
# Haz cambios, guarda, recarga navegador

# 4. Cuando termines
docker-compose down
```

### Para Despliegue en Producción

```bash
# 1. Asegurarte de que todo funciona localmente
./install.sh
# Elige opción 2
# Prueba en http://localhost:3000

# 2. Si todo funciona, generar guía para Easypanel
node install-easypanel.js
# Responde las preguntas

# 3. Seguir EASYPANEL_INSTALL.md paso a paso
# Abre Easypanel y crea los 4 servicios

# 4. Verificar que funciona en producción
curl https://tu-backend.easypanel.host/health
```

---

## ❓ Preguntas Frecuentes

### ¿Necesito conocimientos técnicos?

**Para `install.sh`:** Solo necesitas saber usar la terminal y tener Docker instalado.

**Para `install-easypanel.js`:** Necesitas saber usar Easypanel, pero la guía generada te lleva paso a paso.

### ¿Qué pasa si algo falla?

**Local:** Ejecuta `docker-compose logs -f` para ver qué servicio falló.

**Easypanel:** La guía incluye una sección de "Solución de Problemas" con los errores más comunes.

### ¿Puedo usar ambos instaladores?

Sí, de hecho es lo recomendado:
1. Usa `install.sh` para probar localmente
2. Cuando funcione, usa `install-easypanel.js` para desplegar

### ¿Los datos se pierden al reiniciar?

**Local (Docker):** No, Docker Compose usa volúmenes persistentes.

**Easypanel:** No, PostgreSQL y Redis tienen almacenamiento persistente.

### ¿Cuánto tarda la instalación?

**Local (primera vez):**
- Descarga de imágenes: 5-10 minutos
- Inicio de servicios: 1-2 minutos
- **Total: ~10-15 minutos**

**Easypanel (primera vez):**
- Creación de servicios: 2-3 minutos cada uno
- Build del backend: 5-7 minutos
- Build del frontend: 3-5 minutos
- **Total: ~20-25 minutos**

---

## 🎯 Resumen Rápido

### Instalación Local en 3 Comandos

```bash
cd aps-train-system
chmod +x install.sh
./install.sh
```

### Instalación en Easypanel en 2 Pasos

```bash
# 1. Generar guía
node install-easypanel.js

# 2. Seguir EASYPANEL_INSTALL.md
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   # Local
   docker-compose logs -f

   # Easypanel
   Ve a cada servicio → pestaña "Logs"
   ```

2. **Consulta la documentación:**
   - `docs/DEPLOYMENT.md` - Despliegue manual detallado
   - `EASYPANEL_INSTALL.md` - Guía generada personalizada
   - `README.md` - Documentación general

3. **Verifica requisitos:**
   - Docker y Docker Compose instalados
   - Node.js 18+ (para desarrollo)
   - Puertos libres: 3000, 3001, 5432, 6379

---

**¡Listo! Ahora tienes todo lo necesario para instalar el sistema de forma automática** 🚀
