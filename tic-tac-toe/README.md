# Tres en Raya Colorido 🎮

Una aplicación de Tres en Raya (Tic-Tac-Toe) muy colorida desarrollada con React y Vite.

## Características ✨

- 🌈 Interfaz muy colorida con gradientes animados
- 📊 Sistema de puntuación persistente
- ✨ Animaciones suaves y efectos visuales
- 🏆 Detección automática de ganador
- 💡 Resaltado de la línea ganadora
- 📱 Diseño responsive para móviles
- 🇪🇸 Interfaz en español

## Desarrollo Local 💻

### Requisitos
- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:5173/`

### Build de producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## Despliegue en EasyPanel 🚀

### Opción 1: Desde GitHub (Recomendado)

1. **Accede a tu panel de EasyPanel**
   - Inicia sesión en tu VPS con EasyPanel

2. **Crea una nueva aplicación**
   - Click en "Create Service"
   - Selecciona "App"
   - Elige "GitHub" como fuente

3. **Configura el repositorio**
   - Repositorio: `tu-usuario/ClaudeTests`
   - Branch: `claude/colorful-tic-tac-toe-011CUL5HikADg4kwhghNaKkU`
   - Build Path: `tic-tac-toe`

4. **Configuración de Build**
   EasyPanel detectará automáticamente el Dockerfile, pero si necesitas configurar manualmente:
   - Build Method: `Dockerfile`
   - Dockerfile Path: `./Dockerfile`
   - Port: `80`

5. **Despliega**
   - Click en "Deploy"
   - EasyPanel construirá la imagen Docker y desplegará la aplicación

6. **Configura el dominio**
   - En la configuración de la app, añade tu dominio
   - EasyPanel configurará automáticamente HTTPS con Let's Encrypt

### Opción 2: Con Docker Compose

Si prefieres usar Docker Compose:

```bash
docker-compose up -d
```

La aplicación estará disponible en `http://tu-servidor:3000`

### Opción 3: Build Manual

```bash
# Construir la imagen Docker
docker build -t tic-tac-toe .

# Ejecutar el contenedor
docker run -d -p 80:80 --name tic-tac-toe-app tic-tac-toe
```

## Tecnologías Utilizadas 🛠️

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **CSS3** - Animaciones y gradientes
- **Google Fonts (Fredoka)** - Tipografía
- **Nginx** - Servidor web (en Docker)
- **Docker** - Contenedorización

## Estructura del Proyecto 📁

```
tic-tac-toe/
├── src/
│   ├── App.jsx          # Componente principal con lógica del juego
│   ├── App.css          # Estilos coloridos y animaciones
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos base
├── public/
├── Dockerfile           # Configuración Docker
├── nginx.conf           # Configuración Nginx
├── docker-compose.yml   # Orquestación Docker
└── package.json
```

## Funcionalidades del Juego 🎲

- **Dos jugadores**: X y O se turnan
- **Detección de ganador**: Automática con resaltado visual
- **Marcador**: Lleva el registro de victorias y empates
- **Nueva partida**: Reinicia el tablero manteniendo el marcador
- **Reiniciar marcador**: Resetea todas las estadísticas

## Notas de Producción 📝

- La aplicación es completamente estática, no requiere backend
- El contenedor Docker usa Nginx Alpine para un tamaño mínimo
- Incluye compresión Gzip para mejor rendimiento
- Headers de seguridad configurados
- Cache de assets estáticos optimizado

---

Desarrollado con ❤️ usando React y Claude Code
