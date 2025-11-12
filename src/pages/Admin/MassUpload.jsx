import React, { useMemo, useState, useRef } from 'react'
import { parseBulkText, validateBulkData } from '../../utils/bulkParser'
import { createArtist } from '../../api/artistService'
import { createAlbum } from '../../api/albumService'
import { createSong } from '../../api/songService'

export default function MassUpload(){
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [errors, setErrors] = useState([])
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const fileInputRef = useRef(null)

  const stats = useMemo(()=>{
    if (!parsed) return null
    return {
      artistas: parsed.artistas.length,
      albumes: parsed.albumes.length,
      canciones: parsed.canciones.length
    }
  }, [parsed])

  const onPickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    setText(content)
    const data = parseBulkText(content)
    setParsed(data)
    setErrors(validateBulkData(data))
  }

  const onParse = () => {
    const data = parseBulkText(text)
    setParsed(data)
    setErrors(validateBulkData(data))
  }

  const appendLog = (msg) => setLog(prev => [...prev, msg])

  const run = async () => {
    if (!parsed) return
    const errs = validateBulkData(parsed)
    setErrors(errs)
    if (errs.length) return

    setRunning(true)
    setLog([])
    try {
      // 1) Artistas
      for (const a of parsed.artistas) {
        appendLog(`Creando artista: ${a.nombre}`)
        await createArtist({
          nombre: a.nombre,
          nacionalidad: a.nacionalidad,
          generoPrincipal: a.generoPrincipal,
          generoSecundario: a.generoSecundario || a.generoPrincipal,
          URLFotoArtista: a.URLFotoArtista
        })
      }
      // 2) Álbumes
      for (const a of parsed.albumes) {
        appendLog(`Creando álbum: ${a.titulo} (artista: ${a.nombreArtista})`)
        await createAlbum({
          titulo: a.titulo,
          anio: a.anio,
          nombreArtista: a.nombreArtista,
          genero: a.genero,
          URLPortadaAlbum: a.URLPortadaAlbum
        })
      }
      // 3) Canciones
      for (const c of parsed.canciones) {
        appendLog(`Creando canción: ${c.titulo} (album: ${c.tituloAlbum}, artista: ${c.nombreArtista})`)
        await createSong({
          titulo: c.titulo,
          nombreArtista: c.nombreArtista,
          tituloAlbum: c.tituloAlbum,
          genero: c.genero,
          anio: c.anio,
          duracion: c.duracion,
          URLCancion: c.URLCancion
        })
      }
      appendLog('Carga masiva completada.')
    } catch (err) {
      appendLog(`Error: ${err?.response?.data?.message || err.message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="MassUploadPage admin-page" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Carga masiva</h2>
      
      {/* Sección de instrucciones y descarga */}
      <section className="card" style={{ 
        background:'var(--card-bg)', 
        border:'1px solid var(--border-color)', 
        borderRadius:'var(--border-radius-md)', 
        padding:'var(--spacing-lg)',
        boxShadow:'var(--shadow-sm)',
        marginBottom:'var(--spacing-md)'
      }}>
        <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-sm)', color:'var(--text)' }}>Instrucciones</h3>
        <p style={{ marginBottom: 'var(--spacing-md)', color:'var(--text-muted)', fontSize:14 }}>
          Puedes cargar un archivo de texto con las secciones [ARTISTAS], [ALBUMES], [CANCIONES]. 
          Las columnas se separan con "|" y los comentarios comienzan con "#".
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <a 
            className="btn" 
            href="/bulk-small.txt" 
            download
            style={{
              padding:'var(--spacing-sm) var(--spacing-md)',
              background:'var(--bg)',
              color:'var(--text)',
              border:'1px solid var(--border-color)',
              borderRadius:'var(--border-radius-full)',
              fontSize:14,
              fontWeight:500,
              textDecoration:'none',
              cursor:'pointer',
              transition:'var(--transition-fast)'
            }}
          >
            <i className="fas fa-download" style={{ marginRight:8 }}></i>
            Ejemplo pequeño
          </a>
          <a 
            className="btn" 
            href="/bulk-sample.txt" 
            download
            style={{
              padding:'var(--spacing-sm) var(--spacing-md)',
              background:'var(--bg)',
              color:'var(--text)',
              border:'1px solid var(--border-color)',
              borderRadius:'var(--border-radius-full)',
              fontSize:14,
              fontWeight:500,
              textDecoration:'none',
              cursor:'pointer',
              transition:'var(--transition-fast)'
            }}
          >
            <i className="fas fa-download" style={{ marginRight:8 }}></i>
            Ejemplo completo
          </a>
        </div>
      </section>

      {/* Sección de carga y edición */}
      <section className="card" style={{ 
        background:'var(--card-bg)', 
        border:'1px solid var(--border-color)', 
        borderRadius:'var(--border-radius-md)', 
        padding:'var(--spacing-lg)',
        boxShadow:'var(--shadow-sm)',
        marginBottom:'var(--spacing-md)'
      }}>
        <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>Archivo de datos</h3>
        
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>
            Seleccionar archivo
          </label>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".txt" 
            onChange={onPickFile}
            style={{ display:'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding:'var(--spacing-sm) var(--spacing-lg)',
              background:'var(--bg)',
              color:'var(--text)',
              border:'1px solid var(--border-color)',
              borderRadius:'var(--border-radius-full)',
              fontSize:14,
              fontWeight:600,
              cursor:'pointer',
              transition:'var(--transition-fast)',
              display:'inline-flex',
              alignItems:'center',
              gap:8
            }}
          >
            <i className="fas fa-file-upload"></i>
            Elegir archivo .txt
          </button>
        </div>

        <div>
          <label style={{ display:'block', marginBottom:'var(--spacing-xs)', fontSize:14, fontWeight:500, color:'var(--text)' }}>
            Contenido del archivo
          </label>
          <textarea
            placeholder="Pega aquí el contenido del archivo o usa el selector de archivos arriba"
            value={text}
            onChange={e=>setText(e.target.value)}
            style={{ 
              width:'100%', 
              minHeight: 200, 
              padding: 'var(--spacing-md)', 
              border:'1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-sm)',
              fontSize:14,
              fontFamily:'monospace',
              background:'var(--bg)',
              color:'var(--text)',
              resize:'vertical'
            }}
          />
        </div>

        <div style={{ display:'flex', gap:'var(--spacing-sm)', marginTop:'var(--spacing-md)', flexWrap:'wrap' }}>
          <button 
            onClick={onParse}
            style={{
              padding:'var(--spacing-sm) var(--spacing-lg)',
              background:'var(--bg)',
              color:'var(--text)',
              border:'1px solid var(--border-color)',
              borderRadius:'var(--border-radius-full)',
              fontSize:14,
              fontWeight:600,
              cursor:'pointer',
              transition:'var(--transition-fast)'
            }}
          >
            <i className="fas fa-eye" style={{ marginRight:8 }}></i>
            Previsualizar
          </button>
          <button 
            onClick={run} 
            disabled={!parsed || errors.length>0 || running}
            style={{
              padding:'var(--spacing-sm) var(--spacing-lg)',
              background: (!parsed || errors.length>0 || running) ? 'var(--text-muted)' : 'var(--accent)',
              color:'#fff',
              border:'none',
              borderRadius:'var(--border-radius-full)',
              fontSize:14,
              fontWeight:600,
              cursor: (!parsed || errors.length>0 || running) ? 'not-allowed' : 'pointer',
              transition:'var(--transition-fast)'
            }}
          >
            {running ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight:8 }}></i>
                Cargando…
              </>
            ) : (
              <>
                <i className="fas fa-upload" style={{ marginRight:8 }}></i>
                Ejecutar carga
              </>
            )}
          </button>
        </div>
      </section>

      {/* Errores de validación */}
      {errors.length>0 && (
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid #ff6b6b', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)',
          marginBottom:'var(--spacing-md)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-sm)', color:'#ff6b6b' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight:8 }}></i>
            Errores en el archivo
          </h3>
          <ul style={{ marginTop:'var(--spacing-sm)', paddingLeft:20, color:'var(--text)', fontSize:14 }}>
            {errors.map((e,i)=>(<li key={i} style={{ marginBottom:4 }}>{e}</li>))}
          </ul>
        </section>
      )}

      {/* Resumen de datos parseados */}
      {parsed && errors.length === 0 && (
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--secondary)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)',
          marginBottom:'var(--spacing-md)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-sm)', color:'var(--secondary)' }}>
            <i className="fas fa-check-circle" style={{ marginRight:8 }}></i>
            Resumen
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'var(--spacing-md)', marginTop:'var(--spacing-sm)' }}>
            <div style={{ 
              padding:'var(--spacing-md)', 
              background:'var(--bg)', 
              borderRadius:'var(--border-radius-sm)',
              textAlign:'center'
            }}>
              <div style={{ fontSize:32, fontWeight:700, color:'var(--accent)' }}>{stats?.artistas}</div>
              <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:4 }}>Artistas</div>
            </div>
            <div style={{ 
              padding:'var(--spacing-md)', 
              background:'var(--bg)', 
              borderRadius:'var(--border-radius-sm)',
              textAlign:'center'
            }}>
              <div style={{ fontSize:32, fontWeight:700, color:'var(--secondary)' }}>{stats?.albumes}</div>
              <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:4 }}>Álbumes</div>
            </div>
            <div style={{ 
              padding:'var(--spacing-md)', 
              background:'var(--bg)', 
              borderRadius:'var(--border-radius-sm)',
              textAlign:'center'
            }}>
              <div style={{ fontSize:32, fontWeight:700, color:'var(--primary)' }}>{stats?.canciones}</div>
              <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:4 }}>Canciones</div>
            </div>
          </div>
        </section>
      )}

      {/* Log de ejecución */}
      {log.length>0 && (
        <section className="card" style={{ 
          background:'var(--card-bg)', 
          border:'1px solid var(--border-color)', 
          borderRadius:'var(--border-radius-md)', 
          padding:'var(--spacing-lg)',
          boxShadow:'var(--shadow-sm)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>
            <i className="fas fa-list" style={{ marginRight:8 }}></i>
            Log de ejecución
          </h3>
          <div style={{ 
            maxHeight:300, 
            overflowY:'auto', 
            padding:'var(--spacing-md)', 
            background:'var(--bg)', 
            borderRadius:'var(--border-radius-sm)',
            border:'1px solid var(--border-color)'
          }}>
            <ul style={{ margin:0, paddingLeft:20, fontSize:14, color:'var(--text)', fontFamily:'monospace' }}>
              {log.map((l,i)=>(<li key={i} style={{ marginBottom:4 }}>{l}</li>))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
