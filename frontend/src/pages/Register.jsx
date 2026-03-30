import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    telephone: '',
    role: 'proprietaire',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register/', form)
      nav('/login')
    } catch (err) {
      setError('Inscription impossible (username/email déjà utilisé ?)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card maxw-sm">
      <h2 className="m0">Créer un compte</h2>
      <form className="stack mt" onSubmit={submit}>
        <label className="field">
          <span>Username</span>
          <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        </label>
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
        </label>
        <label className="field">
          <span>Téléphone</span>
          <input value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} />
        </label>
        <label className="field">
          <span>Rôle</span>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="proprietaire">proprietaire</option>
            <option value="acheteur">acheteur</option>
            <option value="visiteur">visiteur</option>
          </select>
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Créer compte'}
        </button>
      </form>
    </div>
  )
}

