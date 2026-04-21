import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const queryMode = new URLSearchParams(location.search).get('mode')
    if (queryMode === 'signup' || queryMode === 'login') {
      setMode(queryMode)
    }
  }, [location.search])

  useEffect(() => {
    if (user) {
      navigate('/test', { replace: true })
    }
  }, [user, navigate])

  const handleSignup = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(userCredential.user)
      await signOut(auth)
      setMessage({
        type: 'success',
        text: 'Account created. A verification email has been sent. Please verify your email before logging in.',
      })
      setEmail('')
      setPassword('')
      setMode('login')
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (!userCredential.user.emailVerified) {
        await signOut(auth)
        setMessage({
          type: 'error',
          text: 'Email not verified. Please check your inbox and verify your email first.',
        })
        return
      }
      setMessage({ type: 'success', text: `Logged in as ${userCredential.user.email}` })
      setEmail('')
      setPassword('')
      navigate('/test', { replace: true })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-heading">
          <h1>Welcome Back</h1>
          <p>Use your email and password to access your dashboard.</p>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Choose auth mode">
          <button
            className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-toggle-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
            type="button"
          >
            Signup
          </button>
        </div>

        <div className={`auth-flip-wrap ${mode === 'signup' ? 'flipped' : ''}`}>
          <div className="auth-flip-inner">
            <section className="auth-card auth-front" aria-hidden={mode === 'signup'}>
              <h2>Login</h2>
              <form onSubmit={handleLogin} className="auth-form">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />

                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                />

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Please wait...' : 'Login'}
                </button>
              </form>
            </section>

            <section className="auth-card auth-back" aria-hidden={mode === 'login'}>
              <h2>Create Account</h2>
              <form onSubmit={handleSignup} className="auth-form">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />

                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Please wait...' : 'Signup'}
                </button>
              </form>
            </section>
          </div>
        </div>

        {message.text ? (
          <p className={`auth-message ${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </p>
        ) : null}

        <p className="auth-footnote">
          Back to <Link to="/">home</Link>
        </p>
      </div>
    </div>
  )
}

export default Auth
