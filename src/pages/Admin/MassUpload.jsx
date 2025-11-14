import React, { useState, useRef } from 'react'
import axios from '../../api/axiosConfig'
import './MassUpload.css'

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
    <div className="MassUploadPage">
      <div className="MassUploadPage__header">
        <h2 className="MassUploadPage__title">
          <i className="fas fa-cloud-upload-alt"></i>
          Carga Masiva de Datos
        </h2>
        <p className="MassUploadPage__subtitle">
          Importa múltiples registros desde archivos CSV
        </p>
      </div>
      
      {/* Tabs */}
      <div className="MassUploadPage__tabs">
        <button
          onClick={() => { setActiveTab('artistas'); setFile(null); setLog([]) }}
          className={`MassUploadPage__tab ${activeTab === 'artistas' ? 'MassUploadPage__tab--active' : ''}`}
        >
          <i className="fas fa-user-music"></i>
          <span>Artistas</span>
        </button>
        <button
          onClick={() => { setActiveTab('albumes'); setFile(null); setLog([]) }}
          className={`MassUploadPage__tab ${activeTab === 'albumes' ? 'MassUploadPage__tab--active' : ''}`}
        >
          <i className="fas fa-compact-disc"></i>
          <span>Álbumes</span>
        </button>
        <button
          onClick={() => { setActiveTab('canciones'); setFile(null); setLog([]) }}
          className={`MassUploadPage__tab ${activeTab === 'canciones' ? 'MassUploadPage__tab--active' : ''}`}
        >
          <i className="fas fa-music"></i>
          <span>Canciones</span>
        </button>
      </div>

      {/* Instrucciones */}
      <section className="MassUploadPage__card">
        <div className="MassUploadPage__cardHeader">
          <h3 className="MassUploadPage__cardTitle">
            <i className="fas fa-info-circle"></i>
            {instructions.title}
          </h3>
        </div>
        
        <div className="MassUploadPage__cardContent">
          <div className="MassUploadPage__formatSection">
            <p className="MassUploadPage__label">Formato del CSV:</p>
            <code className="MassUploadPage__code">
              {instructions.format}
            </code>
          </div>
          
          <div className="MassUploadPage__fieldsSection">
            <p className="MassUploadPage__label">Descripción de campos:</p>
            <ul className="MassUploadPage__fieldsList">
              {instructions.fields.map((field, i) => (
                <li key={i}>
                  <i className="fas fa-chevron-right"></i>
                  {field}
                </li>
              ))}
            </ul>
          </div>

          {instructions.warning && (
            <div className="MassUploadPage__warning">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Importante:</strong> {instructions.warning}
              </div>
            </div>
          )}

          <a 
            className="MassUploadPage__downloadBtn" 
            href={instructions.example} 
            download
          >
            <i className="fas fa-download"></i>
            Descargar archivo de ejemplo
          </a>
        </div>
      </section>

      {/* Carga de archivo */}
      <section className="MassUploadPage__card">
        <div className="MassUploadPage__cardHeader">
          <h3 className="MassUploadPage__cardTitle">
            <i className="fas fa-file-upload"></i>
            Seleccionar archivo
          </h3>
        </div>
        
        <div className="MassUploadPage__cardContent">
          <div className="MassUploadPage__uploadArea">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              onChange={onPickFile}
              style={{ display:'none' }}
            />
            
            <div className="MassUploadPage__dropzone" onClick={() => fileInputRef.current?.click()}>
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Haz clic para seleccionar un archivo CSV</p>
              {file && (
                <div className="MassUploadPage__selectedFile">
                  <i className="fas fa-file-csv"></i>
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <button 
              onClick={uploadFile} 
              disabled={!file || running}
              className="MassUploadPage__uploadBtn"
            >
              {running ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Procesando archivo...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Iniciar carga masiva
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Log de ejecución */}
      {log.length > 0 && (
        <section className="MassUploadPage__card">
          <div className="MassUploadPage__cardHeader">
            <h3 className="MassUploadPage__cardTitle">
              <i className="fas fa-terminal"></i>
              Resultado de la operación
            </h3>
          </div>
          <div className="MassUploadPage__cardContent">
            <div className="MassUploadPage__log">
              {log.map((l,i)=>(
                <div 
                  key={i} 
                  className={`MassUploadPage__logLine ${
                    l.includes('✓') ? 'success' : 
                    l.includes('✗') ? 'error' : 
                    l.includes('Errores') ? 'warning' : ''
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

