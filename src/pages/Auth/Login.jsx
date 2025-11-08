import React, { useState, useContext } from 'react'
import './Auth.css'
import { AuthContext } from '../../context/AuthContext'
import { getUserByCorreo } from '../../api/userService'

export default function Login(){
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await getUserByCorreo(email)
      const user = res.data
      // Note: backend stores `contrasena` in plain text; compare client-side (not secure)
      if (!user || !user.contrasena) {
        setMessage({ type: 'error', text: 'Usuario no encontrado' })
      } else if (user.contrasena !== password) {
        setMessage({ type: 'error', text: 'Contraseña incorrecta' })
      } else {
        // Successful login: store user in context (minimal info)
        login({ id: user.id, nombre: user.nombre, correo: user.usuario })
        setMessage({ type: 'success', text: 'Login correcto' })
      }
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'Error en login'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="LoginPage auth-page">
      <form onSubmit={submit} className="LoginPage__form auth-form">
        <h2 className="LoginPage__title">Login</h2>
        <p>Ingresa tus credenciales</p>

        <label htmlFor="email">Correo</label>
        <input id="email" className="LoginPage__input" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />

        <label htmlFor="password">Contraseña</label>
        <input id="password" className="LoginPage__input" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="LoginPage__submit" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>

        {message && (
          <div style={{marginTop:12, color: message.type === 'error' ? '#b00020' : '#0a7f2a', textAlign:'center'}}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
