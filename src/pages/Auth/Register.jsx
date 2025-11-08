import React, { useState, useContext } from 'react'
import './Auth.css'
import { AuthContext } from '../../context/AuthContext'
import { createUser } from '../../api/userService'

export default function Register(){
  const { login } = useContext(AuthContext)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const payload = { nombre, correo: email, contrasena: password }
      const res = await createUser(payload)
      setMessage({ type: 'success', text: 'Usuario creado correctamente.' })
      // Optionally auto-login if backend returns enough data/token
      // If you want to login automatically using AuthContext, adapt as needed
      // login({ email })
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'Error al crear usuario'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="RegisterPage auth-page">
      <form onSubmit={submit} className="RegisterPage__form auth-form">
        <h2 className="RegisterPage__title">Registro</h2>
        <p>Completa tus datos para crear una cuenta.</p>

        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" className="RegisterPage__input" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} />

        <label htmlFor="email">Correo</label>
        <input id="email" className="RegisterPage__input" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />

        <label htmlFor="password">Contraseña</label>
        <input id="password" className="RegisterPage__input" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="RegisterPage__submit" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>

        {message && (
          <div style={{marginTop:12, color: message.type === 'error' ? '#b00020' : '#0a7f2a', textAlign:'center'}}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
