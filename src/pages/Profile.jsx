import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase'

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A'

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/auth')
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar-large">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
        <h1>Profile</h1>
        <p className="profile-email">{user?.email}</p>

        <div className="profile-meta">
          <div className="profile-meta-item">
            <span className="label">Email Verified</span>
            <span className={`value ${user?.emailVerified ? 'yes' : 'no'}`}>
              {user?.emailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          <div className="profile-meta-item">
            <span className="label">Joined</span>
            <span className="value">{joinedDate}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="action-btn primary" onClick={() => navigate('/progress')}>
            View Progress
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/test')}>
            Go to Tests
          </button>
          <button className="action-btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
