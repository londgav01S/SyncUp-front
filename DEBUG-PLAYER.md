# 🔧 Guía de Depuración del Reproductor

## Estado Actual
- ✅ react-player instalado (v2.14.0)
- ✅ PlayerContext con volume, muted, duration, progress
- ✅ Build exitoso sin errores
- 🔍 Reproductor VISIBLE temporalmente para debug

## Cómo probar

### 1. Inicia el servidor de desarrollo
```powershell
npm run dev
```

### 2. Abre http://localhost:5173 en tu navegador

### 3. Abre la consola del navegador (F12)

### 4. Prueba la reproducción

#### Opción A: Desde Home (grilla de cards)
1. Pasa el mouse sobre una card
2. Verás un botón circular play/pause
3. Haz clic en el botón
4. Deberías ver en la esquina inferior derecha:
   - Un cuadro negro con "DEBUG: Player URL: ..."
   - El reproductor de YouTube visible (320x180px)

#### Opción B: Desde detalles de canción
1. Haz clic en una card (fuera del botón overlay)
2. Te llevará a `/songs/:id`
3. La canción debería auto-reproducirse
4. Verás el reproductor debug en la esquina

### 5. Verifica los logs en consola

Deberías ver:
```
ReactPlayer ready, URL: https://www.youtube.com/watch?v=ysz5S6PUM-U
Player onDuration: [número de segundos]
ReactPlayer started
Progress: 0.xxx / xxx.xxx (cada segundo mientras reproduce)
```

## Posibles problemas y soluciones

### ❌ No se ve el reproductor debug
**Causa**: No hay canción seleccionada o `current` es null
**Solución**: Haz clic en el botón play de una card

### ❌ Aparece el reproductor pero no suena
**Causa**: Política de autoplay del navegador
**Solución**: 
- Haz clic en el botón play/pause del reproductor visible
- O haz clic en play dentro del iframe de YouTube

### ❌ Error "ReactPlayer error: ..."
**Causa**: URL inválida o problema de CORS
**Solución**: 
- Verifica que la URL sea válida
- Prueba con otra URL de YouTube
- Revisa que no haya bloqueadores de ads

### ❌ No aparece ningún log en consola
**Causa**: React Player no se está montando
**Solución**:
1. Verifica que `current` tenga valor (usa React DevTools)
2. Verifica que `url` no sea undefined
3. Comprueba que el componente Player esté renderizado

## URLs de prueba válidas

Estas URLs deberían funcionar:
```
https://www.youtube.com/watch?v=ysz5S6PUM-U
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/ysz5S6PUM-U
```

## Próximos pasos

Una vez que veas el reproductor funcionando:
1. ✅ Confirma que el audio se escucha
2. ✅ Verifica que los logs aparecen
3. ✅ Prueba play/pause desde los controles
4. ✅ Prueba la barra de progreso (seek)

Luego volveremos a ocultar el reproductor y solo usaremos la barra inferior.

## Información técnica

### Librería usada
- `react-player@2.14.0` - Soporta YouTube, SoundCloud, Vimeo, archivos locales, etc.
- Documentación: https://www.npmjs.com/package/react-player

### Configuración actual
```jsx
<ReactPlayer
  url={url}                    // URL de YouTube
  playing={playing}            // Control de play/pause desde context
  controls={true}              // Controles visibles (temporal)
  volume={muted ? 0 : volume}  // Volumen del context
  onDuration={setDuration}     // Callback cuando se conoce la duración
  onProgress={onProgress}      // Callback cada segundo con progreso
/>
```

### Context disponible
```js
{
  current,        // Canción actual { id, title, artist, url, cover, ... }
  playing,        // boolean
  play(song),     // función para reproducir
  pause(),        // función para pausar
  duration,       // duración total en segundos
  playedSeconds,  // segundos reproducidos
  played,         // fracción 0-1 reproducida
  volume,         // 0-1
  muted,          // boolean
  controller: {
    seekToSeconds(sec),
    seekToFraction(f),
  }
}
```
