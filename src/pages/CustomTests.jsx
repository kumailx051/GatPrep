import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function CustomTests() {
  const navigate = useNavigate()
  const [customTests, setCustomTests] = useState([])
  const [completedTests, setCompletedTests] = useState({})

  useEffect(() => {
    const tests = JSON.parse(localStorage.getItem('customTests') || '[]')
    setCustomTests(tests)
    
    const completed = JSON.parse(localStorage.getItem('completedTests') || '{}')
    setCompletedTests(completed)
  }, [])

  const handleStartTest = (testId) => {
    navigate(`/test/custom/${testId}`)
  }

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      const updated = customTests.filter(t => t.id !== testId)
      localStorage.setItem('customTests', JSON.stringify(updated))
      setCustomTests(updated)
    }
  }

  const getTestResult = (testId) => {
    return completedTests[`custom-${testId}`]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="category-tests-container">
      <button className="back-btn" onClick={() => navigate('/test')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Categories
      </button>

      <div className="category-header" style={{ background: 'linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)' }}>
        <div className="category-icon-large">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h1 className="category-title-large">Custom Tests</h1>
        <p className="category-description">Tests you created from pasted MCQs</p>
      </div>

      {customTests.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No Custom Tests Yet</h3>
          <p>Create your first test by pasting MCQs</p>
          <button className="action-btn primary" onClick={() => navigate('/create-test')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Test
          </button>
        </div>
      ) : (
        <div className="tests-list">
          {customTests.map((test) => {
            const result = getTestResult(test.id)
            const isCompleted = !!result

            return (
              <div key={test.id} className={`test-card ${isCompleted ? 'completed' : ''}`}>
                <div className="test-card-header">
                  <h3 className="test-card-title">{test.name}</h3>
                  {isCompleted && (
                    <span className="completed-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>

                <div className="test-card-info">
                  <span>{test.questionCount} Questions</span>
                  <span>•</span>
                  <span>Created {formatDate(test.createdAt)}</span>
                </div>

                {isCompleted && result && (
                  <div className="test-result-summary">
                    <div className="result-stats">
                      <div className="result-stat">
                        <span className="stat-value" style={{ color: '#48BB78' }}>{result.correct}</span>
                        <span className="stat-label">Correct</span>
                      </div>
                      <div className="result-stat">
                        <span className="stat-value" style={{ color: '#F56565' }}>{result.incorrect}</span>
                        <span className="stat-label">Wrong</span>
                      </div>
                      <div className="result-stat">
                        <span className="stat-value" style={{ color: '#A0AEC0' }}>{result.skipped}</span>
                        <span className="stat-label">Skipped</span>
                      </div>
                      <div className="result-stat">
                        <span className="stat-value score">{result.percentage}%</span>
                        <span className="stat-label">Score</span>
                      </div>
                    </div>
                    <div className={`result-badge ${result.passed ? 'pass' : 'fail'}`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                )}

                <div className="test-card-actions">
                  <button className="action-btn secondary" onClick={() => handleDeleteTest(test.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Delete
                  </button>
                  <button className="action-btn primary" onClick={() => handleStartTest(test.id)}>
                    {isCompleted ? 'Retake Test' : 'Start Test'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="create-more-cta">
        <button className="action-btn primary" onClick={() => navigate('/create-test')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Another Test
        </button>
      </div>
    </div>
  )
}

export default CustomTests
