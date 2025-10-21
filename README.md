# ClaudeTests
Proyectos de prueba en Claude

## Tres en Raya Colorido 🎮

Una aplicación de Tres en Raya (Tic-Tac-Toe) muy colorida desarrollada con React y Vite.

### Características ✨

- 🌈 Interfaz muy colorida con gradientes animados
- 📊 Sistema de puntuación persistente
- ✨ Animaciones suaves y efectos visuales
- 🏆 Detección automática de ganador
- 💡 Resaltado de la línea ganadora
- 📱 Diseño responsive para móviles
- 🇪🇸 Interfaz en español

### Desarrollo Local 💻

```bash
cd tic-tac-toe
npm install
npm run dev
```

La aplicación se abrirá en `http://localhost:5173/`

### Despliegue en EasyPanel 🚀

El proyecto está listo para desplegarse en EasyPanel con Docker:

1. En EasyPanel, crea un nuevo servicio tipo "App"
2. Conecta tu repositorio de GitHub
3. Selecciona la branch: `claude/colorful-tic-tac-toe-011CUL5HikADg4kwhghNaKkU`
4. Configura el Build Path: `tic-tac-toe`
5. EasyPanel detectará automáticamente el Dockerfile
6. ¡Despliega y disfruta!

Ver [instrucciones detalladas](./tic-tac-toe/README.md#despliegue-en-easypanel-) en el README del proyecto.

### Tecnologías utilizadas 🛠️

- React 18
- Vite
- CSS3 con animaciones y gradientes
- Google Fonts (Fredoka)
- Docker + Nginx (para producción)
