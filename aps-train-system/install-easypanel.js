#!/usr/bin/env node

/**
 * APS Train System - Instalador Interactivo para Easypanel
 *
 * Este script genera los comandos y archivos necesarios para desplegar
 * en Easypanel de forma manual (Easypanel no tiene API pública estable)
 */

import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}==>${colors.reset} ${msg}\n`),
};

// Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚂 APS Train System - Instalador para Easypanel       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

log.info('Este asistente te guiará para generar la configuración de Easypanel');
log.info('Al final tendrás una guía con todos los pasos a seguir');
console.log('');

async function main() {
  const config = {};

  // Paso 1: Información básica
  log.step('Paso 1/5: Información del Proyecto');

  config.projectName = await question('Nombre del proyecto (default: aps-train-system): ') || 'aps-train-system';
  config.githubRepo = await question('Repositorio GitHub (ej: usuario/repo): ');
  config.githubBranch = await question('Rama (default: claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL): ')
    || 'claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL';

  // Paso 2: PostgreSQL
  log.step('Paso 2/5: Configuración de PostgreSQL');

  config.dbName = await question('Nombre de base de datos (default: aps_train_system): ') || 'aps_train_system';
  config.dbUser = await question('Usuario de base de datos (default: aps_user): ') || 'aps_user';

  const useRandomPassword = await question('¿Generar contraseña aleatoria? (S/n): ');
  if (useRandomPassword.toLowerCase() !== 'n') {
    config.dbPassword = randomBytes(16).toString('base64').slice(0, 24);
    log.success(`Contraseña generada: ${config.dbPassword}`);
  } else {
    config.dbPassword = await question('Contraseña de base de datos: ');
  }

  // Paso 3: Nombres de servicios internos
  log.step('Paso 3/5: Nombres de Servicios en Easypanel');

  log.info('Estos nombres se usan para la comunicación interna entre servicios');
  config.postgresServiceName = await question('Nombre servicio PostgreSQL (default: aps-postgres): ') || 'aps-postgres';
  config.redisServiceName = await question('Nombre servicio Redis (default: aps-redis): ') || 'aps-redis';
  config.backendServiceName = await question('Nombre servicio Backend (default: aps-backend): ') || 'aps-backend';
  config.frontendServiceName = await question('Nombre servicio Frontend (default: aps-frontend): ') || 'aps-frontend';

  // Paso 4: Dominio (opcional)
  log.step('Paso 4/5: Configuración de Dominio');

  const hasDomain = await question('¿Tienes un dominio personalizado? (s/N): ');
  if (hasDomain.toLowerCase() === 's') {
    config.frontendDomain = await question('Dominio para el frontend (ej: aps.tudominio.com): ');
    config.backendDomain = await question('Dominio para el backend (ej: api.tudominio.com): ');
  } else {
    log.info('Se usarán los subdominios generados por Easypanel');
    config.frontendDomain = `${config.frontendServiceName}.easypanel.host`;
    config.backendDomain = `${config.backendServiceName}.easypanel.host`;
  }

  // Paso 5: Confirmar
  log.step('Paso 5/5: Confirmación');

  console.log('Resumen de la configuración:');
  console.log(`  Proyecto: ${config.projectName}`);
  console.log(`  GitHub: ${config.githubRepo}@${config.githubBranch}`);
  console.log(`  Base de datos: ${config.dbName}`);
  console.log(`  Usuario DB: ${config.dbUser}`);
  console.log(`  Servicios PostgreSQL: ${config.postgresServiceName}`);
  console.log(`  Servicios Redis: ${config.redisServiceName}`);
  console.log(`  Servicios Backend: ${config.backendServiceName}`);
  console.log(`  Servicios Frontend: ${config.frontendServiceName}`);
  console.log(`  URL Backend: https://${config.backendDomain}`);
  console.log(`  URL Frontend: https://${config.frontendDomain}`);
  console.log('');

  const confirm = await question('¿Generar guía de instalación? (S/n): ');
  if (confirm.toLowerCase() === 'n') {
    log.warning('Instalación cancelada');
    rl.close();
    return;
  }

  // Generar archivos
  generateInstallationGuide(config);
  generateEnvFile(config);

  log.success('Archivos generados correctamente');
  console.log('');
  log.info('Archivos creados:');
  log.info('  📄 EASYPANEL_INSTALL.md - Guía paso a paso');
  log.info('  📄 .env.easypanel - Variables de entorno');
  console.log('');
  log.success('¡Listo! Abre EASYPANEL_INSTALL.md para continuar con la instalación');

  rl.close();
}

function generateEnvFile(config) {
  const envContent = `# Configuración generada para Easypanel
# Generado: ${new Date().toISOString()}

# PostgreSQL (para servicio Backend)
DATABASE_URL=postgresql://${config.dbUser}:${config.dbPassword}@${config.postgresServiceName}:5432/${config.dbName}
POSTGRES_USER=${config.dbUser}
POSTGRES_PASSWORD=${config.dbPassword}
POSTGRES_DB=${config.dbName}

# Redis (para servicio Backend)
REDIS_URL=redis://${config.redisServiceName}:6379

# Backend API
NODE_ENV=production
PORT=3001
PERSISTENCE_MODE=hybrid

# Frontend (para servicio Frontend)
VITE_API_URL=https://${config.backendDomain}/api
`;

  writeFileSync('.env.easypanel', envContent);
}

function generateInstallationGuide(config) {
  const guide = `# Guía de Instalación en Easypanel

**Proyecto:** ${config.projectName}
**Generado:** ${new Date().toLocaleString()}

---

## 📋 Resumen

Esta guía te llevará paso a paso para desplegar el sistema APS Train completo en Easypanel.

**Servicios a crear (en orden):**
1. PostgreSQL - Base de datos
2. Redis - Caché
3. Backend API - Servidor Express
4. Frontend - Aplicación React

**URLs finales:**
- Frontend: https://${config.frontendDomain}
- Backend API: https://${config.backendDomain}

---

## 🗄️ PASO 1: Crear Servicio PostgreSQL

1. En Easypanel, click en **"Create"** → **"App"**
2. Selecciona **"PostgreSQL"** del catálogo de templates
3. Configuración:

\`\`\`
Nombre del servicio: ${config.postgresServiceName}
Database Name: ${config.dbName}
Username: ${config.dbUser}
Password: ${config.dbPassword}
Puerto: 5432
\`\`\`

4. Click en **"Create"**
5. Espera a que el servicio esté en estado **"Running"** (tarda ~2 minutos)

✅ **Verificación:** El servicio debe aparecer con estado verde

**Nota:** Guarda esta información, la necesitarás para el backend:
\`\`\`
URL interna: postgresql://${config.dbUser}:${config.dbPassword}@${config.postgresServiceName}:5432/${config.dbName}
\`\`\`

---

## 🔴 PASO 2: Crear Servicio Redis

1. Click en **"Create"** → **"App"**
2. Selecciona **"Redis"** del catálogo de templates
3. Configuración:

\`\`\`
Nombre del servicio: ${config.redisServiceName}
Puerto: 6379
\`\`\`

4. Click en **"Create"**
5. Espera a que el servicio esté **"Running"** (~1 minuto)

✅ **Verificación:** Servicio en estado verde

**Nota:** URL interna: \`redis://${config.redisServiceName}:6379\`

---

## 🖥️ PASO 3: Crear Servicio Backend API

1. Click en **"Create"** → **"App"**
2. Selecciona **"GitHub"** como fuente
3. **Configuración del repositorio:**

\`\`\`
Repository: ${config.githubRepo}
Branch: ${config.githubBranch}
Build Path: /aps-train-system (si el proyecto está en subcarpeta)
\`\`\`

4. **Configuración de Build:**

\`\`\`
Build Method: Dockerfile
Dockerfile Path: Dockerfile.backend
Port: 3001
\`\`\`

5. **Variables de entorno** (click en "Environment" → "Add Variable"):

\`\`\`bash
DATABASE_URL=postgresql://${config.dbUser}:${config.dbPassword}@${config.postgresServiceName}:5432/${config.dbName}
REDIS_URL=redis://${config.redisServiceName}:6379
PERSISTENCE_MODE=hybrid
NODE_ENV=production
PORT=3001
\`\`\`

6. **Health Check** (opcional pero recomendado):

\`\`\`
Path: /health
Port: 3001
Interval: 30s
Timeout: 10s
\`\`\`

7. **Dominio** (en la pestaña "Domains"):
   - Agrega: \`${config.backendDomain}\`
   - Habilita SSL automático

8. Click en **"Deploy"**

9. Espera a que el build termine (~5 minutos en la primera vez)

✅ **Verificación:**
\`\`\`bash
curl https://${config.backendDomain}/health
# Debe responder: {"status":"ok","timestamp":"...","persistenceMode":"hybrid"}
\`\`\`

**⚠️ IMPORTANTE:** Copia la URL pública del backend, la necesitarás para el frontend:
\`\`\`
https://${config.backendDomain}
\`\`\`

---

## 🎨 PASO 4: Crear Servicio Frontend

1. Click en **"Create"** → **"App"**
2. Selecciona **"GitHub"** como fuente
3. **Configuración del repositorio:**

\`\`\`
Repository: ${config.githubRepo}
Branch: ${config.githubBranch}
Build Path: /aps-train-system (si el proyecto está en subcarpeta)
\`\`\`

4. **Configuración de Build:**

\`\`\`
Build Method: Dockerfile
Dockerfile Path: Dockerfile
Port: 80
\`\`\`

5. **Variables de entorno:**

\`\`\`bash
VITE_API_URL=https://${config.backendDomain}/api
\`\`\`

**⚠️ CRÍTICO:** Asegúrate de usar la URL **pública** del backend (con https://)

6. **Dominio** (en la pestaña "Domains"):
   - Agrega: \`${config.frontendDomain}\`
   - Habilita SSL automático

7. Click en **"Deploy"**

8. Espera a que el build termine (~3 minutos)

✅ **Verificación:** Abre https://${config.frontendDomain} en tu navegador

---

## ✅ PASO 5: Verificación Final

### 1. Verifica que todos los servicios estén corriendo

En Easypanel, deberías ver 4 servicios con estado verde:
- ✅ ${config.postgresServiceName}
- ✅ ${config.redisServiceName}
- ✅ ${config.backendServiceName}
- ✅ ${config.frontendServiceName}

### 2. Prueba el Backend API

\`\`\`bash
# Health check
curl https://${config.backendDomain}/health

# Listar operaciones (debe devolver array vacío o con datos)
curl https://${config.backendDomain}/api/operations

# Listar órdenes
curl https://${config.backendDomain}/api/orders
\`\`\`

### 3. Prueba el Frontend

1. Abre: https://${config.frontendDomain}
2. Deberías ver el Dashboard del sistema APS
3. Ve a **Configuración → Operaciones**
4. Añade una operación de prueba:
   - Nombre: "Prueba"
   - Duración: 1 día
   - Trabajadores: 2
5. Click en **"Añadir Operación"**
6. Recarga la página
7. ✅ La operación debe aparecer (significa que persiste en Redis)

### 4. Prueba la Persistencia

1. En Easypanel, reinicia el servicio **${config.backendServiceName}**
2. Espera a que vuelva a estar "Running"
3. Abre el frontend: https://${config.frontendDomain}
4. ✅ Los datos deben seguir ahí (persistencia funcionando)

---

## 🔧 Solución de Problemas

### Problema: Backend no inicia (error 502/503)

**Causa probable:** No puede conectarse a PostgreSQL o Redis

**Solución:**
1. Ve al servicio Backend → Logs
2. Busca errores de conexión
3. Verifica que las variables de entorno DATABASE_URL y REDIS_URL sean correctas
4. Verifica que PostgreSQL y Redis estén corriendo

### Problema: Frontend muestra página en blanco

**Causa probable:** Build falló o configuración incorrecta

**Solución:**
1. Ve al servicio Frontend → Logs
2. Busca errores de build
3. Verifica que VITE_API_URL apunte a la URL **pública** del backend (https://)

### Problema: Frontend no se comunica con Backend

**Causa probable:** CORS o URL incorrecta

**Solución:**
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores de red (Network errors)
4. Verifica que VITE_API_URL sea correcta en el servicio Frontend
5. Verifica que termine en \`/api\` → ejemplo: \`https://${config.backendDomain}/api\`

### Problema: Los datos no persisten

**Causa probable:** PERSISTENCE_MODE incorrecto

**Solución:**
1. Ve al servicio Backend → Environment
2. Verifica que \`PERSISTENCE_MODE=hybrid\`
3. Reinicia el servicio Backend

### Problema: Error en el schema de PostgreSQL

**Solución:**
1. Accede a la consola del servicio Backend en Easypanel
2. El schema se inicializa automáticamente al arrancar
3. Si falla, verifica los logs del backend

---

## 📊 Monitoreo

### Logs en Tiempo Real

Para cada servicio, en Easypanel:
1. Click en el servicio
2. Ve a la pestaña "Logs"
3. Habilita "Auto-scroll"

### Métricas

En cada servicio puedes ver:
- CPU usage
- Memory usage
- Network traffic
- Uptime

---

## 🔄 Actualización del Sistema

Cuando hagas cambios en el código y los subas a GitHub:

1. Ve al servicio (Backend o Frontend) en Easypanel
2. Click en **"Rebuild"**
3. Espera a que termine el build
4. El servicio se reiniciará automáticamente

**Tip:** Puedes configurar webhooks para que se actualice automáticamente al hacer push.

---

## 🎉 ¡Instalación Completa!

Tu sistema APS Train está ahora desplegado en producción con:

✅ PostgreSQL para almacenar órdenes de producción
✅ Redis para cachear configuración
✅ Backend API con persistencia híbrida
✅ Frontend React con interfaz completa
✅ HTTPS/SSL automático
✅ Health checks configurados

**URLs de tu sistema:**
- 🌐 Frontend: https://${config.frontendDomain}
- 🔌 Backend API: https://${config.backendDomain}
- 🏥 Health Check: https://${config.backendDomain}/health

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa esta guía desde el inicio
2. Verifica los logs de cada servicio
3. Consulta \`docs/DEPLOYMENT.md\` en el repositorio
4. Revisa la sección de troubleshooting arriba

---

**Guía generada automáticamente por el instalador de APS Train System**
`;

  writeFileSync('EASYPANEL_INSTALL.md', guide);
}

// Ejecutar
main().catch((error) => {
  log.error(`Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
