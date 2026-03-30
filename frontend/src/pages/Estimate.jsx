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

export default function Estimate({ me }) {
  const nav = useNavigate()
  const [form, setForm] = useState({
    wilaya: '',
    superficie: '',
    nb_pieces: '',
    type_bien: 'appartement',
    etage: 0,
    age: 0,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!me) {
      nav('/login')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload = {
        wilaya: form.wilaya,
        superficie: Number(form.superficie),
        nb_pieces: Number(form.nb_pieces),
        type_bien: form.type_bien,
        etage: Number(form.etage),
        age: Number(form.age),
      }
      const { data } = await api.post('/estimate/', payload)
      setResult(data)
    } catch (e2) {
      setError(e2?.response?.data?.detail || 'Estimation impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <h2 className="m0">Estimation de prix (IA)</h2>
        <form className="stack mt" onSubmit={submit}>
          <div className="grid grid-3">
            <label className="field">
              <span>Wilaya</span>
              <input value={form.wilaya} onChange={(e) => setForm((f) => ({ ...f, wilaya: e.target.value }))} required />
            </label>
            <label className="field">
              <span>Superficie (m²)</span>
              <input value={form.superficie} onChange={(e) => setForm((f) => ({ ...f, superficie: e.target.value }))} inputMode="numeric" required />
            </label>
            <label className="field">
              <span>Pièces</span>
              <input value={form.nb_pieces} onChange={(e) => setForm((f) => ({ ...f, nb_pieces: e.target.value }))} inputMode="numeric" required />
            </label>
          </div>
          <div className="grid grid-3">
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
              <span>Étage</span>
              <input value={form.etage} onChange={(e) => setForm((f) => ({ ...f, etage: e.target.value }))} inputMode="numeric" />
            </label>
            <label className="field">
              <span>Âge (années)</span>
              <input value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} inputMode="numeric" />
            </label>
          </div>

          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Estimer'}
          </button>
        </form>
      </div>

      {result ? (
        <div className="card">
          <h3 className="m0">Résultat</h3>
          <div className="price mt">{Number(result.prix).toLocaleString()} DA</div>
          <div className="muted">
            Fourchette: {Number(result.fourchette?.min || 0).toLocaleString()} —{' '}
            {Number(result.fourchette?.max || 0).toLocaleString()} DA
          </div>
        </div>
      ) : null}
    </div>
  )
}

