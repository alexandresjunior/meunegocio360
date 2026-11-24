import { useState } from 'react'
import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../features/auth'
import { useEmpresa } from '../features/empresa'
import { ALL_ACCESS_PROFILES } from '../shared/lib/accessProfiles.js'
import brandLogo from '../assets/logo_meunegocio360_v1_branca.png'

const navigationItems = [
  { label: 'Início', to: '/', profiles: ALL_ACCESS_PROFILES },
  { label: 'Empresa', to: '/empresa', profiles: ALL_ACCESS_PROFILES },
]

function BrandMark({ compact = false }) {
  return (
    <span
      className={`app-brand-frame${compact ? ' app-brand-frame-mobile' : ''}`}
    >
      <img className="app-brand-logo" src={brandLogo} alt="MeuNegocio360" />
    </span>
  )
}

function SearchMark() {
  return (
    <span className="app-search-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.4 15.4 4.2 4.2" />
      </svg>
    </span>
  )
}

function AppLayout() {
  const { user, signOut } = useAuth()
  const { empresa } = useEmpresa()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const companyName = empresa?.nomeFantasia || empresa?.razaoSocial
  const items = navigationItems.filter((item) =>
    item.profiles.includes(user?.perfil),
  )

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true, state: { logoutError: true } })
    } finally {
      setIsSigningOut(false)
    }
  }

  const menu = (
    <>
      <Nav className="app-navigation">
        {items.map((item) => (
          <Nav.Link
            as={NavLink}
            to={item.to}
            key={item.to}
            end={item.to === '/'}
          >
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
      <div className="app-account d-flex flex-column flex-lg-row align-items-lg-center gap-2 gap-lg-3">
        {companyName && <span className="fw-semibold">{companyName}</span>}
        <span>{user.nome}</span>
        <Button
          type="button"
          variant="outline-dark"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Saindo...' : 'Sair'}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-vh-100 bg-body">
      <Navbar
        expand="lg"
        variant="light"
        className="app-navbar"
        aria-label="Navegação principal"
      >
        <Container>
          <div className="app-mobile-navbar d-flex d-lg-none align-items-center w-100">
            <div className="app-mobile-navbar-side">
              <Navbar.Toggle
                aria-controls="app-navigation"
                aria-label="Abrir ou fechar menu"
              />
            </div>
            <Navbar.Brand
              as={Link}
              to="/"
              className="app-mobile-brand"
              aria-label="MeuNegocio360 — início"
            >
              <BrandMark compact />
            </Navbar.Brand>
            <div className="app-mobile-navbar-side d-flex justify-content-end">
              <SearchMark />
            </div>
          </div>

          <Navbar.Brand
            as={Link}
            to="/"
            className="d-none d-lg-flex me-4"
            aria-label="MeuNegocio360 — início"
          >
            <BrandMark />
          </Navbar.Brand>
          <Navbar.Collapse id="app-navigation">{menu}</Navbar.Collapse>
        </Container>
      </Navbar>

      <Outlet />
    </div>
  )
}

export default AppLayout
