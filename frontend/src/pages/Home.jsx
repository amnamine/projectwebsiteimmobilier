import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const typeBienOptions = [
  'appartement',
  'villa',
  'studio',
  'duplex',
  'maison',
  'terrain',
  'garage',
  'local',
]

export default function Home({ me }) {
  const [loading, setLoading] = useState(true)
  const [annonces, setAnnonces] = useState([])
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    wilaya: '',
    type_bien: '',
    transaction: '',
    prix_min: '',
    prix_max: '',
  })

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(filters)) {
      if (v) p.set(k, v)
    }
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [filters])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/annonces/${qs}`)
      setAnnonces(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Erreur chargement annonces')
    } finally {
      setLoading(false)
    }
  }, [qs])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="stack">
      <div className="hero-card">
        <div>
          <h1>Saheliq</h1>
          <p className="muted">
            Trouvez votre bien immobilier en Algérie et estimez son prix avec l’IA.
          </p>
        </div>
        {me ? (
          <Link className="btn btn-primary" to="/new">
            Publier une annonce
          </Link>
        ) : (
          <Link className="btn btn-primary" to="/login">
            Se connecter pour publier
          </Link>
        )}
      </div>

      <div className="card">
        <div className="grid grid-5">
          <label className="field">
            <span>Wilaya</span>
            <input
              value={filters.wilaya}
              onChange={(e) => setFilters((f) => ({ ...f, wilaya: e.target.value }))}
              placeholder="Ex: Alger"
            />
          </label>
          <label className="field">
            <span>Type</span>
            <select
              value={filters.type_bien}
              onChange={(e) => setFilters((f) => ({ ...f, type_bien: e.target.value }))}
            >
              <option value="">Tous</option>
              {typeBienOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Transaction</span>
            <select
              value={filters.transaction}
              onChange={(e) => setFilters((f) => ({ ...f, transaction: e.target.value }))}
            >
              <option value="">Toutes</option>
              <option value="vente">vente</option>
              <option value="location">location</option>
            </select>
          </label>
          <label className="field">
            <span>Prix min</span>
            <input
              value={filters.prix_min}
              onChange={(e) => setFilters((f) => ({ ...f, prix_min: e.target.value }))}
              inputMode="numeric"
              placeholder="0"
            />
          </label>
          <label className="field">
            <span>Prix max</span>
            <input
              value={filters.prix_max}
              onChange={(e) => setFilters((f) => ({ ...f, prix_max: e.target.value }))}
              inputMode="numeric"
              placeholder="99999999"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="muted">Chargement…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : annonces.length === 0 ? (
        <div className="muted">Aucune annonce trouvée.</div>
      ) : (
        <div className="grid grid-3">
          {annonces.map((a) => (
            <Link key={a.id} to={`/annonces/${a.id}`} className="card card-link">
              <div className="card-title">{a.titre}</div>
              <div className="muted">
                {a.wilaya} · {a.type_bien} · {a.transaction}
              </div>
              <div className="price">{Number(a.prix).toLocaleString()} DA</div>
              <div className="muted">
                {a.superficie} m² · {a.nb_pieces} pièces
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

