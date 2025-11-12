import React, { useEffect, useMemo, useState } from 'react'
import { createAlbum, getAlbums } from '../../api/albumService'
import { GENEROS } from '../../data/genres'

export default function ManageAlbums(){
  const empty = useMemo(() => ({
    titulo: '',
    anio: new Date().getFullYear(),
    nombreArtista: '',
    genero: '',
    URLPortadaAlbum: ''
  }), [])

  const [form, setForm] = useState(empty)
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const res = await getAlbums()
      setAlbums(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Error al cargar álbumes' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlbums() }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = form.titulo && form.nombreArtista && form.genero && form.anio && form.URLPortadaAlbum

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!canSubmit) {
      setMessage({ type:'error', text:'Completa todos los campos obligatorios.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        anio: parseInt(form.anio, 10),
        nombreArtista: form.nombreArtista.trim(),
        genero: form.genero,
        URLPortadaAlbum: form.URLPortadaAlbum.trim()
      }
      await createAlbum(payload)
      setMessage({ type: 'success', text: 'Álbum creado correctamente' })
      setForm(empty)
      fetchAlbums()
      // Disparar evento por si otras vistas necesitan refrescar
      window.dispatchEvent(new Event('albums-updated'))
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'Error al crear álbum'
      setMessage({ type: 'error', text })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ManageAlbumsPage admin-page" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Gestionar Álbumes</h2>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
        
        {/* Formulario de creación */}
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>Crear nuevo álbum</h3>
          <form onSubmit={onSubmit} className="form" style={{ 
            display:'grid', 
            gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', 
            gap:'var(--spacing-md)' 
          }}>
            <div className="form-field">
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Título *</label>
              <input 
                name="titulo" 
                value={form.titulo} 
                onChange={onChange} 
                placeholder="Título del álbum" 
                style={{
                  width:'100%',
                  padding:'var(--spacing-sm) var(--spacing-md)',
                  border:'1px solid var(--border-color)',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:14,
                  background:'var(--bg)',
                  color:'var(--text)'
                }}
              />
            </div>
            <div className="form-field">
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Año *</label>
              <input 
                type="number"
                name="anio" 
                value={form.anio} 
                onChange={onChange} 
                placeholder="2024" 
                min="1900"
                max="2100"
                style={{
                  width:'100%',
                  padding:'var(--spacing-sm) var(--spacing-md)',
                  border:'1px solid var(--border-color)',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:14,
                  background:'var(--bg)',
                  color:'var(--text)'
                }}
              />
            </div>
            <div className="form-field">
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Nombre del artista *</label>
              <input 
                name="nombreArtista" 
                value={form.nombreArtista} 
                onChange={onChange} 
                placeholder="Artista (debe existir)" 
                style={{
                  width:'100%',
                  padding:'var(--spacing-sm) var(--spacing-md)',
                  border:'1px solid var(--border-color)',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:14,
                  background:'var(--bg)',
                  color:'var(--text)'
                }}
              />
            </div>
            <div className="form-field">
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Género *</label>
              <select 
                name="genero" 
                value={form.genero} 
                onChange={onChange}
                style={{
                  width:'100%',
                  padding:'var(--spacing-sm) var(--spacing-md)',
                  border:'1px solid var(--border-color)',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:14,
                  background:'var(--bg)',
                  color:'var(--text)'
                }}
              >
                <option value="">Selecciona…</option>
                {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>URL Portada *</label>
              <input 
                name="URLPortadaAlbum" 
                value={form.URLPortadaAlbum} 
                onChange={onChange} 
                placeholder="https://..." 
                style={{
                  width:'100%',
                  padding:'var(--spacing-sm) var(--spacing-md)',
                  border:'1px solid var(--border-color)',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:14,
                  background:'var(--bg)',
                  color:'var(--text)'
                }}
              />
            </div>
            <div style={{ gridColumn:'1 / -1', display:'flex', gap:'var(--spacing-sm)', alignItems:'center', flexWrap:'wrap' }}>
              <button 
                disabled={!canSubmit || saving} 
                type="submit"
                className="btn btn--primary"
                style={{
                  padding:'var(--spacing-sm) var(--spacing-lg)',
                  background: canSubmit && !saving ? 'var(--accent)' : 'var(--text-muted)',
                  color:'#fff',
                  border:'none',
                  borderRadius:'var(--border-radius-full)',
                  fontSize:14,
                  fontWeight:600,
                  cursor: canSubmit && !saving ? 'pointer' : 'not-allowed',
                  transition:'var(--transition-fast)'
                }}
              >
                {saving ? 'Guardando…' : 'Crear álbum'}
              </button>
              {message && (
                <span style={{ 
                  color: message.type === 'error' ? '#ff6b6b' : 'var(--secondary)',
                  fontSize:14,
                  fontWeight:500
                }}>
                  {message.text}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Listado de álbumes */}
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>Listado de álbumes</h3>
          {loading ? (
            <div style={{ color:'var(--text-muted)' }}>Cargando…</div>
          ) : (
            <div className="table-responsive" style={{ overflowX:'auto' }}>
              <table className="table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ textAlign:'left', borderBottom:'1px solid var(--border-color)' }}>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Portada</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Título</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Artista</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Año</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Género</th>
                  </tr>
                </thead>
                <tbody>
                  {albums.map(a => (
                    <tr key={a.id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'var(--spacing-sm)' }}>
                        <img
                          alt={a.titulo || 'Álbum'}
                          src={(a.urlPortadaAlbum || a.URLPortadaAlbum || '').trim() || '/placeholder-album.svg'}
                          onError={(e) => { e.currentTarget.src = '/placeholder-album.svg' }}
                          style={{
                            width:48,
                            height:48,
                            objectFit:'cover',
                            borderRadius:'var(--border-radius-sm)'
                          }}
                        />
                      </td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{a.titulo}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{a.artista?.nombre || 'N/A'}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{a.anio}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{a.genero}</td>
                    </tr>
                  ))}
                  {albums.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding:'var(--spacing-lg)', opacity:.7, textAlign:'center', color:'var(--text-muted)' }}>
                        Sin álbumes registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
