# Endpoints de Backend Necesarios para Carga Masiva

El frontend ahora tiene una interfaz de tabs para carga masiva de **Artistas**, **Álbumes** y **Canciones**. El backend necesita implementar los siguientes endpoints:

## 1. Carga Masiva de Artistas

**Endpoint**: `POST /api/artistas/carga-masiva`

**Request**:
- Content-Type: `multipart/form-data`
- Parameter: `archivo` (MultipartFile)

**Formato CSV esperado**:
```csv
Nombre,Nacionalidad,GeneroPrincipal,GeneroSecundario,URLFotoArtista
Queen,Reino Unido,Rock,Opera Rock,https://i.scdn.co/image/b040add07a3f80ff692b26c0e8d0dc1e8e0e7a39
The Beatles,Reino Unido,Rock,Pop,https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232bc4aa91e1b97
```

**Campos**:
- `Nombre`: String - Nombre del artista
- `Nacionalidad`: String - País de origen
- `GeneroPrincipal`: String - Género musical principal (enum: ROCK, POP, JAZZ, etc.)
- `GeneroSecundario`: String - Género musical secundario
- `URLFotoArtista`: String - URL de la foto del artista

**Response**: `CargaMasivaResultadoDTO`
```java
{
  "totalProcesadas": 10,
  "exitosas": 8,
  "fallidas": 2,
  "errores": [
    "Línea 3: Género no válido: INVALID",
    "Línea 5: Artista duplicado: Queen"
  ]
}
```

**Lógica sugerida**:
```java
@PostMapping("/carga-masiva")
public ResponseEntity<CargaMasivaResultadoDTO> cargarArtistasDesdeCSV(
    @RequestParam("archivo") MultipartFile archivo
) {
    return ResponseEntity.ok(artistaService.cargarArtistasDesdeCSV(archivo));
}
```

---

## 2. Carga Masiva de Álbumes

**Endpoint**: `POST /api/albumes/carga-masiva`

**Request**:
- Content-Type: `multipart/form-data`
- Parameter: `archivo` (MultipartFile)

**Formato CSV esperado**:
```csv
Titulo,Anio,NombreArtista,Genero,URLPortadaAlbum
A Night at the Opera,1975,Queen,Rock,https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a
Abbey Road,1969,The Beatles,Rock,https://i.scdn.co/image/ab67616d0000b2735cc28a5e7bc4c1cd7c0c3e67
```

**Campos**:
- `Titulo`: String - Título del álbum
- `Anio`: Integer - Año de lanzamiento
- `NombreArtista`: String - Nombre del artista (debe existir en la BD)
- `Genero`: String - Género musical (enum: ROCK, POP, JAZZ, etc.)
- `URLPortadaAlbum`: String - URL de la portada del álbum

**Response**: `CargaMasivaResultadoDTO`

**Validaciones**:
- El artista especificado en `NombreArtista` debe existir
- Si el artista no existe, agregar error: `"Línea X: Artista no encontrado: {nombre}"`
- Evitar duplicados (mismo título + artista)

---

## 3. Carga Masiva de Canciones

**Endpoint**: `POST /api/canciones/carga-masiva`

**Request**:
- Content-Type: `multipart/form-data`
- Parameter: `archivo` (MultipartFile)

**Formato CSV esperado**:
```csv
Titulo,NombreArtista,TituloAlbum,Genero,Anio,Duracion,URLCancion
Bohemian Rhapsody,Queen,A Night at the Opera,Rock,1975,354,https://www.youtube.com/watch?v=fJ9rUzIMcZQ
```

**Campos**:
- `Titulo`: String - Título de la canción
- `NombreArtista`: String - Nombre del artista (debe existir)
- `TituloAlbum`: String - Título del álbum (debe existir)
- `Genero`: String - Género musical
- `Anio`: Integer - Año de lanzamiento
- `Duracion`: Double - Duración en segundos
- `URLCancion`: String - URL de la canción

**Response**: `CargaMasivaResultadoDTO`

**Validaciones**:
- El artista debe existir
- El álbum debe existir para ese artista
- Si falta alguno, agregar error: `"Línea X: Artista no encontrado: {nombre}"` o `"Línea X: Álbum no encontrado: {titulo}"`

---

## DTO Compartido

Usar el mismo DTO para las tres operaciones:

```java
public class CargaMasivaResultadoDTO {
    private int totalProcesadas;
    private int exitosas;
    private int fallidas;
    private List<String> errores; // Errores pre-formateados como "Línea X: mensaje"
    
    public void agregarError(int linea, String mensaje) {
        this.errores.add("Línea " + linea + ": " + mensaje);
        this.fallidas++;
    }
}
```

---

## Servicios Sugeridos

### ArtistaService.java
```java
public CargaMasivaResultadoDTO cargarArtistasDesdeCSV(MultipartFile archivo) {
    CargaMasivaResultadoDTO resultado = new CargaMasivaResultadoDTO();
    
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(archivo.getInputStream()))) {
        String linea;
        int numeroLinea = 0;
        reader.readLine(); // Saltar header
        
        while ((linea = reader.readLine()) != null) {
            numeroLinea++;
            resultado.setTotalProcesadas(resultado.getTotalProcesadas() + 1);
            
            try {
                String[] campos = parsearLineaCSV(linea);
                
                // Validar campos
                if (campos.length != 5) {
                    resultado.agregarError(numeroLinea, "Formato inválido");
                    continue;
                }
                
                // Crear artista
                Artista artista = new Artista();
                artista.setNombre(campos[0]);
                artista.setNacionalidad(campos[1]);
                artista.setGeneroPrincipal(Genero.valueOf(campos[2]));
                artista.setGeneroSecundario(campos[3]);
                artista.setUrlFotoArtista(campos[4]);
                
                // Guardar
                artistaRepository.save(artista);
                resultado.setExitosas(resultado.getExitosas() + 1);
                
            } catch (Exception e) {
                resultado.agregarError(numeroLinea, e.getMessage());
            }
        }
    } catch (IOException e) {
        throw new RuntimeException("Error al leer el archivo CSV", e);
    }
    
    return resultado;
}

private String[] parsearLineaCSV(String linea) {
    // Mismo parser que en CancionService (maneja comillas)
    List<String> campos = new ArrayList<>();
    StringBuilder campoActual = new StringBuilder();
    boolean dentroComillas = false;
    
    for (char c : linea.toCharArray()) {
        if (c == '"') {
            dentroComillas = !dentroComillas;
        } else if (c == ',' && !dentroComillas) {
            campos.add(campoActual.toString().trim());
            campoActual = new StringBuilder();
        } else {
            campoActual.append(c);
        }
    }
    campos.add(campoActual.toString().trim());
    
    return campos.toArray(new String[0]);
}
```

### AlbumService.java
Similar estructura, pero con validación de que el artista exista:

```java
// Buscar artista
Optional<Artista> artistaOpt = artistaRepository.findByNombre(nombreArtista);
if (artistaOpt.isEmpty()) {
    resultado.agregarError(numeroLinea, "Artista no encontrado: " + nombreArtista);
    continue;
}
```

---

## Archivos de Ejemplo Disponibles

El frontend ya incluye archivos CSV de ejemplo en `/public`:

- `/ejemplo-artistas.csv` - 10 artistas de rock clásico
- `/ejemplo-albumes.csv` - 10 álbumes icónicos
- `/ejemplo-canciones.csv` - 10 canciones (ya existe)

---

## Eventos del Frontend

Después de una carga exitosa, el frontend dispara eventos:

- Artistas: `window.dispatchEvent(new Event('artists-updated'))`
- Álbumes: `window.dispatchEvent(new Event('albums-updated'))`
- Canciones: `window.dispatchEvent(new Event('songs-updated'))` + `albums-updated`

Esto permite que otros componentes se actualicen automáticamente.

---

## Estado Actual

✅ Frontend completamente implementado con tabs
✅ CSVs de ejemplo creados
✅ Documentación de formato actualizada
❌ Backend endpoints pendientes de implementación

**Próximos pasos**: Implementar los 3 endpoints en el backend siguiendo estas especificaciones.
