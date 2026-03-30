import { Link, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api, clearAuth, getToken, setAuthTokens } from './lib/api'
import Home from './pages/Home'
import AnnonceDetail from './pages/AnnonceDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewAnnonce from './pages/NewAnnonce'
import Favorites from './pages/Favorites'
import Messages from './pages/Messages'
import Estimate from './pages/Estimate'

function App() {
  const [me, setMe] = useState(null)
  const token = getToken()

  async function refreshMe() {
    if (!getToken()) {
      setMe(null)
      return
    }
    try {
      const { data } = await api.get('/auth/me/')
      setMe(data)
    } catch {
      clearAuth()
      setMe(null)
    }
  }

  useEffect(() => {
    refreshMe()
  }, [token])

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" to="/">
            Saheliq
          </Link>
          <nav className="nav">
            <Link to="/">Annonces</Link>
            <Link to="/estimate">Estimation IA</Link>
            {me ? (
              <>
                <Link to="/dashboard">Tableau de bord</Link>
                <Link to="/favorites">Favoris</Link>
                <Link to="/messages">Messages</Link>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    clearAuth()
                    setMe(null)
                  }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Connexion</Link>
                <Link className="btn btn-primary" to="/register">
                  Créer compte
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home me={me} />} />
          <Route path="/annonces/:id" element={<AnnonceDetail me={me} />} />
          <Route
            path="/login"
            element={
              <Login
                onLoggedIn={(tokens) => {
                  setAuthTokens(tokens)
                  refreshMe()
                }}
              />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard me={me} />} />
          <Route path="/new" element={<NewAnnonce me={me} />} />
          <Route path="/favorites" element={<Favorites me={me} />} />
          <Route path="/messages" element={<Messages me={me} />} />
          <Route path="/estimate" element={<Estimate me={me} />} />
          <Route path="*" element={<div>Page introuvable</div>} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>Saheliq — Plateforme Immobilière Intelligente</span>
        </div>
      </footer>
    </div>
  )
}

export default App
