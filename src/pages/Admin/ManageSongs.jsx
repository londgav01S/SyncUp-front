import React, { useEffect, useMemo, useState } from 'react'
import { createSong, getSongs, deleteSong, updateSong } from '../../api/songService'
import { GENEROS } from '../../data/genres'

export default function ManageSongs(){
  const empty = useMemo(() => ({
    titulo: '',
    nombreArtista: '',
    tituloAlbum: '',
    genero: '',
    anio: new Date().getFullYear(),
    duracion: '',
    URLCancion: ''
  }), [])

  const [form, setForm] = useState(empty)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingSongId, setEditingSongId] = useState(null)

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const res = await getSongs()
      setSongs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Error al cargar canciones' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSongs() }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = form.titulo && form.nombreArtista && form.tituloAlbum && form.genero && form.anio && form.duracion && form.URLCancion

  const handleEdit = (song) => {
    setEditMode(true)
    setEditingSongId(song.id)
    setForm({
      titulo: song.titulo,
      nombreArtista: song.artista?.nombre || '',
      tituloAlbum: song.album?.titulo || '',
      genero: song.genero,
      anio: song.anio,
      duracion: song.duracion,
      URLCancion: song.urlCancion || song.URLCancion || ''
    })
    setMessage(null)
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditingSongId(null)
    setForm(empty)
    setMessage(null)
  }

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
        nombreArtista: form.nombreArtista.trim(),
        tituloAlbum: form.tituloAlbum.trim(),
        genero: form.genero,
        anio: parseInt(form.anio, 10),
        duracion: parseFloat(form.duracion),
        URLCancion: form.URLCancion.trim()
      }

      if (editMode && editingSongId) {
        // Actualizar canción existente
        await updateSong(editingSongId, payload)
        setMessage({ type: 'success', text: 'Canción actualizada correctamente' })
        setEditMode(false)
        setEditingSongId(null)
      } else {
        // Crear nueva canción
        await createSong(payload)
        setMessage({ type: 'success', text: 'Canción creada correctamente' })
      }
      
      setForm(empty)
      fetchSongs()
      window.dispatchEvent(new Event('songs-updated'))
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || `Error al ${editMode ? 'actualizar' : 'crear'} canción`
      setMessage({ type: 'error', text })
    } finally {
      setSaving(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDelete = async (song) => {
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar la canción "${song.titulo}"?`)
    if (!confirmDelete) return

    try {
      await deleteSong(song.id)
      setMessage({ type: 'success', text: `Canción "${song.titulo}" eliminada correctamente` })
      fetchSongs()
      window.dispatchEvent(new Event('songs-updated'))
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'Error al eliminar canción'
      setMessage({ type: 'error', text })
    }
  }

  return (
    <div className="ManageSongsPage admin-page" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Gestionar Canciones</h2>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
        
        {/* Formulario de creación */}
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 className="heading-3" style={{ color:'var(--text)' }}>
              {editMode ? 'Editar canción' : 'Crear nueva canción'}
            </h3>
            {editMode && (
              <button
                onClick={handleCancelEdit}
                className="btn btn--secondary"
                style={{
                  padding:'var(--spacing-xs) var(--spacing-md)',
                  background:'var(--text-muted)',
                  color:'#fff',
                  border:'none',
                  borderRadius:'var(--border-radius-sm)',
                  fontSize:13,
                  fontWeight:500,
                  cursor:'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
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
                placeholder="Título de la canción" 
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Título del álbum *</label>
              <input 
                name="tituloAlbum" 
                value={form.tituloAlbum} 
                onChange={onChange} 
                placeholder="Álbum (debe existir)" 
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Duración (segundos) *</label>
              <input 
                type="number"
                step="0.01"
                name="duracion" 
                value={form.duracion} 
                onChange={onChange} 
                placeholder="180.5" 
                min="0"
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
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>URL Canción *</label>
              <input 
                name="URLCancion" 
                value={form.URLCancion} 
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
                {saving ? (editMode ? 'Actualizando…' : 'Guardando…') : (editMode ? 'Actualizar canción' : 'Crear canción')}
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

        {/* Listado de canciones */}
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>Listado de canciones</h3>
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
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Álbum</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Género</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Año</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Duración</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map(s => (
                    <tr key={s.id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'var(--spacing-sm)' }}>
                        <img
                          alt={s.titulo || 'Canción'}
                          src={(s.urlPortadaCancion || s.album?.urlPortadaAlbum || s.album?.URLPortadaAlbum || '').trim() || '/placeholder-song.svg'}
                          onError={(e) => { e.currentTarget.src = '/placeholder-song.svg' }}
                          style={{
                            width:48,
                            height:48,
                            objectFit:'cover',
                            borderRadius:'var(--border-radius-sm)'
                          }}
                        />
                      </td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{s.titulo}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{s.artista?.nombre || 'N/A'}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{s.album?.titulo || 'N/A'}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{s.genero}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{s.anio}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>{formatDuration(s.duracion)}</td>
                      <td style={{ padding:'var(--spacing-sm)' }}>
                        <div style={{ display:'flex', gap:'var(--spacing-xs)' }}>
                          <button
                            onClick={() => handleEdit(s)}
                            className="btn btn--edit"
                            style={{
                              padding:'var(--spacing-xs) var(--spacing-sm)',
                              background:'var(--secondary)',
                              color:'#fff',
                              border:'none',
                              borderRadius:'var(--border-radius-sm)',
                              fontSize:13,
                              fontWeight:500,
                              cursor:'pointer',
                              transition:'var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#3da8a5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="btn btn--danger"
                            style={{
                              padding:'var(--spacing-xs) var(--spacing-sm)',
                              background:'#ff6b6b',
                              color:'#fff',
                              border:'none',
                              borderRadius:'var(--border-radius-sm)',
                              fontSize:13,
                              fontWeight:500,
                              cursor:'pointer',
                              transition:'var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ff5252'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b6b'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {songs.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding:'var(--spacing-lg)', opacity:.7, textAlign:'center', color:'var(--text-muted)' }}>
                        Sin canciones registradas
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
