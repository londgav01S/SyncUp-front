import React, { useState, useContext } from 'react'
import './Auth.css'
import { AuthContext } from '../../context/AuthContext'

export default function Login(){
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => { e.preventDefault(); login({email}) }

  return (
    <div className="LoginPage auth-page">
      <form onSubmit={submit} className="LoginPage__form auth-form">
        <h2 className="LoginPage__title">Login</h2>
        <input className="LoginPage__input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="LoginPage__input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="LoginPage__submit" type="submit">Entrar</button>
      </form>
    </div>
  )
}
