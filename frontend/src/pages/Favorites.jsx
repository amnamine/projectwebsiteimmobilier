import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Favorites({ me }) {
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
      const { data } = await api.get('/favoris/')
      setItems(data)
    } catch {
      setError('Erreur chargement favoris')
    } finally {
      setLoading(false)
    }
  }, [me, nav])

  useEffect(() => {
    load()
  }, [load])

  async function remove(favId) {
    try {
      await api.delete(`/favoris/${favId}/`)
      await load()
    } catch {
      alert('Suppression impossible')
    }
  }

  return (
    <div className="stack">
      <h2 className="m0">Favoris</h2>
      {loading ? (
        <div className="muted">Chargement…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : items.length === 0 ? (
        <div className="muted">Aucun favori.</div>
      ) : (
        <div className="grid grid-2">
          {items.map((f) => (
            <div key={f.id} className="card">
              <div className="row row-between row-wrap">
                <div>
                  <div className="card-title">{f.annonce?.titre}</div>
                  <div className="muted">
                    {f.annonce?.wilaya} · {f.annonce?.type_bien} · {f.annonce?.transaction}
                  </div>
                </div>
                <div className="price small">{Number(f.annonce?.prix || 0).toLocaleString()} DA</div>
              </div>
              <div className="row row-gap mt">
                <Link className="btn btn-ghost" to={`/annonces/${f.annonce?.id}`}>
                  Voir
                </Link>
                <button className="btn btn-danger" onClick={() => remove(f.id)}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

