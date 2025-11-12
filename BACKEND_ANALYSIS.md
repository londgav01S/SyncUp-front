# 📊 Análisis Backend - Endpoints Disponibles

> **Fecha de análisis:** 7 de noviembre de 2025  
> **Proyecto:** Estructuras_PF  
> **Estado:** Lectura de última actualización desde Git

---

## 🎯 Resumen de Endpoints Disponibles

### ✅ **Usuarios** (`/usuarios`)
| Método | Endpoint | Descripción | Parámetros | Status Frontend |
|--------|----------|-------------|------------|-----------------|
| POST | `/usuarios` | Crear usuario | `nombre`, `correo`, `contrasena` (query params) | ✅ Implementado (Register) |
| GET | `/usuarios` | Obtener usuario por correo | `correo` (query param) | ✅ Implementado (Login) |
| GET | `/usuarios/like` | Likear/agregar canción a favoritos | `nombreUsuario`, `tituloCancion` (query params) | ⚠️ **PENDIENTE** |

**Modelo Usuario:**
```java
- id: String
- usuario: String
- contrasena: String
- nombre: String
- listaFavoritos: ListaEnlazada<Cancion>
- listasDeReproduccion: ListaEnlazada<Playlist>
- colaReproduccion: Cola<Cancion>
```

---

### ✅ **Canciones** (`/canciones`)
| Método | Endpoint | Descripción | Body/Params | Status Frontend |
|--------|----------|-------------|-------------|-----------------|
| POST | `/canciones` | Crear canción (con IDs) | `CancionRegistroDTO` (body) | ⚠️ **PENDIENTE** |
| POST | `/canciones/por-nombres` | Crear canción (con nombres) | `CancionRegistroPorNombreDTO` (body) | ⚠️ **PENDIENTE** |
| GET | `/canciones` | Obtener todas las canciones | - | ✅ Usado en Autocomplete |

**DTO CancionRegistroPorNombreDTO:**
```java
- titulo: String
- nombreArtista: String
- tituloAlbum: String
- genero: GENERO (enum)
- anio: int
- duracion: double
- URLCancion: String
```

---

### ✅ **Artistas** (`/artistas`)
| Método | Endpoint | Descripción | Body/Params | Status Frontend |
|--------|----------|-------------|-------------|-----------------|
| POST | `/artistas` | Crear artista | `ArtistaRegistroDTO` (body) | ⚠️ **PENDIENTE** |
| GET | `/artistas` | Obtener todos los artistas | - | ⚠️ **PENDIENTE** |
| GET | `/artistas/nombres` | Obtener solo nombres de artistas | - | ⚠️ **PENDIENTE** |

**DTO ArtistaRegistroDTO:**
```java
- nombre: String
- nacionalidad: String
- generoPrincipal: GENERO
- generoSecundario: GENERO
- URLFotoArtista: String
```

---

### ✅ **Álbumes** (`/albumes`)
| Método | Endpoint | Descripción | Body/Params | Status Frontend |
|--------|----------|-------------|-------------|-----------------|
| POST | `/albumes/id` | Crear álbum (con ID artista) | `AlbumRegistroDTO` (body) | ⚠️ **PENDIENTE** |
| POST | `/albumes/nombre` | Crear álbum (con nombre artista) | `AlbumRegistroPorNombreDTO` (body) | ⚠️ **PENDIENTE** |
| GET | `/albumes/todos` | Obtener todos los álbumes | - | ⚠️ **PENDIENTE** |
| GET | `/albumes/nombre` | Obtener álbum por nombre | `nombre` (query param) | ⚠️ **PENDIENTE** |

**DTO AlbumRegistroPorNombreDTO:**
```java
- titulo: String
- anio: int
- nombreArtista: String
- genero: GENERO
- URLPortadaAlbum: String
```

---

### ⚠️ **General** (`/general`)
| Estado | Descripción |
|--------|-------------|
| 🚧 Vacío | Controller creado pero sin endpoints implementados |

---

## 🎨 Enum GENERO
```java
POP, ROCK, HIPHOP, JAZZ, CLASICA, ELECTRONICA, REGGAETON, METAL, 
FOLK, BLUES, COUNTRY, RNB, PUNK, FUNK, SOUL, DISCO, GOSPEL, 
LATINO, INDIE, ALTERNATIVO, RAP
```

---

## 🚀 Interfaces Frontend Sugeridas (Priorizadas)

### 🟢 **ALTA PRIORIDAD - Completar Funcionalidad Usuario**

#### 1. **Página de Favoritos** ⭐⭐⭐
- **Backend:** `GET /usuarios?correo=` (ya implementado)
- **Descripción:** Mostrar `listaFavoritos` del usuario autenticado
- **Componentes:**
  - Página `Favorites.jsx` con grid de SongCards
  - Botón "Agregar a favoritos" en cada canción
  - Integración con `GET /usuarios/like`
- **Beneficio:** Completa RF-008 (Gestión de favoritos)

#### 2. **Exportar Favoritos a CSV** 📊
- **Backend:** `GET /usuarios?correo=` 
- **Descripción:** RF-009 - Exportar lista de favoritos
- **Componentes:**
  - Botón en página de favoritos
  - Función para generar CSV del lado del cliente
  - Incluir: título, artista, álbum, género, año
- **Beneficio:** Completa RF-009

#### 3. **Cola de Reproducción** 🎵
- **Backend:** `GET /usuarios?correo=` (campo `colaReproduccion`)
- **Descripción:** Mostrar y gestionar cola de reproducción
- **Componentes:**
  - Panel lateral de cola
  - Drag & drop para reordenar
  - Botón "Agregar a cola" en cada canción
- **Beneficio:** Mejora UX del reproductor

---

### 🟡 **MEDIA PRIORIDAD - Panel de Administración**

#### 4. **Gestión de Artistas (Admin)** 👨‍🎤
- **Backend:** 
  - `POST /artistas` - Crear artista
  - `GET /artistas` - Listar artistas
  - `GET /artistas/nombres` - Autocompletado
- **Componentes:**
  - `ManageArtists.jsx` (ya existe en estructura)
  - Formulario de creación con:
    - Nombre, nacionalidad
    - Género principal/secundario (select con enum GENERO)
    - URL de foto
  - Tabla de artistas existentes
- **Beneficio:** Permite administrar catálogo de artistas

#### 5. **Gestión de Álbumes (Admin)** 💿
- **Backend:**
  - `POST /albumes/nombre` - Crear álbum
  - `GET /albumes/todos` - Listar álbumes
  - `GET /albumes/nombre` - Buscar álbum
- **Componentes:**
  - Página nueva `ManageAlbums.jsx`
  - Formulario con:
    - Título, año
    - Select de artista (usando `/artistas/nombres`)
    - Select de género
    - URL de portada
  - Grid de álbumes con portadas
- **Beneficio:** Organización del catálogo musical

#### 6. **Gestión de Canciones (Admin)** 🎼
- **Backend:**
  - `POST /canciones/por-nombres` - Crear canción
  - `GET /canciones` - Listar canciones
- **Componentes:**
  - Mejorar `ManageSongs.jsx` existente
  - Formulario con:
    - Título, duración
    - Autocompletado de artista
    - Autocompletado de álbum
    - Select de género
    - Año, URL de canción
  - Tabla con filtros y búsqueda
- **Beneficio:** Completa CRUD de canciones

---

### 🔵 **BAJA PRIORIDAD - Features Avanzadas**

#### 7. **Explorador de Artistas** 🎭
- **Backend:** `GET /artistas`
- **Componentes:**
  - Página pública para explorar artistas
  - Cards con foto, nombre, géneros
  - Vista detallada de artista (requeriría endpoint adicional)

#### 8. **Explorador de Álbumes** 📀
- **Backend:** `GET /albumes/todos`
- **Componentes:**
  - Grid de álbumes con portadas
  - Filtros por género, año, artista
  - Vista detallada (requeriría endpoint adicional)

#### 9. **Playlists Personalizadas** 📝
- **Backend:** Requiere endpoints adicionales (no disponibles aún)
- **Modelo:** `Playlist` existe en backend
- **Estado:** Pendiente de endpoints CRUD

---

## 📋 Plan de Acción Sugerido

### **Fase 1: Completar Experiencia de Usuario** (1-2 días)
1. ✅ Página de Favoritos con grid
2. ✅ Botón "Me gusta" en SongCard/SongDetails
3. ✅ Integración con `/usuarios/like`
4. ✅ Exportar favoritos a CSV
5. ✅ Página de Cola de Reproducción

### **Fase 2: Panel de Administración** (2-3 días)
1. ✅ Gestión de Artistas (CRUD)
2. ✅ Gestión de Álbumes (CRUD)
3. ✅ Mejorar Gestión de Canciones

### **Fase 3: Features Exploratorias** (1-2 días)
1. ✅ Explorador de Artistas
2. ✅ Explorador de Álbumes
3. ⏳ Playlists (pendiente de backend)

---

## 🔧 Servicios Frontend a Crear

```javascript
// src/api/artistService.js
export const createArtist = (artistData) => {...}
export const getArtists = () => {...}
export const getArtistNames = () => {...}

// src/api/albumService.js (ya existe en estructura)
export const createAlbum = (albumData) => {...}
export const getAlbums = () => {...}
export const getAlbumByName = (name) => {...}

// src/api/favoriteService.js
export const addToFavorites = (userName, songTitle) => {...}
export const getFavorites = (email) => {...}
export const exportFavoritesToCSV = (favorites) => {...}
```

---

## ⚠️ Notas Importantes

1. **Endpoint `/usuarios/like`:** El comentario dice que espera `correo` pero el parámetro es `nombreUsuario`. Necesita aclaración.

2. **GeneralController:** Está vacío, podría ser para endpoints futuros.

3. **Playlists:** El modelo existe pero no hay endpoints CRUD aún.

4. **Cola de Reproducción:** Solo lectura del usuario, falta endpoint para modificar.

5. **Autenticación:** El login actual es client-side. Considerar endpoint seguro en futuro.

---

## 🎯 Recomendación Inmediata

**Empezar con la Fase 1** - Favoritos y CSV, porque:
- Usa endpoints ya disponibles
- Completa RFs faltantes (RF-008, RF-009)
- Mejora experiencia de usuario
- No requiere permisos de admin
- Baja complejidad técnica

**Segunda opción:** Panel de Administración (Fase 2)
- Aprovecha todos los endpoints POST disponibles
- Completa el panel de admin que ya está estructurado
- Alta visibilidad del progreso (CRUD completo)
