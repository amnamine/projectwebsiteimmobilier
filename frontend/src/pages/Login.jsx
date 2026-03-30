import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login({ onLoggedIn }) {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login/', { username, password })
      onLoggedIn?.(data)
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card maxw-sm">
      <h2 className="m0">Connexion</h2>
      <form className="stack mt" onSubmit={submit}>
        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

