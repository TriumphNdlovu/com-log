import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const isActivePath = (path: string) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 rounded-2xl
      ${scrolled 
        ? 'bg-transparent-bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-white/10' 
        : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold textover hover:to-purple-600 transition-all"
          >
            ~Commit log~
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex text-xl font-bold items-center space-x-8">
             
            {[
             //  { path: '/', label: 'home' },
              { path: '/about', label: 'me' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-1 py-2 font-bold transition-colors
                  ${isActivePath(path) 
                    ? 'text-brown-400' 
                    : 'text-brown-400 hover:text-white'}
                  group`}
              >
                {label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform origin-left scale-x-0 transition-transform duration-300
                  ${isActivePath(path) ? 'scale-x-100' : 'group-hover:scale-x-100'}`} 
                />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
        ${menuOpen ? 'max-h-56' : 'max-h-0'}`}>
        <div className="bg-slate-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-2">
          {[
            // { path: '/', label: 'Home' },
            { path: '/about', label: 'me' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={toggleMenu}
              className={`block py-3 px-4 rounded-lg transition-colors
                ${isActivePath(path)
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}