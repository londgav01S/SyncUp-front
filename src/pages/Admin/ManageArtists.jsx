import React, { useEffect, useMemo, useState } from 'react'
import { createArtist, deleteArtist, updateArtist } from '../../api/artistService'
import { GENEROS } from '../../data/genres'
import axios from '../../api/axiosConfig'

export default function ManageArtists(){
  const empty = useMemo(() => ({
    nombre: '',
    nacionalidad: '',
    generoPrincipal: '',
    generoSecundario: '',
    URLFotoArtista: ''
  }), [])

  const [form, setForm] = useState(empty)
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingArtistId, setEditingArtistId] = useState(null)

  const fetchArtists = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/artistas')
      setArtists(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Error al cargar artistas' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchArtists() }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = form.nombre && form.nacionalidad && form.generoPrincipal && form.URLFotoArtista

  const handleEdit = (artist) => {
    setEditMode(true)
    setEditingArtistId(artist.id)
    setForm({
      nombre: artist.nombre,
      nacionalidad: artist.nacionalidad,
      generoPrincipal: artist.generoPrincipal,
      generoSecundario: artist.generoSecundario || '',
      URLFotoArtista: artist.urlFotoArtista || artist.URLFotoArtista || ''
    })
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditingArtistId(null)
    setForm(empty)
    setMessage(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!canSubmit) {
      setMessage({ type:'error', text:'Completa los campos obligatorios.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        nacionalidad: form.nacionalidad.trim(),
        generoPrincipal: form.generoPrincipal,
        generoSecundario: form.generoSecundario || form.generoPrincipal,
        URLFotoArtista: form.URLFotoArtista.trim()
      }

      if (editMode && editingArtistId) {
        await updateArtist(editingArtistId, payload)
        setMessage({ type: 'success', text: 'Artista actualizado correctamente' })
        setEditMode(false)
        setEditingArtistId(null)
      } else {
        await createArtist(payload)
        setMessage({ type: 'success', text: 'Artista creado correctamente' })
      }

      setForm(empty)
      fetchArtists()
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || `Error al ${editMode ? 'actualizar' : 'crear'} artista`
      setMessage({ type: 'error', text })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (artist) => {
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar al artista "${artist.nombre}"?`)
    if (!confirmDelete) return

    try {
      await deleteArtist(artist.id)
      setMessage({ type: 'success', text: `Artista "${artist.nombre}" eliminado correctamente` })
      fetchArtists()
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'Error al eliminar artista'
      setMessage({ type: 'error', text })
    }
  }

  return (
    <div className="ManageArtistsPage admin-page" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Gestionar Artistas</h2>
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
              {editMode ? 'Editar artista' : 'Crear nuevo artista'}
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Nombre *</label>
              <input 
                name="nombre" 
                value={form.nombre} 
                onChange={onChange} 
                placeholder="Nombre del artista" 
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Nacionalidad *</label>
              <input 
                name="nacionalidad" 
                value={form.nacionalidad} 
                onChange={onChange} 
                placeholder="Nacionalidad" 
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Género principal *</label>
              <select 
                name="generoPrincipal" 
                value={form.generoPrincipal} 
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
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>Género secundario</label>
              <select 
                name="generoSecundario" 
                value={form.generoSecundario} 
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
                <option value="">(opcional)</option>
                {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>URL Foto *</label>
              <input 
                name="URLFotoArtista" 
                value={form.URLFotoArtista} 
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
                {saving ? (editMode ? 'Actualizando…' : 'Guardando…') : (editMode ? 'Actualizar artista' : 'Crear artista')}
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

        {/* Listado de artistas */}
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>Listado de artistas</h3>
          {loading ? (
            <div style={{ color:'var(--text-muted)' }}>Cargando…</div>
          ) : (
            <div className="table-responsive" style={{ overflowX:'auto' }}>
              <table className="table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ textAlign:'left', borderBottom:'1px solid var(--border-color)' }}>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Foto</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Nombre</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Nacionalidad</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Géneros</th>
                    <th style={{ padding:'var(--spacing-sm)', fontSize:14, fontWeight:600, color:'var(--text-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map(a => (
                    <tr key={a.id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'var(--spacing-sm)' }}>
                        <img
                          alt={a.nombre || 'Artista'}
                          src={(a.urlFotoArtista || a.URLFotoArtista || '').trim() || '/placeholder-artist.svg'}
                          onError={(e) => { e.currentTarget.src = '/placeholder-artist.svg' }}
                          style={{
                            width:48,
                            height:48,
                            objectFit:'cover',
                            borderRadius:'var(--border-radius-sm)'
                          }}
                        />
                      </td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{a.nombre}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text)' }}>{a.nacionalidad}</td>
                      <td style={{ padding:'var(--spacing-sm)', fontSize:14, color:'var(--text-muted)' }}>
                        {[a.generoPrincipal, a.generoSecundario].filter(Boolean).join(' / ')}
                      </td>
                      <td style={{ padding:'var(--spacing-sm)' }}>
                        <div style={{ display:'flex', gap:'var(--spacing-xs)' }}>
                          <button
                            onClick={() => handleEdit(a)}
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
                            onClick={() => handleDelete(a)}
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
                  {artists.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding:'var(--spacing-lg)', opacity:.7, textAlign:'center', color:'var(--text-muted)' }}>
                        Sin artistas registrados
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
