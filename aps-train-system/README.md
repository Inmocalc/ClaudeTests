# Sistema APS - Fabricación de Trenes

Sistema de Planificación y Programación Avanzada (APS) para optimizar la producción de trenes considerando recursos limitados y dependencias de procesos.

![Version](https://img.shields.io/badge/version-1.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## 📋 Descripción

Este sistema implementa un motor de programación avanzada (APS) para la fabricación de tres modelos de trenes (A, B, C), optimizando el uso de recursos limitados (trabajadores y líneas de producción) mientras respeta restricciones de proceso y fechas de entrega.

### Características Principales

- ✅ **Algoritmo Forward Scheduling** con prioridad EDD (Earliest Due Date)
- 📊 **Diagrama de Gantt Interactivo** con visualización temporal de procesos
- 📈 **Gráfico de Recursos** para monitorear disponibilidad vs. asignación de trabajadores
- ⚠️ **Detección de Conflictos** automática (entregas tardías, sobrecarga de recursos)
- 🎯 **Validación de Restricciones** en tiempo real
- 🔄 **Replanificación Automática** al agregar/eliminar órdenes

## 🚀 Inicio Rápido (Instaladores Automáticos)

### Instalación Local en 3 Comandos ⚡

```bash
cd aps-train-system
chmod +x install.sh
./install.sh
```

El instalador te guiará paso a paso y configurará todo automáticamente. En menos de 5 minutos tendrás el sistema corriendo en http://localhost:3000

### Instalación en Easypanel (Producción) 🌐

```bash
node install-easypanel.js
# Responde las preguntas
# Sigue la guía generada en EASYPANEL_INSTALL.md
```

El generador crea una guía personalizada con todos los comandos exactos para desplegar en Easypanel.

### 📚 Documentación Completa de Instaladores

Para más detalles sobre los instaladores automáticos, consulta:

**→ [docs/INSTALADORES.md](docs/INSTALADORES.md)** - Guía completa de uso de instaladores

---

## 🏗️ Arquitectura del Sistema

### Modelos de Datos

#### Modelos de Tren
- **Modelo A** (Alta Velocidad): Preparación 1d + Torneado 2d + Pintado 2d = 5 días
- **Modelo B** (Regional): Preparación 2d + Torneado 2d + Pintado 1d = 5 días
- **Modelo C** (Carga): Preparación 1d + Torneado 1d + Pintado 3d = 5 días

#### Procesos y Líneas de Producción
- **Preparación**: 2 líneas independientes (2 trabajadores c/u)
- **Torneado**: 1 línea (1 trabajador)
- **Pintado**: 1 línea (1 trabajador)

#### Recursos
- **Trabajadores**: 5 intercambiables con disponibilidad variable
  - 75% de días: 5 trabajadores disponibles
  - 25% de días: 3-4 trabajadores disponibles

### Reglas de Negocio

#### Restricciones Implementadas

1. **C1 - Dependencia Secuencial**: Un tren debe completar un proceso antes de iniciar el siguiente
2. **C2 - Capacidad de Línea**: Una unidad solo puede ocupar una línea a la vez
3. **C3 - Asignación de Trabajadores**: No se pueden exceder trabajadores disponibles
4. **C4 - Exclusividad de Trabajadores**: Un trabajador solo puede estar en un proceso por día
5. **C5 - Independencia de Líneas**: Las líneas de Preparación operan en paralelo

#### Algoritmo de Programación

```
1. Ordenar órdenes por fecha de entrega (EDD - Earliest Due Date)
2. Para cada orden:
   a. Asignar Proceso 1 en primera línea disponible con trabajadores suficientes
   b. Calcular fecha de finalización del Proceso 1
   c. Asignar Proceso 2 tras completar Proceso 1
   d. Asignar Proceso 3 tras completar Proceso 2
3. Validar restricciones
4. Detectar conflictos (entregas tardías, recursos insuficientes)
```

## 🏗️ Arquitectura Técnica (Hexagonal / Clean Architecture)

### Capas del Sistema

```
📁 Domain Layer (Núcleo del negocio)
  ├── entities/          # Entidades de dominio (ProductionOrder, OperationType, etc.)
  ├── repositories/      # Interfaces de repositorios (puertos)
  └── services/          # Servicios de dominio (SchedulingService, ValidationService)

📁 Application Layer (Casos de uso)
  ├── usecases/          # Use Cases (ScheduleOrders, ManageOperations, etc.)
  └── dto/               # Data Transfer Objects

📁 Infrastructure Layer (Adaptadores)
  └── persistence/       # Implementaciones de repositorios
      ├── memory/        # In-memory (desarrollo)
      ├── redis/         # Redis para configuración
      └── postgres/      # PostgreSQL para órdenes

📁 Presentation Layer (UI)
  ├── components/        # Componentes React
  ├── hooks/            # Custom hooks (useOperations, useScheduling)
  └── services/         # API Client (HTTP)

📁 Backend API (Express)
  └── routes/           # REST endpoints
```

### Persistencia

El sistema soporta **4 modos de persistencia**:

| Modo | Configuración | Órdenes | Uso |
|------|---------------|---------|-----|
| `memory` | En memoria | En memoria | Desarrollo/Testing |
| `redis` | Redis | En memoria | No recomendado |
| `postgres` | En memoria | PostgreSQL | Parcial |
| `hybrid` | Redis | PostgreSQL | ✅ **Producción** |

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose (opcional, para persistencia)

### Opción 1: Desarrollo Rápido (In-Memory)

```bash
# Clonar repositorio
git clone <repository-url>
cd aps-train-system

# Instalar dependencias
npm install

# Iniciar frontend y backend simultáneamente
npm run dev:all

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Opción 2: Con Persistencia (Docker Compose) - ⭐ Recomendado

```bash
# 1. Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# 2. Iniciar frontend y backend
npm run dev:all

# Los datos ahora persisten en PostgreSQL y Redis
```

### Opción 3: Producción Local (Todo con Docker)

```bash
# Levantar TODOS los servicios (PostgreSQL, Redis, Backend, Frontend)
docker-compose --profile production up -d

# Acceder a http://localhost:3000
```

### Scripts Disponibles

- `npm run dev` - Inicia solo frontend (Vite) en http://localhost:5173
- `npm run dev:backend` - Inicia solo backend API en http://localhost:3001
- `npm run dev:all` - Inicia frontend + backend simultáneamente
- `npm run build` - Construye frontend para producción
- `npm run build:backend` - Compila backend con TypeScript
- `npm run start:backend` - Ejecuta backend compilado
- `npm run lint` - Ejecuta linter de código

## 🐳 Despliegue con Docker

### Solución "Llave en Mano" con Docker Compose ⭐

**La forma más fácil de desplegar todo el sistema**. Un solo comando levanta los 4 servicios:

```bash
# Levantar PostgreSQL, Redis, Backend API y Frontend
docker-compose --profile production up -d

# Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Con herramientas de administración

```bash
# Incluye pgAdmin y Redis Commander
docker-compose --profile tools --profile production up -d

# Acceder además a:
# - pgAdmin: http://localhost:8080 (admin@aps.local / admin)
# - Redis Commander: http://localhost:8081
```

### Comandos útiles

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar solo un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

## 🚀 Despliegue en Easypanel

### ⚠️ Importante: Despliegue Completo con Persistencia

Para que el sistema funcione con persistencia (Fase 5), necesitas desplegar **4 servicios separados** en Easypanel:

1. **PostgreSQL** - Base de datos para órdenes
2. **Redis** - Caché para configuración
3. **Backend API** - Servidor Express
4. **Frontend** - Aplicación React

### 📖 Guía Completa de Despliegue

Consulta la guía detallada paso a paso en:

**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

Esta guía incluye:
- ✅ Configuración de cada servicio en Easypanel
- ✅ Variables de entorno necesarias
- ✅ Inicialización de base de datos
- ✅ Verificación del despliegue
- ✅ Solución de problemas comunes

### Resumen Rápido

```bash
# Paso 1: Crear servicio PostgreSQL
Database Name: aps_train_system
Username: aps_user
Password: [tu-contraseña-segura]

# Paso 2: Crear servicio Redis
Port: 6379

# Paso 3: Crear Backend API
Dockerfile: Dockerfile.backend
Port: 3001
Env: DATABASE_URL, REDIS_URL, PERSISTENCE_MODE=hybrid

# Paso 4: Crear Frontend
Dockerfile: Dockerfile
Port: 80
Env: VITE_API_URL=[url-del-backend]/api
```

### Troubleshooting

Consulta la sección de "Solución de Problemas" en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📂 Estructura del Proyecto

```
aps-train-system/
├── src/
│   ├── components/          # Componentes React
│   │   ├── GanttChart.tsx         # Diagrama de Gantt
│   │   ├── ResourceChart.tsx      # Gráfico de recursos
│   │   ├── ConfigurationPanel.tsx # Panel de configuración
│   │   └── OrderList.tsx          # Lista de órdenes
│   ├── engine/              # Lógica de negocio
│   │   └── SchedulingEngine.ts    # Motor de programación
│   ├── types/               # Definiciones TypeScript
│   │   └── interfaces.ts          # Interfaces del sistema
│   ├── data/                # Datos de ejemplo
│   │   └── mockData.ts            # Datos mock y configuración
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── dist/                    # Build de producción
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Interfaz de Usuario

### Diseño de Tres Paneles

1. **Panel Izquierdo (25%)**
   - Configuración del sistema
   - Formulario para agregar órdenes
   - Lista de órdenes con estado

2. **Panel Central (75%)**
   - Diagrama de Gantt (60% altura)
   - Gráfico de uso de recursos (40% altura)
   - Alertas de conflictos

### Interacciones

- **Click en bloque de Gantt**: Muestra detalles del proceso
- **Agregar orden**: Formulario modal con validación
- **Eliminar orden**: Confirmación y replanificación automática
- **Indicadores visuales**:
  - ✓ Verde: A tiempo
  - ⚠ Rojo: Entrega tardía
  - 🔴 Rojo: Sobrecarga de recursos

## 📊 Casos de Uso Implementados

### Escenario Demo Inicial

El sistema viene precargado con 5 órdenes de ejemplo:

| ID  | Modelo | Fecha Entrega | Prioridad |
|-----|--------|---------------|-----------|
| B1  | B      | 2026-01-15    | 1         |
| A1  | A      | 2026-01-16    | 2         |
| C1  | C      | 2026-01-17    | 3         |
| A2  | A      | 2026-01-18    | 4         |
| B2  | B      | 2026-01-19    | 5         |

**Periodo de planificación**: 10 días (2026-01-10 al 2026-01-19)

### Validación Automática

El sistema valida:
- ✅ Secuencia de procesos respetada
- ✅ Capacidad de líneas no excedida
- ✅ Trabajadores dentro de disponibilidad
- ⚠️ Detección de entregas tardías
- ⚠️ Identificación de cuellos de botella

## 🧪 Testing

### Casos de Prueba Validados

1. **TC01**: Programación secuencial simple
2. **TC02**: Paralelización en líneas de Preparación
3. **TC03**: Detección de conflictos de recursos
4. **TC04**: Alerta de entregas tardías

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: React 19.1 con TypeScript 5.9
- **Build Tool**: Vite 7.1
- **Estilos**: Tailwind CSS 4.1
- **Gráficos**: Recharts 3.3
- **Routing**: React Router DOM 7.9
- **Utilidades**: date-fns 4.1

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1
- **Persistencia**:
  - PostgreSQL (pg 8.16) - Órdenes de producción
  - Redis (ioredis 5.8) - Configuración del sistema
- **Utilidades**: CORS, dotenv

### Infraestructura
- **Containerización**: Docker & Docker Compose
- **Base de datos**: PostgreSQL 15
- **Caché**: Redis 7
- **Servidor Web**: Nginx (producción)

## 🔮 Extensibilidad Futura

El sistema está diseñado para permitir:
- ➕ Más procesos (Ensamblaje, Control de Calidad)
- 🕐 Turnos de trabajo (mañana/tarde/noche)
- 🔧 Mantenimiento de máquinas
- 💰 Costos de producción
- 🎯 Optimización multi-objetivo (tiempo + costo)
- 🔄 Drag-and-drop para reprogramación manual

## 📈 Métricas de Rendimiento

- **Tiempo de cálculo**: < 100ms para 10 órdenes
- **Complejidad**: O(n²) suficiente para escenarios < 50 órdenes
- **Bundle size**: ~542 KB (165 KB gzipped)

## 🤝 Contribuciones

Sistema desarrollado siguiendo especificación técnica APS v1.0.

## 📄 Licencia

Proyecto educativo/demo para sistema APS de fabricación.

## 📞 Soporte

Para preguntas o problemas, consulte la documentación técnica en `/docs` o abra un issue en el repositorio.

---

**Desarrollado con ❤️ usando React + TypeScript + Tailwind CSS**
