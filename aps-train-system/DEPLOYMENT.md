# Guía de Despliegue Rápido en Easypanel

## 🚀 Despliegue Paso a Paso

### 1. Acceder a tu Easypanel
Abre tu navegador y accede a tu instancia de Easypanel (ej: `https://panel.tudominio.com`)

### 2. Crear Nueva Aplicación

1. Click en **"Projects"** en el menú lateral
2. Selecciona tu proyecto o crea uno nuevo
3. Click en **"Create Service"** → **"App"**

### 3. Configurar desde GitHub

#### Opción A: GitHub Integration (Recomendado)

1. **Source**:
   - Type: `GitHub`
   - Repository: `Inmocalc/ClaudeTests`
   - Branch: `claude/aps-train-scheduling-system-011CUrE6p4Vy7S5Yx9NugbPL`

2. **Build**:
   - Build Type: `Dockerfile`
   - Dockerfile Path: `aps-train-system/Dockerfile`
   - Context: `aps-train-system`

3. **Ports**:
   - Container Port: `80`
   - Protocol: `HTTP`

4. **Resources** (Opcional):
   - CPU: `0.5` cores
   - Memory: `512` MB
   - Storage: `1` GB

5. **Domain**:
   - Click en "Add Domain"
   - Ingresa tu dominio: `aps-train.tudominio.com`
   - Enable SSL: `✓` (automático con Let's Encrypt)

6. **Deploy**:
   - Click en **"Deploy"**
   - Espera 2-3 minutos para el build inicial

### 4. Verificar Despliegue

Una vez completado el deploy:

1. **Ver logs**: Click en "Logs" para ver el inicio del contenedor
2. **Health check**: Accede a `https://tudominio.com/health` (debe responder "healthy")
3. **Aplicación**: Accede a `https://tudominio.com` para ver el sistema APS

## 🔄 Actualizaciones Automáticas

Easypanel puede configurarse para redesplegar automáticamente cuando hay cambios en el repositorio:

1. Ve a tu App en Easypanel
2. Click en **"Settings"** → **"GitHub"**
3. Enable **"Auto Deploy"**
4. Ahora cada push a la rama desplegará automáticamente

## 📊 Monitoreo

### Ver Métricas
- CPU Usage: Dashboard → Metrics
- Memory Usage: Dashboard → Metrics
- Logs en tiempo real: Logs tab

### Health Checks
Easypanel automáticamente monitoreará el endpoint `/health`:
- Intervalo: 30s
- Timeout: 10s
- Reinicio automático si falla 3 veces consecutivas

## 🔧 Troubleshooting

### Problema: Build falla

**Error: "npm install failed"**
```bash
Solución: Verifica que package.json y package-lock.json estén en el repo
```

**Error: "Cannot find Dockerfile"**
```bash
Solución: Verifica el path del Dockerfile:
- Dockerfile Path: aps-train-system/Dockerfile
- Context: aps-train-system
```

### Problema: Aplicación no accesible

**Error 502 Bad Gateway**
1. Verifica que el contenedor esté corriendo: Logs → "nginx: ready"
2. Verifica el puerto: debe ser 80
3. Revisa logs para errores de nginx

**Error 404**
1. Verifica que el build completó exitosamente
2. Revisa que los archivos estáticos se copiaron: Logs → "Copying build files"

### Problema: Cambios no se reflejan

1. Ve a tu App → "Deployments"
2. Click en "Redeploy"
3. O desde GitHub: git push para trigger auto-deploy

## 🔐 Configuración SSL

### SSL Automático (Recomendado)

Easypanel configura SSL automáticamente con Let's Encrypt:

1. Asegúrate de que tu dominio apunte a la IP de tu VPS:
   ```
   A record: tudominio.com → IP_VPS
   ```

2. En Easypanel:
   - Add Domain → `tudominio.com`
   - SSL: Automatic (Let's Encrypt)
   - Wait 1-2 minutos para la emisión del certificado

3. Verifica:
   ```bash
   curl https://tudominio.com/health
   ```

## 📱 Configuración de Dominio

### Ejemplo con Cloudflare

Si usas Cloudflare para DNS:

1. **DNS Records**:
   ```
   Type: A
   Name: aps-train (o @)
   Content: IP_VPS
   Proxy: ❌ (desactivado inicialmente para SSL)
   ```

2. **Después del SSL**:
   - Puedes activar el proxy de Cloudflare
   - SSL Mode: Full (strict)

### Ejemplo sin Cloudflare

En tu proveedor de DNS:
```
A record: aps-train.tudominio.com → IP_VPS
```

## 🎯 Variables de Entorno

Esta aplicación **NO requiere** variables de entorno para funcionar. Es completamente estática.

Si en el futuro necesitas configurar variables:
1. App → Environment
2. Add Variable
3. Redeploy

## 📈 Recomendaciones de Producción

### Recursos Mínimos
- **RAM**: 256 MB (512 MB recomendado)
- **CPU**: 0.5 cores
- **Storage**: 1 GB

### Recursos Recomendados para Múltiples Usuarios
- **RAM**: 1 GB
- **CPU**: 1 core
- **Storage**: 2 GB

### Backup
Easypanel no hace backup automático de apps stateless. Como esta es una app estática sin base de datos, solo necesitas mantener el código en GitHub.

## 🆘 Soporte

### Logs Detallados
```bash
# SSH a tu servidor
ssh usuario@tu-vps

# Ver logs del contenedor
docker logs <container-name> -f

# Ver todos los contenedores
docker ps -a
```

### Recrear Aplicación
Si algo va muy mal:
1. Delete app en Easypanel
2. Espera 30 segundos
3. Crea app nuevamente siguiendo los pasos arriba

## ✅ Checklist Post-Despliegue

- [ ] Aplicación accesible en el dominio
- [ ] SSL activo (candado verde en navegador)
- [ ] `/health` responde "healthy"
- [ ] Gantt chart se visualiza correctamente
- [ ] Se pueden agregar/eliminar órdenes
- [ ] Gráficos de recursos funcionan
- [ ] No hay errores en browser console (F12)

## 🎉 ¡Listo!

Tu sistema APS está ahora desplegado y accesible en internet.

**URL de ejemplo**: https://aps-train.tudominio.com

---

**Última actualización**: 2025-11-06
**Versión del sistema**: 1.0
