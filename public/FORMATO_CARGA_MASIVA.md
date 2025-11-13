# Guía de Carga Masiva de Canciones

## Formatos Soportados

### 📄 Formato CSV (Simple - Solo Canciones)

**Archivo:** `*.csv`

**Formato:** Titulo,NombreArtista,TituloAlbum,Genero,Anio,Duracion,URLCancion

**Ejemplo:**
```csv
Titulo,NombreArtista,TituloAlbum,Genero,Anio,Duracion,URLCancion
Bohemian Rhapsody,Queen,A Night at the Opera,ROCK,1975,354.0,https://www.youtube.com/watch?v=fJ9rUzIMcZQ
Imagine,John Lennon,Imagine,POP,1971,183.0,https://www.youtube.com/watch?v=YkgkThdzX-8
Stairway to Heaven,Led Zeppelin,Led Zeppelin IV,ROCK,1971,482.0,https://www.youtube.com/watch?v=QkF3oxziUI4
```

**⚠️ IMPORTANTE:**
- Los **artistas** y **álbumes** deben existir previamente en la base de datos
- El género debe ser uno válido: ROCK, POP, JAZZ, REGGAE, METAL, ELECTRONICA, HIPHOP, OTROS
- La duración debe estar en **segundos** (puede tener decimales)
- Si un título o artista contiene comas, debe ir entre comillas: `"Hello, World",Artist Name,...`

---

### 📋 Formato TXT (Completo - Artistas, Álbumes y Canciones)

**Archivo:** `*.txt`

**Formato:** Secciones separadas con `[ARTISTAS]`, `[ALBUMES]`, `[CANCIONES]`

Columnas separadas por `|` (pipe)

**Ejemplo:**
```txt
[ARTISTAS]
# nombre|nacionalidad|generoPrincipal|generoSecundario|URLFotoArtista
Queen|Reino Unido|ROCK|ROCK|https://example.com/queen.jpg
John Lennon|Reino Unido|POP|ROCK|https://example.com/lennon.jpg
Led Zeppelin|Reino Unido|ROCK|ROCK|https://example.com/ledzeppelin.jpg

[ALBUMES]
# titulo|anio|nombreArtista|genero|URLPortadaAlbum
A Night at the Opera|1975|Queen|ROCK|https://example.com/nightopera.jpg
Imagine|1971|John Lennon|POP|https://example.com/imagine.jpg
Led Zeppelin IV|1971|Led Zeppelin|ROCK|https://example.com/lz4.jpg

[CANCIONES]
# titulo|nombreArtista|tituloAlbum|genero|anio|duracion|URLCancion
Bohemian Rhapsody|Queen|A Night at the Opera|ROCK|1975|354.0|https://www.youtube.com/watch?v=fJ9rUzIMcZQ
Imagine|John Lennon|Imagine|POP|1971|183.0|https://www.youtube.com/watch?v=YkgkThdzX-8
Stairway to Heaven|Led Zeppelin|Led Zeppelin IV|ROCK|1971|482.0|https://www.youtube.com/watch?v=QkF3oxziUI4
```

**Ventajas del formato TXT:**
- ✅ Permite crear artistas, álbumes y canciones en un solo archivo
- ✅ Ideal para importar todo un catálogo desde cero
- ✅ Las líneas que comienzan con `#` son comentarios y se ignoran

---

## Géneros Válidos

Los siguientes géneros musicales están soportados:
- ROCK
- POP
- JAZZ
- REGGAE
- METAL
- ELECTRONICA
- HIPHOP
- OTROS

---

## URLs de Canciones Soportadas

El sistema soporta URLs de las siguientes plataformas:
- YouTube (https://www.youtube.com/watch?v=...)
- YouTube Music
- SoundCloud
- Vimeo
- Dailymotion
- Mixcloud
- Y otras plataformas soportadas por react-player

---

## Proceso de Carga

### CSV:
1. Selecciona tu archivo CSV
2. El sistema validará el formato
3. Verifica que los artistas y álbumes existan
4. Hace clic en "Ejecutar carga"
5. El sistema procesará cada línea y mostrará el resultado

### TXT:
1. Selecciona tu archivo TXT
2. El sistema parseará las tres secciones
3. Mostrará un resumen de artistas, álbumes y canciones a crear
4. Hace clic en "Ejecutar carga"
5. El sistema creará primero artistas, luego álbumes, y finalmente canciones

---

## Manejo de Errores

Si hay errores durante la carga:
- **CSV:** Se mostrará la línea específica con el error
- **TXT:** Se mostrará qué registro falló
- Las filas con errores se saltarán, pero el resto se procesará

Errores comunes:
- ❌ Artista no encontrado (CSV)
- ❌ Álbum no encontrado (CSV)
- ❌ Género inválido
- ❌ Año o duración con formato incorrecto
- ❌ Campos obligatorios vacíos

---

## Archivos de Ejemplo

Descarga archivos de ejemplo desde la interfaz de carga masiva:
- **Ejemplo CSV**: 10 canciones de ejemplo listas para cargar
- **Ejemplo TXT pequeño**: Pocos artistas, álbumes y canciones
- **Ejemplo TXT completo**: Catálogo completo de ejemplo

---

## Tips

💡 **Para CSV:**
- Asegúrate de que los nombres de artistas y álbumes coincidan EXACTAMENTE con los que están en la base de datos
- Los nombres no distinguen mayúsculas/minúsculas, pero deben coincidir

💡 **Para TXT:**
- Puedes omitir secciones si no las necesitas
- El orden de las secciones no importa
- Usa comentarios (#) para documentar tu archivo

💡 **General:**
- Haz una carga de prueba con pocas canciones primero
- Revisa el log de ejecución para ver qué se procesó
- Si algo falla, corrige y vuelve a intentar
