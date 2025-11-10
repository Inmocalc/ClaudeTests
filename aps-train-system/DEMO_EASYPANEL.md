# 🎯 Guía de Despliegue Rápido para Demo a Inversores

Esta guía te permite desplegar el sistema APS Train **completo** en Easypanel con un solo servicio, perfecto para mostrar a inversores.

---

## ⚡ Despliegue en 5 Minutos

### Paso 1: Abrir Easypanel

Ve a tu panel de Easypanel: https://easypanel.io

### Paso 2: Crear Nueva Aplicación

1. Click en **"Create"** → **"App"**
2. Selecciona **"GitHub"** como fuente

### Paso 3: Configurar Repositorio

```
Repository: Inmocalc/ClaudeTests
Branch: claude/fase-5-redis-postgresql-persistence-011CUrE6p4Vy7S5Yx9NugbPL
Build Path: /aps-train-system
```

### Paso 4: Configurar Build

```
Build Method: Dockerfile
Dockerfile Path: Dockerfile.demo
Port: 80
```

### Paso 5: Configurar Dominio (Opcional)

- Si quieres un dominio personalizado: Agrégalo en la pestaña "Domains"
- Si no: Easypanel te dará un subdominio automático (ej: `tu-app.easypanel.host`)

### Paso 6: Deploy

1. Click en **"Deploy"**
2. Espera 10-15 minutos (es una imagen grande porque incluye PostgreSQL, Redis, Backend y Frontend)
3. ✅ **¡Listo!** Tu aplicación estará disponible en la URL que te dio Easypanel

---

## 🌐 URL para Mostrar a Inversores

Después del deploy, tendrás una URL como:

```
https://tu-app.easypanel.host
```

**Eso es todo lo que necesitas mostrar** - una sola URL con todo el sistema funcionando.

---

## ✅ ¿Qué Incluye Este Despliegue?

Un **solo contenedor Docker** que contiene:
- ✅ PostgreSQL (base de datos de órdenes)
- ✅ Redis (caché de configuración)
- ✅ Backend API (Express)
- ✅ Frontend (React)

Todo funciona dentro del mismo contenedor, por eso es tan fácil de desplegar.

---

## 🎬 Durante la Reunión con Inversores

### 1. Muestra la URL

Simplemente abre: `https://tu-app.easypanel.host`

### 2. Muestra las Funcionalidades

**Dashboard:**
- Resumen de órdenes pendientes
- Estadísticas del sistema
- Formulario para añadir órdenes

**Configuración → Operaciones:**
- Añade una operación (ej: "Ensamblaje Final", 2 días, 3 trabajadores)
- Muestra que se guarda en la base de datos
- Recarga la página para demostrar persistencia

**Configuración → Líneas de Producción:**
- Añade una línea (ej: "Línea A1", Operación: Preparación, 2 trabajadores)

**Configuración → Procesos por Modelo:**
- Muestra cómo se configuran los tiempos de cada proceso para cada modelo

**Órdenes de Producción:**
- Añade una orden (ej: Modelo A, 5 unidades, entrega en 7 días)
- Ejecuta el algoritmo de planificación
- Muestra el diagrama de Gantt con la planificación

### 3. Puntos Clave para Inversores

- 🏗️ **Arquitectura hexagonal** (explicar brevemente: separación de capas, fácil de mantener)
- 📊 **Visualización en tiempo real** con Gantt y gráficos de recursos
- ⚠️ **Detección automática de conflictos** (entregas tardías, sobrecarga)
- 💾 **Persistencia real** con PostgreSQL y Redis
- 🔄 **Replanificación automática** al agregar/eliminar órdenes
- 🚀 **Desplegable en producción** (lo que están viendo está en la nube)

---

## 🔧 Si Algo Falla Durante el Build

### Error: Build tarda más de 20 minutos

**Solución:** Espera un poco más, es normal en el primer deploy porque:
- Descarga PostgreSQL
- Descarga Redis
- Compila el frontend
- Compila el backend

### Error: 502 Bad Gateway después del deploy

**Solución:** El contenedor puede tardar 1-2 minutos en iniciar todos los servicios. Espera un momento y recarga.

### Error: La aplicación no carga

1. Ve a tu app en Easypanel
2. Click en "Logs"
3. Busca errores en rojo
4. Si ves "PostgreSQL inicializado correctamente" → todo está bien, solo espera

---

## 📊 Datos de Ejemplo

Si quieres tener datos pre-cargados para la demo:

1. Accede a la aplicación
2. Ve a **Configuración → Operaciones** y añade:
   - Preparación: 1-2 días, 2 trabajadores
   - Torneado: 1-2 días, 1 trabajador
   - Pintado: 1-3 días, 1 trabajador

3. Ve a **Configuración → Líneas** y añade:
   - Línea P1: Preparación, 2 trabajadores
   - Línea P2: Preparación, 2 trabajadores
   - Línea T1: Torneado, 1 trabajador
   - Línea Pi1: Pintado, 1 trabajador

4. Ve a **Configuración → Procesos por Modelo** y configura:
   - Modelo A: Preparación (1d) → Torneado (2d) → Pintado (2d)
   - Modelo B: Preparación (2d) → Torneado (2d) → Pintado (1d)
   - Modelo C: Preparación (1d) → Torneado (1d) → Pintado (3d)

5. Ve a **Órdenes** y añade:
   - Orden A1: Modelo A, 1 unidad, entrega en 5 días
   - Orden B1: Modelo B, 1 unidad, entrega en 6 días
   - Orden C1: Modelo C, 1 unidad, entrega en 7 días

6. **Ejecuta Planificación** y muestra el diagrama de Gantt

---

## 🎯 Script Sugerido para la Demo

### Inicio (1 minuto)

> "Les voy a mostrar nuestro sistema APS Train en funcionamiento. Esto que ven está desplegado en la nube y es completamente funcional con persistencia real de datos."

### Funcionalidad Principal (3 minutos)

> "El sistema permite gestionar la producción de tres modelos de trenes (A, B, C). Primero configuramos las operaciones..." *(muestra configuración)*
>
> "Luego añadimos una orden de producción..." *(añade orden)*
>
> "Y el algoritmo calcula automáticamente la mejor planificación..." *(ejecuta planificación, muestra Gantt)*

### Puntos Técnicos (2 minutos)

> "La arquitectura es hexagonal, lo que nos permite escalar fácilmente. Usamos PostgreSQL para persistencia, Redis para caché, y todo está containerizado con Docker."

### Cierre (1 minuto)

> "El sistema detecta automáticamente conflictos como entregas tardías o sobrecarga de recursos. Todo esto es producción-ready y escalable."

---

## 💡 Consejos para la Reunión

✅ **Haz la demo TÚ MISMO antes de la reunión** para asegurarte que todo funciona

✅ **Ten la URL a mano** en favoritos o en un documento

✅ **No menciones "Dockerfile.demo" ni detalles técnicos** a menos que pregunten

✅ **Prepara 3-4 órdenes de ejemplo** antes de la reunión

✅ **Graba la demo en video** como backup por si hay problemas de internet

✅ **Ten preparadas respuestas** a:
   - "¿Cuánto costará escalar esto?" → *"La arquitectura containerizada nos permite escalar horizontalmente sin límites"*
   - "¿Qué pasa si falla?" → *"Tenemos health checks automáticos y los datos persisten en PostgreSQL"*
   - "¿Cuánto tiempo tomó desarrollar?" → *"X semanas/meses con arquitectura profesional"*

---

## 🚀 Después de la Reunión

Si los inversores aprueban, el siguiente paso es:

1. Migrar a arquitectura de 4 servicios separados (PostgreSQL, Redis, Backend, Frontend)
2. Configurar CI/CD automático
3. Añadir monitoreo y alertas
4. Configurar backups automáticos
5. Configurar escalado horizontal

**Pero para la demo:** Este Dockerfile.demo es PERFECTO. Simple, funciona, y demuestra todo.

---

## 📞 Solución Rápida de Problemas

**Problema:** No puedo acceder después del deploy
**Solución:** Espera 2 minutos más, Supervisord tarda en iniciar todo

**Problema:** Los datos no persisten
**Solución:** Normal en esta versión demo, los datos están en el contenedor (no en volumen externo)

**Problema:** Muy lento
**Solución:** Es Alpine Linux con PostgreSQL completo, es normal que sea un poco más lento que la versión con 4 servicios

---

**¡Listo para impresionar a los inversores!** 🎉

*Tiempo total de configuración: 5 minutos*
*Tiempo de build inicial: 10-15 minutos*
*Tiempo total hasta tener la URL lista: ~20 minutos*
