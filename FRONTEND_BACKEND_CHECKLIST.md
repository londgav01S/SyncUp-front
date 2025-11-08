# Frontend / Backend Integration Checklist

Este checklist agrupa los requisitos del sistema (RF) y el estado actual tras analizar el backend (`Estructuras_PF`) y los cambios ya aplicados en el frontend (`estructuras`). Úsalo para controlar progreso y priorizar las siguientes tareas.

---

## Cómo leer este documento
- "Estado": describe si la funcionalidad se puede implementar actualmente en el frontend con el backend existente, si ya está implementada en el front o si falta trabajo en el backend.
- "Endpoints / Archivos (backend)": ubicación de controladores y modelos relevantes.
- "Acción recomendada": pasos concretos (front o back) para completar la funcionalidad.

---

## Resumen ejecutivo
- Ya implementable en front (hoy):
  - Registro de usuarios (POST `/usuarios`).
  - Obtener usuario por correo (GET `/usuarios?correo=...`) y, por tanto, mostrar `listaFavoritos` y exportarla a CSV desde el cliente.
  - Listar/obtener canciones (GET `/canciones`) y alta de canciones (POST `/canciones` y POST `/canciones/por-nombres`).
- Parcialmente posible (workaround client-side):
  - Autocompletado y búsqueda avanzada (filtrado cliente tras GET `/canciones`).
- Falta backend para funcionar correctamente / seguro:
  - Login seguro (endpoint `/auth/login`), gestión de favoritos (endpoints CRUD), actualizar/eliminar canciones, grafos de similitud/recomendaciones, social (seguir), carga masiva y métricas.

---

## Checklist por requisito (RF)

- RF-001 / RF-002 — Registrarse, iniciar sesión, gestionar perfil, listaFavoritos
  - Estado: Registro OK en front. Login: implementado cliente-side (comparación local) pero NO seguro. Gestión de perfil / favoritos: faltan endpoints.
  - Endpoints / Archivos (backend):
    - `UsuarioController.java`: `POST /usuarios` (RequestParam: `nombre`, `correo`, `contrasena`), `GET /usuarios?correo=...`.
    - `Usuario.java` (modelo): campos `id`, `usuario` (correo), `contrasena`, `nombre`, `listaFavoritos`, `listasDeReproduccion`, `colaReproduccion`.
  - Acción recomendada:
    1. Añadir endpoint `/auth/login` para autenticación (server-side verification + token).
    2. Añadir endpoints PUT/PATCH `/usuarios/{id}` para actualizar perfil y `POST/DELETE /usuarios/{id}/favoritos` para gestionar favoritos.
    3. En front: migrar login para usar token y persistir sesión (AuthContext).

- RF-003 — Autocompletado por título
  - Estado: Implementable en front ya (client-side) usando `GET /canciones` + filtrado por prefijo.
  - Endpoints / Archivos (backend): `CancionController.java` (GET `/canciones`), `CancionRepository.findByTituloContainingIgnoreCase` disponible pero sin endpoint específico.
  - Acción recomendada:
    - Implementar autocompletado client-side ya.
    - (Opcional) Añadir endpoint `GET /canciones?titulo=...` que use el método `findByTituloContainingIgnoreCase` para eficiencia.

- RF-003 — Autocompletado por título
  - Estado: ✅ Implementado en front (client-side) — componente de autocompletado añadido y activo en la UI.
  - Front (archivos relevantes):
    - `src/components/SearchBar/AutocompleteSearch.jsx` — componente de autocompletado (debounce, fallback a `src/data/songs.json`, navegación por teclado circular, foco tras selección, navegación automática a búsqueda avanzada al escribir).
    - `src/components/Sidebar/Sidebar.jsx` — integración del componente en la barra lateral.
    - `src/pages/User/HomeUser.jsx` — muestra de resultados cuando `?search=` está presente.
  - Endpoints / Archivos (backend): `CancionController.java` (GET `/canciones`) sigue siendo la fuente recomendada; front usa fallback local si el API no responde.
  - Acción recomendada:
    - ✅ Hecho: Autocompletado operando client-side con fallback local y navegación automática.
    - (Opcional) Añadir endpoint `GET /canciones?titulo=...` en backend para búsquedas parciales eficientes y soportar paginación; actualizar front para consumir ese endpoint en lugar del fallback cuando esté disponible.

- RF-004 — Búsqueda avanzada (artista, genero, año) con AND/OR
  - Estado: ✅ Implementado en front (client-side) — UI de filtros añadida, navegación automática al escribir, resultados en tiempo real.
  - Front (archivos relevantes):
    - `src/components/SearchBar/AdvancedSearchFilters.jsx` — formulario de filtros (palabra clave, artista, género, año desde/hasta, AND/OR).
    - `src/components/SearchBar/AdvancedSearchPanel.jsx` — panel que integra filtros + resultados compactos.
    - `src/pages/User/HomeUser.jsx` — renderiza `AdvancedSearchPanel` cuando `?tab=search` está presente.
    - `src/pages/User/HomeUser.css` — estilos responsive para resultados compactos.
  - Endpoints / Archivos (backend): `CancionRepository` expone `findByGenero`, `findByAnio`, `findByArtista`.
  - Acción recomendada:
    - ✅ Hecho: UI y filtrado client-side implementado con auto-navegación y resultados en tiempo real.
    - (Opcional) Implementar endpoint server-side `GET /canciones/search?artista=&genero=&anio=&op=(and|or)` para consultas optimizadas y actualizar front para consumirlo.

- RF-005 — Generar playlist "Descubrimiento Semanal"
  - Estado: NO (falta módulo de recomendación / grafo de similitud en backend).
  - Acción recomendada:
    - Definir algoritmo en backend (GrafoDeSimilitud o recomendador basado en géneros/likes) y exponer `GET /usuarios/{id}/descubrimiento`.
    - Front: UI para mostrar playlist y botón de generación.

- RF-006 — Iniciar una "Radio" desde una canción
  - Estado: NO (requiere grafo/recomendador en backend).
  - Acción recomendada: Backend: `GET /canciones/{id}/similares` o similar; Front: UI para reproducir cola.

- RF-007 / RF-008 — Conectar usuarios (seguir) y sugerencias sociales
  - Estado: NO (no hay GrafoSocial ni endpoints de follow).
  - Acción recomendada: Diseñar modelo social y endpoints: `POST /usuarios/{id}/seguir/{targetId}`, `GET /usuarios/{id}/sugeridos`.

- RF-009 — Descargar CSV de favoritos
  - Estado: PUEDE HACERSE YA en frontend. `GET /usuarios?correo=...` devuelve `listaFavoritos`.
  - Acción recomendada:
    - Implementar botón "Exportar CSV" que convierta `listaFavoritos` en CSV y lo descargue desde cliente.

- RF-010 — Gestionar catálogo de canciones (agregar/actualizar/eliminar) — admin
  - Estado:
    - Agregar: SOPORTADO (`POST /canciones`, `POST /canciones/por-nombres`).
    - Actualizar / Eliminar: FALTAN endpoints PUT/DELETE.
  - Acción recomendada: Añadir `PUT /canciones/{id}` y `DELETE /canciones/{id}` en backend; Front: crear UI admin.

- RF-011 — Gestionar usuarios (listar/eliminar)
  - Estado: Parcial — GET por correo existe; no hay `GET /usuarios/all` ni `DELETE /usuarios/{id}`.
  - Acción recomendada: Añadir endpoints admin y UI para list/eliminar.

- RF-012 — Carga masiva de canciones
  - Estado: NO implementado en backend.
  - Acción recomendada: Backend: endpoint de upload y parser (`POST /admin/canciones/upload`); Front: UI de upload y vista previa.

- RF-013 / RF-014 — Panel de métricas (JavaFX charts)
  - Estado: Backend no expone métricas; JavaFX es UI desktop (si se desea web, usar chart libs). No hay endpoints.
  - Acción recomendada: Backend: exponer `/admin/metrics/*`; Front: implementar panel con Chart (Chart.js, Recharts, etc.).

- RF-015..RF-020 — Entidades y módulos (Usuario, Cancion, hashCode/equals)
  - Estado: Modelos principales (`Usuario`, `Cancion`, `Artista`, `Album`) existen. Lombok `@Data` ya genera equals/hashCode (revisar si cumplen la spec de usar `username` o `id`).
  - Acción recomendada: Revisar implementaciones de equals/hashCode si la especificación requiere comportamientos concretos.

- RF-021..RF-024 — Grafos de similitud / sociales
  - Estado: NO implementados en backend (solo hay listas/colas/pilas en `estructuras`).
  - Acción recomendada: Plan de desarrollo (diseño, endpoints, pruebas) si se requieren.

- RF-025..RF-026 — Trie autocompletado
  - Estado: NO implementado en backend. Front puede hacer autocompletado client-side; server-side Trie no existe.

- RF-027..RF-032 — Requerimientos técnicos (diagramas, JavaFX, concurrencia, tests, JavaDoc)
  - Estado: Parcial. Tests mínimos; no hay JavaDoc completo ni diagramas; concurrencia no implementada.
  - Acción recomendada: Plan de documentación, pruebas unitarias y scripts de CI.

---

## Mapeo rápido de endpoints/archivos (evidencia)
- Usuarios:
  - `Estructuras_PF/demo1/src/main/java/com/example/demo/controladores/UsuarioController.java` — POST `/usuarios`, GET `/usuarios?correo=`
  - `Estructuras_PF/demo1/src/main/java/com/example/demo/modelo/Usuario.java`
- Canciones:
  - `Estructuras_PF/demo1/src/main/java/com/example/demo/controladores/CancionController.java` — POST `/canciones`, POST `/canciones/por-nombres`, GET `/canciones`
  - `Estructuras_PF/demo1/src/main/java/com/example/demo/modelo/Cancion.java`
  - `Estructuras_PF/demo1/src/main/java/com/example/demo/repositorio/CancionRepository.java` — métodos de repositorio disponibles
- Álbum / Artista:
  - `AlbumController.java`, `ArtistaController.java` — endpoints basicos

---

## Acciones prácticas que puedo implementar ahora (front)
1. Autocompletado y búsqueda avanzada (client-side) — puedo añadir componentes y hooks para esto.
2. Exportar CSV de favoritos — botón y conversor CSV (ya con `GET /usuarios?correo=...`).
3. Formularios para crear canciones (admin) — usar endpoints existentes.
4. Mejorar UI de login para manejo de sesión si backend proporciona token; hasta entonces la implementación actual queda como POC.

## Propuesta de prioridades (sprint corto)
- Sprint 1 (2 semanas):
  1. Migrar login a autenticación server-side (coordinar con backend).  
  2. Implementar gestión de favoritos (endpoints + front).  
  3. Autocompletado client-side y búsqueda avanzada UI.
- Sprint 2 (2-3 semanas):
  1. Endpoints para búsqueda avanzada server-side.  
  2. Endpoints admin: update/delete canciones y listar/eliminar usuarios.  
  3. CSV server-side (opcional) + carga masiva.

---

## Cómo probar rápido (front)
1. Asegúrate que `REACT_APP_API_BASE` o `VITE_API_BASE` apunte al backend: por ejemplo `http://localhost:8080`.
2. Desde la carpeta `estructuras`:
```powershell
npm install
npm run dev
```
3. Páginas clave:
  - Registro: `/register` (usa `src/pages/Auth/Register.jsx`).
  - Login: `/login` (usa `src/pages/Auth/Login.jsx`).
  - Canciones: componente/lista (usar rutas del proyecto si ya existen).

---

## Notas finales
- Mantener este archivo actualizado: cada vez que se agregue un endpoint backend o se implemente una UI en front, marca el RF como completado.  
- Si quieres, puedo convertir cada RF en una issue/PR template con la lista de endpoints necesarios y ejemplo de request/response para pasarlo al equipo backend.

---

_Generado el: 2025-11-06 — basado en análisis de `Estructuras_PF/demo1` y los cambios realizados en `estructuras`._
