# Pruebas de Búsqueda Avanzada

## Cambios implementados

### 1. Icono de búsqueda en Sidebar
- ✅ Icono ahora visible (20x20px, color oscuro con hover)
- ✅ Posición corregida (left: 12px, centrado verticalmente)
- ✅ z-index: 50 para estar encima del placeholder
- ✅ Stroke-width aumentado a 2.5 para mejor visibilidad
- ✅ Hover effect: escala 1.1 y cambia color

### 2. Navegación automática al escribir
- ✅ Al empezar a escribir en el sidebar, después de 400ms navega automáticamente a `/user?search=...&tab=search`
- ✅ Esto muestra el panel de búsqueda avanzada con los resultados en tiempo real
- ✅ El autocompletado sigue funcionando (dropdown con sugerencias)
- ✅ Replace: true para no llenar el historial del navegador

### 3. Responsive
- ✅ Grid de resultados ajusta de 180px a 140px en móvil
- ✅ Gap reduce de 14px a 10px en pantallas pequeñas
- ✅ Mismo comportamiento responsive que HomeUser

## Cómo probar

1. **Levantar el frontend:**
   ```powershell
   cd c:\Users\londg\WebstormProjects\estructuras
   npm run dev
   ```

2. **Prueba 1 - Icono visible:**
   - Abre http://localhost:5173
   - Verifica que en la barra lateral (sidebar) aparezca un icono de lupa a la izquierda del input de búsqueda
   - El icono debe ser visible (color oscuro, tamaño adecuado)

3. **Prueba 2 - Navegación automática:**
   - Escribe cualquier texto en el input de búsqueda del sidebar
   - Después de ~400ms deberías ser redirigido a la vista de búsqueda avanzada
   - La URL debe cambiar a `/user?search=<tu_texto>&tab=search`
   - Debes ver el panel de filtros avanzados arriba y los resultados abajo

4. **Prueba 3 - Autocompletado sigue funcionando:**
   - Al escribir en el sidebar, debe aparecer el dropdown de sugerencias (máx. 8)
   - Puedes navegar con ↑/↓ y seleccionar con Enter
   - Click en una sugerencia te lleva a `/songs/:id`

5. **Prueba 4 - Click en icono:**
   - Click en el icono de lupa abre la búsqueda avanzada directamente
   - Si había texto, lo pasa como parámetro `search`

6. **Prueba 5 - Filtros avanzados:**
   - En la vista de búsqueda avanzada, usa los selectores:
     - Artista
     - Género
     - Año desde/hasta
     - AND/OR
   - Click en "Buscar" actualiza la URL y filtra resultados
   - Click en "Limpiar" resetea todo

7. **Prueba 6 - Responsive:**
   - Reduce el tamaño de ventana (< 768px)
   - Verifica que las cards de resultados se ajusten correctamente
   - Grid debe cambiar a columnas más estrechas

## Archivos modificados

- `src/components/SearchBar/AutocompleteSearch.jsx` — navegación automática al escribir
- `src/components/SearchBar/SearchBar.css` — estilos del icono mejorados
- `src/components/SearchBar/AdvancedSearchPanel.jsx` — panel de búsqueda avanzada
- `src/pages/User/HomeUser.jsx` — renderiza panel cuando `?tab=search`
- `src/pages/User/HomeUser.css` — estilos responsive para resultados
- `FRONTEND_BACKEND_CHECKLIST.md` — marcado RF-003 y RF-004 como completados

## Notas técnicas

- Navegación usa `{ replace: true }` para no llenar historial
- Debounce de 400ms en navegación para evitar múltiples redirects
- Debounce de 200ms en autocompletado (más rápido para mejor UX)
- Fallback a `songs.json` local si API `/canciones` no responde
- TODO: Implementar `src/api/songService.js` cuando backend tenga endpoint de búsqueda
