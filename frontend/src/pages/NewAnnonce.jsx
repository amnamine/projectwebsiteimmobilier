import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function NewAnnonce({ me }) {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type_bien: 'appartement',
    transaction: 'vente',
    prix: '',
    superficie: '',
    nb_pieces: '',
    wilaya: '',
    adresse: '',
    statut: 'active',
    imagesText: '',
  })

  async function submit(e) {
    e.preventDefault()
    if (!me) {
      nav('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const images = form.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = {
        titre: form.titre,
        description: form.description,
        type_bien: form.type_bien,
        transaction: form.transaction,
        prix: Number(form.prix),
        superficie: Number(form.superficie),
        nb_pieces: Number(form.nb_pieces),
        wilaya: form.wilaya,
        adresse: form.adresse,
        statut: form.statut,
        images,
      }
      const { data } = await api.post('/annonces/', payload)
      nav(`/annonces/${data.id || ''}`)
    } catch {
      setError('Publication impossible (vérifiez les champs).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="m0">Publier une annonce</h2>
      <form className="stack mt" onSubmit={submit}>
        <div className="grid grid-2">
          <label className="field">
            <span>Titre</span>
            <input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} required />
          </label>
          <label className="field">
            <span>Wilaya</span>
            <input value={form.wilaya} onChange={(e) => setForm((f) => ({ ...f, wilaya: e.target.value }))} required />
          </label>
        </div>

        <label className="field">
          <span>Adresse</span>
          <input value={form.adresse} onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))} required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </label>

        <div className="grid grid-4">
          <label className="field">
            <span>Type</span>
            <select value={form.type_bien} onChange={(e) => setForm((f) => ({ ...f, type_bien: e.target.value }))}>
              {typeBienOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Transaction</span>
            <select value={form.transaction} onChange={(e) => setForm((f) => ({ ...f, transaction: e.target.value }))}>
              <option value="vente">vente</option>
              <option value="location">location</option>
            </select>
          </label>
          <label className="field">
            <span>Prix (DA)</span>
            <input value={form.prix} onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))} inputMode="numeric" required />
          </label>
          <label className="field">
            <span>Superficie (m²)</span>
            <input value={form.superficie} onChange={(e) => setForm((f) => ({ ...f, superficie: e.target.value }))} inputMode="numeric" required />
          </label>
        </div>

        <div className="grid grid-2">
          <label className="field">
            <span>Nombre de pièces</span>
            <input value={form.nb_pieces} onChange={(e) => setForm((f) => ({ ...f, nb_pieces: e.target.value }))} inputMode="numeric" required />
          </label>
          <label className="field">
            <span>Statut</span>
            <select value={form.statut} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))}>
              <option value="active">active</option>
              <option value="archivee">archivee</option>
              <option value="vendue">vendue</option>
              <option value="louee">louee</option>
              <option value="suspendue">suspendue</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Images (URLs, une par ligne)</span>
          <textarea rows={4} value={form.imagesText} onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))} />
        </label>

        {error ? <div className="error">{error}</div> : null}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Publier'}
        </button>
      </form>
    </div>
  )
}

