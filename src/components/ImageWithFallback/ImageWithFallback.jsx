import React, { useState } from 'react'
import './ImageWithFallback.css'

export default function ImageWithFallback({ 
  src, 
  alt = '', 
  className = '', 
  fallbackType = 'music', // 'music', 'album', 'artist', 'playlist'
  size = 'medium', // 'small', 'medium', 'large'
  ...props 
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const sizeMap = {
    small: { width: 48, height: 48, fontSize: 16 },
    medium: { width: 128, height: 128, fontSize: 32 },
    large: { width: 256, height: 256, fontSize: 48 }
  }

  const iconMap = {
    music: '♪',
    album: '♫',
    artist: '👤', 
    playlist: '📋'
  }

  const colorMap = {
    music: { start: '#45B6B3', end: '#1C2B3A' },
    album: { start: '#F25C43', end: '#D84A32' },
    artist: { start: '#1DB954', end: '#0F7A2C' },
    playlist: { start: '#8B5A96', end: '#5D3F66' }
  }

  const { width, height, fontSize } = sizeMap[size]
  const icon = iconMap[fallbackType]
  const colors = colorMap[fallbackType]

  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad-${fallbackType}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${colors.start.replace('#', '%23')};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:${colors.end.replace('#', '%23')};stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad-${fallbackType})' width='${width}' height='${height}' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='${fontSize}' font-weight='bold' fill='white' opacity='0.9'%3E${icon}%3C/text%3E%3C/svg%3E`

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (!src || hasError) {
    return (
      <img
        src={fallbackSvg}
        alt={alt}
        className={`ImageWithFallback ${className}`}
        {...props}
      />
    )
  }

  return (
    <div className={`ImageWithFallback__container ${className}`}>
      {isLoading && (
        <div className="ImageWithFallback__placeholder">
          <img src={fallbackSvg} alt="" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`ImageWithFallback ${isLoading ? 'ImageWithFallback--loading' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}