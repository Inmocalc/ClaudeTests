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

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js >= 18.x
- npm >= 9.x

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd aps-train-system

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

### Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo en http://localhost:5173
- `npm run build` - Construye aplicación optimizada para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta linter de código

## 🐳 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar repositorio
git clone <repository-url>
cd aps-train-system

# Construir y ejecutar con Docker Compose
docker-compose up -d

# La aplicación estará disponible en http://localhost:3000
```

### Opción 2: Docker Manual

```bash
# Construir imagen
docker build -t aps-train-system:latest .

# Ejecutar contenedor
docker run -d -p 3000:80 --name aps-train-system aps-train-system:latest

# Ver logs
docker logs -f aps-train-system

# Detener contenedor
docker stop aps-train-system

# Eliminar contenedor
docker rm aps-train-system
```

### Health Check

El contenedor incluye un endpoint de health check en `/health` que puede usarse para monitoreo:

```bash
curl http://localhost:3000/health
# Respuesta: healthy
```

## 🚀 Despliegue en Easypanel

### Método 1: Desde GitHub (Recomendado)

1. **Acceder a Easypanel**
   - Inicia sesión en tu instancia de Easypanel

2. **Crear Nueva Aplicación**
   - Click en "Create" → "App"
   - Selecciona "GitHub" como fuente

3. **Configurar Repositorio**
   - Repository: `Inmocalc/ClaudeTests`
   - Branch: `claude/aps-train-scheduling-system-011CUrE6p4Vy7S5Yx9NugbPL`
   - Build Path: `/aps-train-system`

4. **Configurar Build**
   - Build Method: `Dockerfile`
   - Dockerfile Path: `Dockerfile`
   - Port: `80`

5. **Configurar Dominio**
   - Agrega tu dominio personalizado o usa el subdominio proporcionado
   - Ejemplo: `aps-train.tudominio.com`

6. **Deploy**
   - Click en "Deploy"
   - Espera a que el build termine (2-3 minutos)

### Método 2: Desde Docker Hub

Si prefieres usar una imagen pre-construida:

```bash
# En tu servidor, construye la imagen
cd aps-train-system
docker build -t tu-usuario/aps-train-system:latest .
docker push tu-usuario/aps-train-system:latest
```

Luego en Easypanel:
1. Crear App → Docker Image
2. Image: `tu-usuario/aps-train-system:latest`
3. Port: `80`
4. Deploy

### Configuración de Recursos Recomendada

- **CPU**: 0.5 cores
- **Memoria**: 512 MB (mínimo 256 MB)
- **Storage**: 1 GB

### Variables de Entorno (Opcional)

No se requieren variables de entorno para el funcionamiento básico. La aplicación es completamente estática.

### SSL/HTTPS

Easypanel configura automáticamente SSL con Let's Encrypt. Solo necesitas:
1. Configurar tu dominio apuntando a tu VPS
2. Agregar el dominio en Easypanel
3. Habilitar "Auto SSL"

### Troubleshooting

**Problema: La aplicación no inicia**
```bash
# Verificar logs en Easypanel o vía SSH
docker logs <container-name>
```

**Problema: Error 502 Bad Gateway**
- Verifica que el puerto 80 esté expuesto correctamente
- Revisa que el contenedor esté corriendo: `docker ps`

**Problema: Cambios no se reflejan**
- Reconstruye la imagen: En Easypanel → "Rebuild"
- Limpia caché de Docker si es necesario

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

- **Frontend Framework**: React 18.3 con TypeScript 5.6
- **Build Tool**: Vite 7.2
- **Estilos**: Tailwind CSS 4.0
- **Gráficos**: Recharts 2.x
- **Utilidades**: date-fns 4.1
- **Type Safety**: TypeScript con strict mode

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
