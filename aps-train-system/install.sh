#!/bin/bash

# =============================================================================
# APS Train System - Instalador Automático Local
# =============================================================================
# Este script configura e inicia todo el sistema localmente con Docker Compose
# =============================================================================

set -e  # Detener si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Banner
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🚂 APS Train System - Instalador Automático         ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "Error: Ejecuta este script desde el directorio raíz del proyecto (aps-train-system)"
    exit 1
fi

print_success "Directorio del proyecto detectado correctamente"
echo ""

# Paso 1: Verificar requisitos
print_step "Paso 1/6: Verificando requisitos del sistema..."
echo ""

MISSING_DEPS=0

# Verificar Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    print_success "Docker instalado (versión $DOCKER_VERSION)"
else
    print_error "Docker no está instalado"
    MISSING_DEPS=1
fi

# Verificar Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    print_success "Docker Compose instalado"
else
    print_error "Docker Compose no está instalado"
    MISSING_DEPS=1
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js instalado ($NODE_VERSION)"
else
    print_warning "Node.js no está instalado (opcional para desarrollo)"
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm instalado (v$NPM_VERSION)"
else
    print_warning "npm no está instalado (opcional para desarrollo)"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    print_error "Faltan dependencias requeridas. Instala Docker y Docker Compose primero."
    echo ""
    echo "Instalación de Docker:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
fi

echo ""

# Paso 2: Elegir modo de instalación
print_step "Paso 2/6: Seleccionar modo de instalación"
echo ""
echo "Modos disponibles:"
echo "  1) Desarrollo (solo bases de datos en Docker, frontend/backend con npm)"
echo "  2) Producción local (todo en Docker) ⭐ RECOMENDADO"
echo "  3) Producción + herramientas de administración (pgAdmin, Redis Commander)"
echo ""
read -p "Selecciona una opción [1-3] (default: 2): " MODE
MODE=${MODE:-2}

case $MODE in
    1)
        PROFILE=""
        COMPOSE_CMD="up -d postgres redis"
        NEED_NPM=1
        ;;
    2)
        PROFILE="--profile production"
        COMPOSE_CMD="$PROFILE up -d"
        NEED_NPM=0
        ;;
    3)
        PROFILE="--profile production --profile tools"
        COMPOSE_CMD="$PROFILE up -d"
        NEED_NPM=0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""

# Paso 3: Configurar variables de entorno
print_step "Paso 3/6: Configurando variables de entorno..."
echo ""

if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado. Creando uno nuevo..."

    # Generar contraseña aleatoria para PostgreSQL
    PG_PASSWORD=$(openssl rand -base64 12 2>/dev/null || echo "aps_password_$(date +%s)")

    cat > .env <<EOF
# PostgreSQL
DATABASE_URL=postgresql://aps_user:${PG_PASSWORD}@postgres:5432/aps_train_system
POSTGRES_USER=aps_user
POSTGRES_PASSWORD=${PG_PASSWORD}
POSTGRES_DB=aps_train_system

# Redis
REDIS_URL=redis://redis:6379

# Backend API
NODE_ENV=production
PORT=3001
PERSISTENCE_MODE=hybrid

# Frontend
VITE_API_URL=http://localhost:3001/api
EOF

    print_success "Archivo .env creado con contraseña segura"
else
    print_success "Archivo .env existente detectado"
fi

echo ""

# Paso 4: Instalar dependencias npm (si es necesario)
if [ $NEED_NPM -eq 1 ]; then
    if command -v npm &> /dev/null; then
        print_step "Paso 4/6: Instalando dependencias de Node.js..."
        echo ""
        npm install
        print_success "Dependencias instaladas"
    else
        print_error "npm no está disponible pero es necesario para el modo desarrollo"
        exit 1
    fi
else
    print_step "Paso 4/6: Omitiendo instalación de dependencias npm..."
    print_success "No necesario para modo producción en Docker"
fi

echo ""

# Paso 5: Iniciar servicios con Docker Compose
print_step "Paso 5/6: Iniciando servicios con Docker Compose..."
echo ""

print_warning "Esto puede tardar varios minutos en la primera ejecución (descarga de imágenes)"
echo ""

# Ejecutar docker-compose
docker-compose $COMPOSE_CMD

echo ""
print_success "Servicios Docker iniciados correctamente"
echo ""

# Esperar a que los servicios estén listos
print_step "Esperando a que los servicios estén listos..."
sleep 5

# Verificar que los servicios estén corriendo
SERVICES_OK=1
if [ $MODE -eq 1 ]; then
    # Solo verificar postgres y redis
    docker-compose ps postgres | grep -q "Up" || SERVICES_OK=0
    docker-compose ps redis | grep -q "Up" || SERVICES_OK=0
else
    # Verificar todos los servicios
    docker-compose ps postgres | grep -q "Up" || SERVICES_OK=0
    docker-compose ps redis | grep -q "Up" || SERVICES_OK=0
    docker-compose ps backend | grep -q "Up" || SERVICES_OK=0
    docker-compose ps frontend | grep -q "Up" || SERVICES_OK=0
fi

if [ $SERVICES_OK -eq 1 ]; then
    print_success "Todos los servicios están corriendo"
else
    print_warning "Algunos servicios pueden tardar en estar listos"
fi

echo ""

# Paso 6: Iniciar frontend y backend (modo desarrollo)
if [ $NEED_NPM -eq 1 ]; then
    print_step "Paso 6/6: Iniciando frontend y backend..."
    echo ""
    echo "Ejecuta en otra terminal:"
    echo "  npm run dev:all"
    echo ""
fi

# Mostrar resumen
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✓ Instalación Completa                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

if [ $MODE -eq 1 ]; then
    echo "🚀 Modo: Desarrollo"
    echo ""
    echo "Servicios activos:"
    echo "  ✓ PostgreSQL - localhost:5432"
    echo "  ✓ Redis - localhost:6379"
    echo ""
    echo "Para iniciar frontend y backend:"
    echo "  $ npm run dev:all"
    echo ""
    echo "Acceso:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:3001"

else
    echo "🚀 Modo: Producción Local"
    echo ""
    echo "Servicios activos:"
    echo "  ✓ PostgreSQL - localhost:5432"
    echo "  ✓ Redis - localhost:6379"
    echo "  ✓ Backend API - http://localhost:3001"
    echo "  ✓ Frontend - http://localhost:3000"

    if [ $MODE -eq 3 ]; then
        echo ""
        echo "Herramientas de administración:"
        echo "  ✓ pgAdmin - http://localhost:8080"
        echo "    Usuario: admin@aps.local"
        echo "    Password: admin"
        echo "  ✓ Redis Commander - http://localhost:8081"
    fi

    echo ""
    echo "🌐 Abre tu navegador en: http://localhost:3000"
fi

echo ""
echo "Comandos útiles:"
echo "  Ver logs:           docker-compose logs -f"
echo "  Ver logs backend:   docker-compose logs -f backend"
echo "  Reiniciar:          docker-compose restart"
echo "  Detener:            docker-compose down"
echo "  Actualizar:         docker-compose up -d --build"
echo ""
echo "Health check:"
echo "  curl http://localhost:3001/health"
echo ""
print_success "¡Listo para usar! 🎉"
echo ""
