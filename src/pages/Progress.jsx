import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserCompletedTests } from '../services/userData'

function Progress() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [completedTests, setCompletedTests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      const data = await getUserCompletedTests(user.uid)
      const sortedResults = Object.entries(data)
        .map(([key, value]) => ({ key, ...value }))
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))

      setCompletedTests(sortedResults)
      setIsLoading(false)
    }

    loadProgress()
  }, [user])

  const summary = useMemo(() => {
    if (!completedTests.length) {
      return { total: 0, avgScore: 0, passRate: 0 }
    }

    const total = completedTests.length
    const avgScore = Math.round(
      completedTests.reduce((sum, item) => sum + (item.percentage || 0), 0) / total,
    )
    const passCount = completedTests.filter((item) => item.passed).length
    const passRate = Math.round((passCount / total) * 100)

    return { total, avgScore, passRate }
  }, [completedTests])

  if (isLoading) {
    return (
      <div className="page-loader">
        <p>Loading progress...</p>
      </div>
    )
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Your Progress</h1>
        <p>Track scores, completion history, and consistency.</p>
      </div>

      <div className="progress-stats-grid">
        <div className="progress-stat-card">
          <h3>Total Tests</h3>
          <p>{summary.total}</p>
        </div>
        <div className="progress-stat-card">
          <h3>Average Score</h3>
          <p>{summary.avgScore}%</p>
        </div>
        <div className="progress-stat-card">
          <h3>Pass Rate</h3>
          <p>{summary.passRate}%</p>
        </div>
      </div>

      {completedTests.length === 0 ? (
        <div className="progress-empty">
          <p>No completed tests yet. Start a test to build your progress history.</p>
          <button className="action-btn primary" onClick={() => navigate('/test')}>
            Start Testing
          </button>
        </div>
      ) : (
        <div className="progress-list">
          {completedTests.map((item) => (
            <div key={item.key} className="progress-item-card">
              <div>
                <h3>{item.fullResult?.testName || item.key}</h3>
                <p>
                  {(item.category || 'general').charAt(0).toUpperCase() + (item.category || 'general').slice(1)} •{' '}
                  {new Date(item.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className={`progress-score-chip ${item.passed ? 'pass' : 'fail'}`}>
                {item.percentage}%
              </div>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/result', { state: item.fullResult })}
              >
                View Result
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Progress
