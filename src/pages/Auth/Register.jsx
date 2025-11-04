import React, { useState, useContext } from 'react'
import './Auth.css'
import { AuthContext } from '../../context/AuthContext'

export default function Register(){
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')

  const submit = (e) => { e.preventDefault(); login({email}) }

  return (
    <div className="RegisterPage auth-page">
      <form onSubmit={submit} className="RegisterPage__form auth-form">
        <h2 className="RegisterPage__title">Registro</h2>
        <input className="RegisterPage__input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="RegisterPage__submit" type="submit">Crear cuenta</button>
      </form>
    </div>
  )
}
