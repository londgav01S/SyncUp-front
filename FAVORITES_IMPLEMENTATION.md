# ✅ Implementación de Favoritos + Exportación CSV

> **Fecha:** 7 de noviembre de 2025  
> **Característica:** RF-008 (Favoritos) + RF-009 (Exportar CSV)  
> **Estado:** ✅ Implementado - Listo para pruebas

---

## 📦 Archivos Creados

### 1. **Servicio de Favoritos**
**Archivo:** `src/api/favoriteService.js`

**Funciones exportadas:**
- `addToFavorites(userName, songTitle)` - Agregar canción a favoritos vía `GET /usuarios/like`
- `getFavorites(email)` - Obtener lista de favoritos del usuario vía `GET /usuarios?correo=`
- `exportFavoritesToCSV(favorites, fileName)` - Exportar favoritos a archivo CSV
- `isFavorite(favorites, songId)` - Verificar si una canción está en favoritos

### 2. **Página de Favoritos**
**Archivos:** 
- `src/pages/User/Favorites.jsx`
- `src/pages/User/Favorites.css`

**Características:**
- ✅ Grid responsive de SongCards (200px → 160px en mobile)
- ✅ Botón "Exportar CSV" en header
- ✅ Estados de loading con spinner animado
- ✅ Estado de error con botón de reintentar
- ✅ Estado vacío con mensaje y enlace a explorar música
- ✅ Contador de canciones favoritas
- ✅ Diseño consistente con el resto de la app

---

## 🔧 Archivos Modificados

### 1. **SongCard Component**
**Archivo:** `src/components/SongCard/SongCard.jsx`

**Cambios:**
- ✅ Importado `addToFavorites` de favoriteService
- ✅ Estado `isFavorite` y `isAddingFavorite`
- ✅ Función `handleLike()` para agregar a favoritos
- ✅ Botón "Me gusta" funcional con loading state
- ✅ Animación cuando se agrega a favoritos

**CSS:** `src/components/SongCard/SongCard.css`
- ✅ Clase `.SongCard__actionButton--liked` con color rojo (#EF4444)
- ✅ Animación `heartBeat` al hacer clic
- ✅ Transiciones suaves y feedback visual

### 2. **Router**
**Archivo:** `src/router/AppRouter.jsx`

**Cambios:**
- ✅ Importado componente `Favorites`
- ✅ Agregada ruta `/favorites` bajo MainLayout

### 3. **Sidebar**
**Archivo:** `src/components/Sidebar/Sidebar.jsx`

**Cambios:**
- ✅ Agregado item de menú "Favoritos" con icono `fa-heart`
- ✅ Ruta `/favorites` en menuItems

---

## 🎯 Flujo de Usuario

### Agregar a Favoritos:
1. Usuario hace hover sobre SongCard
2. Aparecen botones de acción (corazón, +, ...)
3. Usuario hace clic en botón de corazón ❤️
4. Se llama a `GET /usuarios/like?nombreUsuario=...&tituloCancion=...`
5. Botón se pone rojo y se anima
6. Canción agregada a favoritos

### Ver Favoritos:
1. Usuario hace clic en "Favoritos" en sidebar
2. Navega a `/favorites`
3. Se carga lista de favoritos vía `GET /usuarios?correo=...`
4. Se muestra grid de SongCards con las canciones favoritas
5. Se muestra contador: "X canciones"

### Exportar CSV:
1. En página de favoritos, usuario hace clic en "📊 Exportar CSV"
2. Se ejecuta `exportFavoritesToCSV(favorites, 'favoritos-2025-11-07.csv')`
3. Se genera CSV con columnas: Título, Artista, Álbum, Género, Año, Duración
4. Archivo se descarga automáticamente

---

## 📊 Formato CSV Generado

```csv
Título,Artista,Álbum,Género,Año,Duración (min)
"Bohemian Rhapsody","Queen","A Night at the Opera","ROCK","1975","5.92"
"Blinding Lights","The Weeknd","After Hours","POP","2020","3.33"
```

---

## 🔌 Endpoints Backend Utilizados

### 1. **Agregar a Favoritos**
```
GET /usuarios/like
Params:
  - nombreUsuario: string (correo del usuario)
  - tituloCancion: string
Response: Lista actualizada de favoritos
```

### 2. **Obtener Favoritos**
```
GET /usuarios
Params:
  - correo: string
Response: Usuario completo con listaFavoritos
```

---

## ⚠️ Notas Importantes

### 1. **Autenticación Temporal**
Por ahora, el email del usuario se obtiene de `localStorage.getItem('userEmail')`. 

**TODO:** Integrar con `AuthContext` cuando esté disponible:
```javascript
const { user } = useContext(AuthContext)
const userEmail = user?.correo || user?.email
```

### 2. **Endpoint `/usuarios/like`**
El comentario en el backend dice que espera `correo` pero el parámetro es `nombreUsuario`. 
Actualmente enviamos el email en `nombreUsuario`.

**Verificar con backend:** Si necesita ajuste de nombres de parámetros.

### 3. **Persistencia de Estado "isFavorite"**
Actualmente, `SongCard` no verifica inicialmente si la canción está en favoritos.

**Mejora futura:** Al montar SongCard, verificar contra la lista de favoritos del usuario:
```javascript
useEffect(() => {
  const userFavorites = // obtener de contexto o API
  setIsFavorite(isFavorite(userFavorites, song.id))
}, [])
```

---

## 🚀 Próximos Pasos

### Para Completar RF-008 y RF-009:
1. ✅ **Probar funcionalidad completa:**
   - Iniciar dev server: `npm run dev`
   - Navegar a `/favorites`
   - Agregar canciones a favoritos desde home o búsqueda
   - Verificar que aparecen en página de favoritos
   - Exportar CSV y verificar contenido

2. ✅ **Integración con AuthContext:**
   - Reemplazar `localStorage.getItem('userEmail')` con contexto
   - Usar email/correo del usuario autenticado

3. ✅ **Verificar endpoint backend:**
   - Confirmar que `/usuarios/like` funciona correctamente
   - Verificar nombre de parámetro (nombreUsuario vs correo)

4. ✅ **Agregar notificaciones toast:**
   - Feedback visual cuando se agrega/quita de favoritos
   - Notificación de éxito al exportar CSV

### Siguientes Funcionalidades (Opcionales):
- 🔹 Botón para **quitar de favoritos** (requiere endpoint DELETE)
- 🔹 Sincronizar estado de "isFavorite" en todos los SongCards
- 🔹 Ordenar favoritos (por fecha agregado, alfabético, etc.)
- 🔹 Compartir lista de favoritos

---

## 🎨 Diseño Visual

### Página de Favoritos:
- **Header:** Título grande (48px), contador, botón exportar
- **Grid:** Auto-fill responsive (200px → 160px mobile)
- **Empty State:** Icono grande, mensaje amigable, CTA
- **Loading:** Spinner centrado con mensaje
- **Error:** Icono de alerta, mensaje, botón reintentar

### Botón Me Gusta en SongCard:
- **Normal:** Gris claro, corazón outline
- **Hover:** Naranja/accent color
- **Liked:** Rojo (#EF4444), corazón relleno
- **Animación:** HeartBeat al hacer clic

---

## 📝 Comandos de Prueba

```bash
# Iniciar dev server
npm run dev

# Navegar a:
http://localhost:5173/favorites

# Probar:
1. Agregar canciones a favoritos desde home
2. Ver lista en /favorites
3. Exportar CSV
4. Verificar archivo descargado
```

---

## ✅ Checklist de Validación

- [ ] Dev server inicia sin errores
- [ ] Ruta `/favorites` carga correctamente
- [ ] Botón "Me gusta" funciona en SongCard
- [ ] Animación de corazón se ejecuta
- [ ] Llamada a `/usuarios/like` se ejecuta
- [ ] Página de favoritos muestra canciones
- [ ] Botón "Exportar CSV" descarga archivo
- [ ] CSV tiene formato correcto
- [ ] Enlace en sidebar navega a favoritos
- [ ] Estados de loading/error funcionan
- [ ] Responsive funciona en mobile

---

**¡Implementación completa!** 🎉
Lista para pruebas y ajustes finales.
