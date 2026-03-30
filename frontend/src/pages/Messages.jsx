import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Messages({ me }) {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ destinataire_id: '', annonce_id: '', contenu: '' })

  const load = useCallback(async () => {
    if (!me) {
      nav('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/messages/')
      setItems(data)
    } catch {
      setError('Erreur chargement messages')
    } finally {
      setLoading(false)
    }
  }, [me, nav])

  useEffect(() => {
    load()
  }, [load])

  async function send(e) {
    e.preventDefault()
    try {
      await api.post('/messages/', {
        destinataire_id: Number(form.destinataire_id),
        annonce_id: Number(form.annonce_id),
        contenu: form.contenu,
      })
      setForm({ destinataire_id: '', annonce_id: '', contenu: '' })
      await load()
    } catch {
      alert("Envoi impossible (IDs valides ?)")
    }
  }

  return (
    <div className="stack">
      <h2 className="m0">Messages</h2>

      <div className="card">
        <div className="muted">Envoyer un message (simple)</div>
        <form className="grid grid-3 mt" onSubmit={send}>
          <label className="field">
            <span>destinataire_id</span>
            <input value={form.destinataire_id} onChange={(e) => setForm((f) => ({ ...f, destinataire_id: e.target.value }))} required />
          </label>
          <label className="field">
            <span>annonce_id</span>
            <input value={form.annonce_id} onChange={(e) => setForm((f) => ({ ...f, annonce_id: e.target.value }))} required />
          </label>
          <label className="field">
            <span>contenu</span>
            <input value={form.contenu} onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))} required />
          </label>
          <button className="btn btn-primary">Envoyer</button>
        </form>
      </div>

      {loading ? (
        <div className="muted">Chargement…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : items.length === 0 ? (
        <div className="muted">Aucun message.</div>
      ) : (
        <div className="stack">
          {items
            .slice()
            .sort((a, b) => new Date(b.date_envoi).getTime() - new Date(a.date_envoi).getTime())
            .map((m) => (
              <div key={m.id} className="card">
                <div className="row row-between row-wrap">
                  <div className="muted">
                    {new Date(m.date_envoi).toLocaleString()} · annonce #{m.annonce}
                  </div>
                  <div className={m.lu ? 'badge' : 'badge badge-accent'}>{m.lu ? 'lu' : 'non lu'}</div>
                </div>
                <div className="mt pre">{m.contenu}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

