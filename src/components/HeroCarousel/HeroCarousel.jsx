import React, { useState, useEffect } from 'react';
import usePlayer from '../../hooks/usePlayer'
import './HeroCarousel.css';

// Canciones famosas en el hero
const featuredSongs = [
  { id: 1, title: 'Shape of You', artist: 'Ed Sheeran', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', cover: 'https://picsum.photos/seed/hero-shapeofyou/1200/500', gradient: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' },
  { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', url: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ', cover: 'https://picsum.photos/seed/hero-blindinglights/1200/500', gradient: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
  { id: 3, title: 'bad guy', artist: 'Billie Eilish', url: 'https://www.youtube.com/watch?v=DyDfgMOUjCI', cover: 'https://picsum.photos/seed/hero-badguy/1200/500', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' },
  { id: 4, title: 'Bohemian Rhapsody', artist: 'Queen', url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', cover: 'https://picsum.photos/seed/hero-bohemian/1200/500', gradient: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' },
  { id: 5, title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', cover: 'https://picsum.photos/seed/hero-despacito/1200/500', gradient: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)' },
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { play } = usePlayer()

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredSongs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredSongs.length) % featuredSongs.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredSongs.length);
    setIsAutoPlaying(false);
  };

  const currentSong = featuredSongs[currentIndex];

  return (
    <div className="HeroCarousel">
      {/* Hero Slide */}
      <div 
        className="HeroCarousel__slide"
        style={{
          background: currentSong.gradient
        }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="HeroCarousel__overlay" />
        
        {/* Imagen de fondo con efecto parallax */}
        <div className="HeroCarousel__imageContainer">
          <img 
            src={currentSong.cover}
            alt={currentSong.title}
            className="HeroCarousel__backgroundImage"
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          />
        </div>

        {/* Contenido */}
        <div className="HeroCarousel__content">
          <div className="HeroCarousel__badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span>Destacado</span>
          </div>

          <h1 className="HeroCarousel__title">
            {currentSong.title}
          </h1>
          
          <p className="HeroCarousel__artist">
            {currentSong.artist}
          </p>

          <div className="HeroCarousel__actions">
            <button className="HeroCarousel__playButton" onClick={() => play(currentSong)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Reproducir ahora
            </button>
            
            <button className="HeroCarousel__secondaryButton">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Me gusta
            </button>
          </div>
        </div>

        {/* Controles de navegación */}
        <button 
          className="HeroCarousel__navButton HeroCarousel__navButton--prev" 
          onClick={goToPrevious}
          aria-label="Anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <button 
          className="HeroCarousel__navButton HeroCarousel__navButton--next" 
          onClick={goToNext}
          aria-label="Siguiente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>

        {/* Indicadores */}
        <div className="HeroCarousel__indicators">
          {featuredSongs.map((_, index) => (
            <button
              key={index}
              className={`HeroCarousel__indicator ${index === currentIndex ? 'HeroCarousel__indicator--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Miniaturas de canciones siguientes */}
      <div className="HeroCarousel__thumbnails">
        {featuredSongs.slice(0, 5).map((song, index) => (
          <div
            key={song.id}
            className={`HeroCarousel__thumbnail ${index === currentIndex ? 'HeroCarousel__thumbnail--active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            <img 
              src={song.cover} 
              alt={song.title}
              className="HeroCarousel__thumbnailImage"
            />
            <div className="HeroCarousel__thumbnailOverlay">
              <div className="HeroCarousel__thumbnailContent">
                <div className="HeroCarousel__thumbnailTitle">{song.title}</div>
                <div className="HeroCarousel__thumbnailArtist">{song.artist}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
