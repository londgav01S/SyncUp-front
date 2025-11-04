# Estructuras - Frontend (React)

Proyecto frontend para la asignatura "Estructuras 2". Esta versión está hecha en React + Vite y sirve como plantilla para desarrollar la UI que consumirá un backend REST.

Características incluidas en esta estructura inicial:
- Carpetas y archivos base en `src/` (componentes, páginas, context, hooks, requests, data).
- `src/requests` con peticiones REST centralizadas (usa `src/api/axiosConfig.js`).
- `src/data/songs.json` con 55 canciones de ejemplo para poblar vistas durante el desarrollo.

Paleta de colores (usar en estilos):
- Azul Marino Profundo (principal): #1C2B3A
- Naranja Coral (acento): #F25C43
- Turquesa Suave (secundario): #45B6B3
- Marfil Claro (fondo): #FAF8F4
- Gris Oscuro (texto secundario): #444B54

Instalación y ejecución (PowerShell):
```powershell
cd 'c:\Users\londg\WebstormProjects\estructuras'
npm install
npm run dev
```

Notas y siguientes pasos recomendados:
- Completar las rutas privadas y control de autenticación (AuthContext ya está preparado).
- Añadir los assets (covers y audios) en `public/assets/` si quieres que las canciones carguen localmente.
- Implementar visualización principal (Home, Player, Playlists) usando `src/data/songs.json` mientras el backend no está listo.
