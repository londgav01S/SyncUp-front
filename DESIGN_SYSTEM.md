# Sistema de Diseño - Estilo Moderno Spotify

## 🎨 Paleta de Colores

### Colores Principales
```css
--primary: #1C2B3A      /* Azul Marino Profundo - Fondo oscuro, textos principales */
--accent: #F25C43       /* Naranja Coral - Botones, acentos, énfasis */
--secondary: #45B6B3    /* Turquesa Suave - Detalles secundarios */
--bg: #FAF8F4           /* Marfil Claro - Fondo principal */
--text: #1C2B3A         /* Texto principal */
--text-muted: #444B54   /* Gris Oscuro - Subtítulos, descripciones */
```

### Superficies
```css
--color-surface: #1C2B3A           /* Navbar/Sidebar oscuros */
--color-surface-elevated: #243447  /* Superficies elevadas */
--on-surface: #FAF8F4              /* Texto sobre superficies oscuras */
--card-bg: #FFFFFF                 /* Fondo de tarjetas */
```

## 🎭 Componentes Principales

### Navbar
- Fondo oscuro con `var(--color-surface)`
- Enlaces con hover sutil y transiciones suaves
- Botones destacados con `var(--accent)`
- Bordes redondeados completos (`border-radius-full`)

### Sidebar
- Diseño vertical sticky
- Items con hover states elegantes
- Active state con color de acento
- Iconos de 24x24px

### Player
- Barra fija en la parte inferior
- Controles centralizados con botones circulares
- Slider de progreso interactivo
- Efectos hover en botones y sliders

### Cards (SongCard / PlaylistCard)
- Elevación en hover con `translateY(-4px)`
- Sombras sutiles que aumentan al hover
- Overlay de play button en hover
- Bordes redondeados medianos

### Botones
Clases disponibles:
- `.btn` - Base
- `.btn--primary` - Naranja coral
- `.btn--secondary` - Turquesa
- `.btn--outline` - Solo borde
- `.btn--ghost` - Transparente
- `.btn--small` / `.btn--large` - Tamaños

## 📐 Sistema de Espaciado

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

Clases helper:
- `.mt-*` / `.mb-*` - Margin top/bottom
- `.p-*` - Padding
- Donde `*` = xs, sm, md, lg, xl

## 🔲 Bordes Redondeados

```css
--border-radius-sm: 6px    /* Inputs, botones pequeños */
--border-radius-md: 10px   /* Cards, imágenes */
--border-radius-lg: 14px   /* Modales, contenedores grandes */
--border-radius-full: 500px /* Botones circulares/pill */
```

## ✨ Sombras

```css
--shadow-sm: 0 2px 4px rgba(28, 43, 58, 0.08)
--shadow-md: 0 4px 12px rgba(28, 43, 58, 0.12)
--shadow-lg: 0 8px 24px rgba(28, 43, 58, 0.16)
```

## ⚡ Transiciones

```css
--transition-fast: 0.15s ease
--transition-medium: 0.25s ease
```

## 🎯 Efectos de Hover

### Lift Effect
```css
.hover-lift:hover {
  transform: translateY(-4px);
}
```

### Scale Effect
```css
.hover-scale:hover {
  transform: scale(1.05);
}
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 480px
- Tablet: < 768px
- Desktop: < 1024px
- Large Desktop: > 1024px

### Grid Responsive
```css
.grid--auto  /* Auto-fill minmax(200px, 1fr) */
.grid--2     /* 2 columnas → 1 en móvil */
.grid--3     /* 3 columnas → 2 en tablet → 1 en móvil */
.grid--4     /* 4 columnas → 3 en tablet → 2 en móvil → 1 en móvil */
```

## 🔤 Tipografía

### Font Family
```css
font-family: 'Circular', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;
```

### Headings
```css
.heading-1  /* 48px, 900 weight */
.heading-2  /* 32px, 800 weight */
.heading-3  /* 24px, 700 weight */
.heading-4  /* 18px, 700 weight */
```

## 🎨 Badges

```css
.badge--accent     /* Naranja coral */
.badge--secondary  /* Turquesa */
.badge--primary    /* Azul marino */
```

## 📦 Utilidades Adicionales

### Flexbox
- `.flex` / `.flex-col`
- `.items-center` / `.justify-center` / `.justify-between`
- `.gap-sm` / `.gap-md` / `.gap-lg`

### Texto
- `.text-primary` / `.text-accent` / `.text-secondary` / `.text-muted`
- `.text-center` / `.text-left` / `.text-right`
- `.truncate` / `.truncate-2` / `.truncate-3`

### Loading
```html
<div class="spinner"></div>
<div class="spinner spinner--small"></div>
<div class="spinner spinner--large"></div>
```

## 🎪 Scrollbar Personalizado

Los scrollbars tienen un estilo moderno similar a Spotify:
- Track transparente
- Thumb gris suave con hover más oscuro
- Bordes redondeados

## 🚀 Uso Recomendado

### Ejemplo de Card
```jsx
<div className="card hover-lift">
  <h3 className="heading-3 mb-sm">Título</h3>
  <p className="text-muted truncate-2">Descripción...</p>
  <button className="btn btn--primary mt-md">Acción</button>
</div>
```

### Ejemplo de Grid de Canciones
```jsx
<div className="grid grid--auto gap-md">
  <SongCard />
  <SongCard />
  <SongCard />
</div>
```

## 🎨 Mejores Prácticas

1. **Consistencia**: Usa las variables CSS en lugar de valores hardcodeados
2. **Hover states**: Todos los elementos interactivos deben tener hover
3. **Transiciones**: Usa `var(--transition-fast)` para interacciones rápidas
4. **Accesibilidad**: Mantén ratios de contraste adecuados
5. **Spacing**: Usa el sistema de espaciado predefinido
6. **Sombras**: Usa sombras sutiles, aumenta en hover
7. **Bordes**: Usa los radios predefinidos para consistencia

## 📝 Notas

- Todos los colores principales están definidos en `src/assets/global.css`
- Las utilidades están en `src/assets/utilities.css`
- Importados automáticamente desde `src/main.css`
- El sistema es totalmente responsive por defecto
