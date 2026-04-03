import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Test() {
  const navigate = useNavigate()
  const [completedTests, setCompletedTests] = useState({})
  const [userTestCounts, setUserTestCounts] = useState({ english: 0, quantitative: 0, analytical: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('completedTests')
    if (saved) {
      setCompletedTests(JSON.parse(saved))
    }
    
    const customTests = JSON.parse(localStorage.getItem('customTests') || '[]')
    const counts = { english: 0, quantitative: 0, analytical: 0 }
    customTests.forEach(test => {
      if (counts[test.category] !== undefined) {
        counts[test.category]++
      }
    })
    setUserTestCounts(counts)
  }, [])

  const testCategories = [
    {
      id: 'english',
      title: 'English',
      description: 'Synonyms, Antonyms, Analogies & Sentence Completion',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      totalTests: 1
    },
    {
      id: 'quantitative',
      title: 'Quantitative',
      description: 'Arithmetic, Algebra, Geometry & Data Interpretation',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      totalTests: 1
    },
    {
      id: 'analytical',
      title: 'Analytical',
      description: 'Logical Reasoning, Patterns & Critical Thinking',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      totalTests: 1
    }
  ]

  const getCompletedCount = (categoryId) => {
    return Object.keys(completedTests).filter(key => key.startsWith(categoryId) || key.startsWith(`custom-`) && completedTests[key]?.category === categoryId).length
  }

  const getTotalTests = (category) => {
    return category.totalTests + (userTestCounts[category.id] || 0)
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/test/${categoryId}`)
  }

  return (
    <div className="test-container">
      <div className="page-header">
        <h1 className="page-title">Mock Tests</h1>
        <p className="page-description">Select a category to view available tests</p>
      </div>

      <div className="test-categories">
        {testCategories.map((category) => {
          const completedCount = getCompletedCount(category.id)
          const totalTests = getTotalTests(category)
          const userCount = userTestCounts[category.id] || 0
          
          return (
            <div 
              key={category.id} 
              className="test-category-card clickable"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="test-category-header">
                <div className={`test-category-icon ${category.id}`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="test-category-title">{category.title}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>{category.description}</p>
                </div>
              </div>

              <div className="category-stats">
                <div className="stat-item">
                  <span className="stat-number">{totalTests}</span>
                  <span className="stat-text">Total Tests</span>
                </div>
                {userCount > 0 && (
                  <div className="stat-item">
                    <span className="stat-number" style={{ color: '#4A90E2' }}>{userCount}</span>
                    <span className="stat-text">User Created</span>
                  </div>
                )}
                <div className="stat-item">
                  <span className="stat-number" style={{ color: completedCount > 0 ? '#48BB78' : '#A0AEC0' }}>{completedCount}</span>
                  <span className="stat-text">Completed</span>
                </div>
              </div>

              <div className="category-action">
                <span>View Tests</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Test
