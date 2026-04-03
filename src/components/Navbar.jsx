import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14v7" />
          </svg>
          GAT Prep
        </Link>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/preparation" 
              className={`navbar-link ${isActive('/preparation') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Preparation
            </Link>
          </li>
          <li>
            <Link 
              to="/test" 
              className={`navbar-link ${isActive('/test') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Test
            </Link>
          </li>
          <li>
            <Link 
              to="/create-test" 
              className={`navbar-link ${isActive('/create-test') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Create Test
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
