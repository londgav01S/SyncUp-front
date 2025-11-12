import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const cards = [
    { to: '/admin/artists', title: 'Artistas', desc: 'Crear y listar artistas', icon: 'fas fa-microphone' },
    { to: '/admin/albums', title: 'Álbumes', desc: 'Gestionar álbumes', icon: 'fas fa-compact-disc' },
    { to: '/admin/songs', title: 'Canciones', desc: 'Gestionar canciones', icon: 'fas fa-music' },
    { to: '/admin/users', title: 'Usuarios', desc: 'Administrar usuarios', icon: 'fas fa-users' },
    { to: '/admin/upload', title: 'Carga Masiva', desc: 'Subir datos en lote', icon: 'fas fa-upload' },
  ]
  return (
    <div className="AdminDashboardPage" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Panel de Administración</h2>
      <div className="grid" style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
        gap:'var(--spacing-md)'
      }}>
        {cards.map(c => (
          <Link 
            key={c.to} 
            to={c.to} 
            className="card hover-lift" 
            style={{
              display:'block', 
              background:'var(--card-bg)', 
              border:'1px solid var(--border-color)', 
              borderRadius:'var(--border-radius-md)', 
              padding:'var(--spacing-lg)',
              boxShadow:'var(--shadow-sm)',
              transition:'var(--transition-medium)',
              textDecoration:'none',
              color:'var(--text)'
            }}
          >
            <div style={{ fontSize:32, marginBottom:'var(--spacing-sm)', color:'var(--accent)' }}>
              <i className={c.icon}></i>
            </div>
            <div className="heading-4" style={{ marginBottom:'var(--spacing-xs)' }}>{c.title}</div>
            <div className="text-muted" style={{ fontSize:14 }}>{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
