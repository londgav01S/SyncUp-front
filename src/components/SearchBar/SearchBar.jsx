import React from 'react'
import './SearchBar.css'

export default function SearchBar({onSearch}){
  return (
    <div className="SearchBar searchbar">
      <div className="SearchBar__wrapper">
        <input 
          className="SearchBar__input" 
          type="search" 
          placeholder="Buscar canciones, artistas, playlists..." 
          onChange={(e)=>onSearch?.(e.target.value)}
        />
        <i className="fas fa-search SearchBar__icon"></i>
      </div>
    </div>
  )
}
