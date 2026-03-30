import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Dashboard({ me }) {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!me) {
      nav('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/annonces/mine/')
      setItems(data)
    } catch {
      setError('Erreur chargement mes annonces')
    } finally {
      setLoading(false)
    }
  }, [me, nav])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id) {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      await api.delete(`/annonces/${id}/`)
      await load()
    } catch {
      alert('Suppression impossible')
    }
  }

  return (
    <div className="stack">
      <div className="row row-between row-wrap">
        <div>
          <h2 className="m0">Tableau de bord</h2>
          <div className="muted">{me ? `Connecté: ${me.username}` : ''}</div>
        </div>
        <Link className="btn btn-primary" to="/new">
          Publier une annonce
        </Link>
      </div>

      {loading ? (
        <div className="muted">Chargement…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : items.length === 0 ? (
        <div className="muted">Vous n’avez aucune annonce.</div>
      ) : (
        <div className="grid grid-2">
          {items.map((a) => (
            <div key={a.id} className="card">
              <div className="row row-between">
                <div className="card-title">{a.titre}</div>
                <div className="price small">{Number(a.prix).toLocaleString()} DA</div>
              </div>
              <div className="muted">
                {a.wilaya} · {a.type_bien} · {a.transaction}
              </div>
              <div className="row row-gap mt">
                <Link className="btn btn-ghost" to={`/annonces/${a.id}`}>
                  Voir
                </Link>
                <button className="btn btn-danger" onClick={() => remove(a.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

