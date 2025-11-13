import React, { useState, useRef } from 'react'
import axios from '../../api/axiosConfig'

export default function MassUpload(){
  const [activeTab, setActiveTab] = useState('canciones')
  const [file, setFile] = useState(null)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const fileInputRef = useRef(null)

  const appendLog = (msg) => setLog(prev => [...prev, msg])

  const onPickFile = (e) => {
    const selectedFile = e.target.files?.[0]
    setFile(selectedFile)
  }

  const uploadFile = async () => {
    if (!file) return
    
    setRunning(true)
    setLog([])
    
    const appendLog = (msg) => setLog(prev => [...prev, msg])
    
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      
      let endpoint = ''
      let entityName = ''
      
      switch(activeTab) {
        case 'artistas':
          endpoint = '/artistas/carga-masiva'
          entityName = 'artistas'
          break
        case 'albumes':
          endpoint = '/albumes/carga-masiva'
          entityName = 'álbumes'
          break
        case 'canciones':
          endpoint = '/canciones/carga-masiva'
          entityName = 'canciones'
          break
      }
      
      appendLog(`Iniciando carga masiva de ${entityName}...`)
      appendLog(`Archivo: ${file.name}`)
      appendLog('')
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const resultado = response.data
      appendLog(`Total procesadas: ${resultado.totalProcesadas}`)
      appendLog(`Exitosas: ${resultado.exitosas}`)
      appendLog(`Fallidas: ${resultado.fallidas}`)
      
      if (resultado.errores && resultado.errores.length > 0) {
        appendLog('')
        appendLog('Errores encontrados:')
        resultado.errores.forEach(error => {
          appendLog(`  ${error}`)
        })
      }
      
      appendLog('')
      appendLog('✓ Carga masiva completada.')
      
      // Disparar eventos globales según el tipo
      if (activeTab === 'artistas') {
        window.dispatchEvent(new Event('artists-updated'))
      } else if (activeTab === 'albumes') {
        window.dispatchEvent(new Event('albums-updated'))
      } else if (activeTab === 'canciones') {
        window.dispatchEvent(new Event('songs-updated'))
        window.dispatchEvent(new Event('albums-updated'))
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        appendLog(`✗ Error: Endpoint no disponible`)
        appendLog('')
        appendLog('El backend no tiene implementado el endpoint para esta entidad.')
        appendLog('Ver FORMATO_CARGA_MASIVA.md para más información.')
      } else {
        appendLog(`✗ Error: ${err?.response?.data?.message || err.message}`)
      }
    } finally {
      setRunning(false)
    }
  }

  const getInstructions = () => {
    switch(activeTab) {
      case 'artistas':
        return {
          title: 'Carga masiva de Artistas',
          format: 'Nombre,Nacionalidad,GeneroPrincipal,GeneroSecundario,URLFotoArtista',
          example: '/ejemplo-artistas.csv',
          fields: [
            'Nombre: Nombre del artista',
            'Nacionalidad: País de origen',
            'GeneroPrincipal: Género musical principal (ROCK, POP, JAZZ, METAL, BLUES, CLASICA, ELECTRONICA, ALTERNATIVO, etc.)',
            'GeneroSecundario: Género musical secundario (opcional, mismo formato que GeneroPrincipal)',
            'URLFotoArtista: URL de la foto del artista'
          ]
        }
      case 'albumes':
        return {
          title: 'Carga masiva de Álbumes',
          format: 'Titulo,Anio,NombreArtista,Genero,URLPortadaAlbum',
          example: '/ejemplo-albumes.csv',
          fields: [
            'Titulo: Título del álbum',
            'Anio: Año de lanzamiento (número)',
            'NombreArtista: Nombre del artista (debe existir)',
            'Genero: Género musical (ROCK, POP, JAZZ, METAL, BLUES, CLASICA, ELECTRONICA, ALTERNATIVO, etc.)',
            'URLPortadaAlbum: URL de la portada del álbum'
          ],
          warning: 'El artista debe existir previamente en la base de datos.'
        }
      case 'canciones':
      default:
        return {
          title: 'Carga masiva de Canciones',
          format: 'Titulo,NombreArtista,TituloAlbum,Genero,Anio,Duracion,URLCancion',
          example: '/ejemplo-canciones.csv',
          fields: [
            'Titulo: Título de la canción',
            'NombreArtista: Nombre del artista (debe existir)',
            'TituloAlbum: Título del álbum (debe existir)',
            'Genero: Género musical (ROCK, POP, JAZZ, etc.)',
            'Anio: Año de lanzamiento',
            'Duracion: Duración en segundos (puede tener decimales)',
            'URLCancion: URL de la canción (YouTube, SoundCloud, etc.)'
          ],
          warning: 'El artista y el álbum deben existir previamente en la base de datos.'
        }
    }
  }

  const instructions = getInstructions()

  return (
    <div className="MassUploadPage admin-page" style={{ padding: 'var(--spacing-lg)' }}>
      <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>
        Carga masiva CSV
      </h2>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-xs)', 
        marginBottom: 'var(--spacing-md)',
        borderBottom: '2px solid var(--border-color)'
      }}>
        <button
          onClick={() => { setActiveTab('artistas'); setFile(null); setLog([]) }}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'artistas' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'artistas' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'artistas' ? '2px solid var(--accent)' : 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <i className="fas fa-user-music" style={{ marginRight: 8 }}></i>
          Artistas
        </button>
        <button
          onClick={() => { setActiveTab('albumes'); setFile(null); setLog([]) }}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'albumes' ? 'var(--secondary)' : 'transparent',
            color: activeTab === 'albumes' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'albumes' ? '2px solid var(--secondary)' : 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <i className="fas fa-compact-disc" style={{ marginRight: 8 }}></i>
          Álbumes
        </button>
        <button
          onClick={() => { setActiveTab('canciones'); setFile(null); setLog([]) }}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'canciones' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'canciones' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'canciones' ? '2px solid var(--primary)' : 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <i className="fas fa-music" style={{ marginRight: 8 }}></i>
          Canciones
        </button>
      </div>

      {/* Instrucciones */}
      <section className="card" style={{ 
        background:'var(--card-bg)', 
        border:'1px solid var(--border-color)', 
        borderRadius:'var(--border-radius-md)', 
        padding:'var(--spacing-lg)',
        boxShadow:'var(--shadow-sm)',
        marginBottom:'var(--spacing-md)'
      }}>
        <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-sm)', color:'var(--text)' }}>
          {instructions.title}
        </h3>
        
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ marginBottom: 'var(--spacing-sm)', color:'var(--text-muted)', fontSize:14 }}>
            <strong>Formato del CSV:</strong>
          </p>
          <code style={{ 
            display: 'block',
            padding: 'var(--spacing-sm)',
            background: 'var(--bg)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 13,
            fontFamily: 'monospace',
            color: 'var(--text)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {instructions.format}
          </code>
          
          <p style={{ marginBottom: 'var(--spacing-xs)', color:'var(--text-muted)', fontSize:14 }}>
            <strong>Campos:</strong>
          </p>
          <ul style={{ paddingLeft: 20, color:'var(--text-muted)', fontSize:14 }}>
            {instructions.fields.map((field, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{field}</li>
            ))}
          </ul>
        </div>

        {instructions.warning && (
          <div style={{ 
            padding: 'var(--spacing-sm) var(--spacing-md)', 
            background: 'rgba(242, 92, 67, 0.1)', 
            border: '1px solid rgba(242, 92, 67, 0.3)',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
              <i className="fas fa-info-circle" style={{ marginRight: 8, color: 'var(--accent)' }}></i>
              <strong>Importante:</strong> {instructions.warning}
            </p>
          </div>
        )}

        <a 
          className="btn" 
          href={instructions.example} 
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
            transition:'var(--transition-fast)',
            display:'inline-flex',
            alignItems:'center',
            gap:8
          }}
        >
          <i className="fas fa-download"></i>
          Descargar ejemplo CSV
        </a>
      </section>

      {/* Carga de archivo */}
      <section className="card" style={{ 
        background:'var(--card-bg)', 
        border:'1px solid var(--border-color)', 
        borderRadius:'var(--border-radius-md)', 
        padding:'var(--spacing-lg)',
        boxShadow:'var(--shadow-sm)',
        marginBottom:'var(--spacing-md)'
      }}>
        <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-md)', color:'var(--text)' }}>
          Seleccionar archivo
        </h3>
        
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
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
            Elegir archivo CSV
          </button>
          {file && (
            <span style={{ marginLeft: 16, color: 'var(--text)', fontSize: 14 }}>
              <i className="fas fa-file-csv" style={{ marginRight: 8, color: 'var(--secondary)' }}></i>
              {file.name}
            </span>
          )}
        </div>

        <button 
          onClick={uploadFile} 
          disabled={!file || running}
          style={{
            padding:'var(--spacing-sm) var(--spacing-lg)',
            background: (!file || running) ? 'var(--text-muted)' : 'var(--accent)',
            color:'#fff',
            border:'none',
            borderRadius:'var(--border-radius-full)',
            fontSize:14,
            fontWeight:600,
            cursor: (!file || running) ? 'not-allowed' : 'pointer',
            transition:'var(--transition-fast)'
          }}
        >
          {running ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight:8 }}></i>
              Procesando…
            </>
          ) : (
            <>
              <i className="fas fa-upload" style={{ marginRight:8 }}></i>
              Cargar archivo
            </>
          )}
        </button>
      </section>

      {/* Log de ejecución */}
      {log.length > 0 && (
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
            <ul style={{ margin:0, paddingLeft:20, fontSize:14, color:'var(--text)', fontFamily:'monospace', listStyle:'none' }}>
              {log.map((l,i)=>(
                <li key={i} style={{ marginBottom:4, paddingLeft: l.startsWith('  ') ? 20 : 0 }}>{l}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

