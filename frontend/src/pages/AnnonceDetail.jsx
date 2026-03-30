import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function AnnonceDetail({ me }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [annonce, setAnnonce] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/annonces/${id}/`)
      setAnnonce(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Erreur chargement annonce')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function addToFavorites() {
    if (!me) {
      nav('/login')
      return
    }
    setFavoriteLoading(true)
    try {
      await api.post('/favoris/', { annonce_id: Number(id) })
      alert('Ajouté aux favoris.')
    } catch (e) {
      const d = e?.response?.data
      alert(d?.detail || 'Impossible d’ajouter aux favoris (déjà ajouté ?)')
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (loading) return <div className="muted">Chargement…</div>
  if (error) return <div className="error">{error}</div>
  if (!annonce) return null

  return (
    <div className="stack">
      <div className="card">
        <div className="row row-between row-wrap">
          <div>
            <h2 className="m0">{annonce.titre}</h2>
            <div className="muted">
              {annonce.wilaya} · {annonce.type_bien} · {annonce.transaction} ·{' '}
              {new Date(annonce.date_publication).toLocaleString()}
            </div>
          </div>
          <div className="price">{Number(annonce.prix).toLocaleString()} DA</div>
        </div>

        <div className="grid grid-3 mt">
          <div className="stat">
            <div className="muted">Superficie</div>
            <div>{annonce.superficie} m²</div>
          </div>
          <div className="stat">
            <div className="muted">Pièces</div>
            <div>{annonce.nb_pieces}</div>
          </div>
          <div className="stat">
            <div className="muted">Statut</div>
            <div>{annonce.statut}</div>
          </div>
        </div>

        <div className="mt">
          <div className="muted">Adresse</div>
          <div>{annonce.adresse}</div>
        </div>

        {annonce.description ? (
          <div className="mt">
            <div className="muted">Description</div>
            <div className="pre">{annonce.description}</div>
          </div>
        ) : null}

        <div className="mt row row-gap">
          <button className="btn btn-primary" onClick={addToFavorites} disabled={favoriteLoading}>
            Ajouter aux favoris
          </button>
          <a className="btn btn-ghost" href={`mailto:${annonce.user?.email || ''}`}>
            Contacter (email)
          </a>
        </div>
      </div>

      {annonce.images?.length ? (
        <div className="card">
          <h3 className="m0">Images</h3>
          <div className="grid grid-3 mt">
            {annonce.images.map((img) => (
              <a key={img.id} className="img-tile" href={img.url} target="_blank" rel="noreferrer">
                <img src={img.url} alt="" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

