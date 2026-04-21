import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getCategoryTests,
  deleteUserCompletedTest,
  deleteUserCustomTest,
  getUserCompletedTests,
} from '../services/userData'

function CategoryTests() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [completedTests, setCompletedTests] = useState({})
  const [categoryTests, setCategoryTests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setLoadError('')
        const [completedResult, categoryTestsResult] = await Promise.allSettled([
          getUserCompletedTests(user.uid),
          getCategoryTests(user.uid, category),
        ])

        setCompletedTests(completedResult.status === 'fulfilled' ? completedResult.value : {})
        const testsValue = categoryTestsResult.status === 'fulfilled' ? categoryTestsResult.value : []
        setCategoryTests(Array.isArray(testsValue) ? testsValue : [])
      } catch (error) {
        console.error('Failed to load category tests:', error)
        setLoadError('Unable to load tests right now. Please refresh and try again.')
        setCompletedTests({})
        setCategoryTests([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [category, user])

  const getCategoryTitle = () => {
    if (!category) return 'Tests'
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getCategoryIcon = () => {
    switch (category) {
      case 'english':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'quantitative':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'analytical':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getTestResult = (testId) => {
    const key = testId
    return completedTests[key]
  }

  const handleStartTest = (testId) => {
    navigate(`/test/custom/${testId}`)
  }

  const handleRetakeTest = async (testId) => {
    const key = testId
    if (user) {
      await deleteUserCompletedTest(user.uid, key)
    }
    setCompletedTests((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
    
    navigate(`/test/custom/${testId}`)
  }

  const handleDeleteUserTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      if (user) {
        await deleteUserCustomTest(user.uid, testId)
        await deleteUserCompletedTest(user.uid, testId)
      }
      setCategoryTests((prev) => prev.filter((test) => test.id !== testId))
      setCompletedTests((prev) => {
        const updated = { ...prev }
        delete updated[testId]
        return updated
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const renderTestCard = (test) => {
    const result = getTestResult(test.id)
    const isCompleted = !!result
    const isUserTest = !!test.isUserTest
    const totalQuestions = Number.isInteger(test.questionCount)
      ? test.questionCount
      : Array.isArray(test.questions)
        ? test.questions.length
        : 0

    return (
      <div key={test.id} className={`test-card ${isCompleted ? 'completed' : ''}`}>
        <div className="test-card-header">
          <h3 className="test-card-title">{test.name}</h3>
          <div className="test-card-badges">
            {isUserTest && (
              <span className="user-test-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                User Created
              </span>
            )}
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
        </div>

        <div className="test-card-info">
          <span>{totalQuestions} Questions</span>
          <span>•</span>
          <span>{test.duration || '90 mins'}</span>
          {isUserTest && test.createdAt && (
            <>
              <span>•</span>
              <span>Created {formatDate(test.createdAt)}</span>
            </>
          )}
        </div>

        {isCompleted && (
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
          {isUserTest && (
            <button className="action-btn danger" onClick={() => handleDeleteUserTest(test.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </button>
          )}
          {isCompleted ? (
            <>
              <button className="action-btn secondary" onClick={() => handleRetakeTest(test.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                </svg>
                Retake
              </button>
              <button className="action-btn primary" onClick={() => navigate('/result', { state: result.fullResult })}>
                View Details
              </button>
            </>
          ) : (
            <button className="action-btn primary" onClick={() => handleStartTest(test.id)}>
              Start Test
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-loader">
        <p>Loading tests...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page-loader">
        <p>{loadError}</p>
        <button className="action-btn primary" onClick={() => navigate('/test')}>
          Back to Test Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="category-tests-container">
      <button className="back-btn" onClick={() => navigate('/test')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Categories
      </button>

      <div className="category-header">
        <div className={`category-icon-large ${category}`}>
          {getCategoryIcon()}
        </div>
        <h1 className="category-title-large">{getCategoryTitle()}</h1>
        <p className="category-description">Select a test to begin your practice</p>
      </div>

      <div className="tests-section">
        <h2 className="tests-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
           Tests
        </h2>
        <div className="tests-section-header">
          <button className="add-test-btn" onClick={() => navigate('/create-test')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Test
          </button>
        </div>
        
        {categoryTests.length === 0 ? (
          <div className="empty-user-tests">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No Firebase tests found for {getCategoryTitle()}</p>
            <button className="action-btn primary" onClick={() => navigate('/create-test')}>
              Create Your First Test
            </button>
          </div>
        ) : (
          <div className="tests-list">
            {categoryTests.map((test) => renderTestCard(test))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryTests
