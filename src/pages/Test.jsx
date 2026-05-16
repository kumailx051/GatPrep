import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategoryTests, getUserCompletedTests, getCategories, createCategory } from '../services/userData'

function Test() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [completedTests, setCompletedTests] = useState({})
  const [userTestCounts, setUserTestCounts] = useState({})
  const [totalTestCounts, setTotalTestCounts] = useState({})
  const [categories, setCategories] = useState([])
  const [showAddType, setShowAddType] = useState(false)
  const [newTypeTitle, setNewTypeTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const normalizeCategory = (value) => (value || '').toString().trim().toLowerCase()

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const [completedResult, categoriesResult] = await Promise.allSettled([
          getUserCompletedTests(user.uid),
          getCategories(user.uid),
        ])

        const remoteCompleted = completedResult.status === 'fulfilled' ? completedResult.value : {}
        const remoteCategories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []

        setCompletedTests(remoteCompleted)
        setCategories(remoteCategories.length ? remoteCategories : [
          { id: 'english', title: 'English', description: 'Synonyms, Antonyms, Analogies & Sentence Completion' },
          { id: 'quantitative', title: 'Quantitative', description: 'Arithmetic, Algebra, Geometry & Data Interpretation' },
          { id: 'analytical', title: 'Analytical', description: 'Logical Reasoning, Patterns & Critical Thinking' },
        ])

        // For each category compute counts
        const countsPromises = remoteCategories.map((cat) => getCategoryTests(user.uid, cat.id))
        // also include defaults if remoteCategories empty
        const useCats = remoteCategories.length ? remoteCategories : [
          { id: 'english' }, { id: 'quantitative' }, { id: 'analytical' }
        ]

        const results = await Promise.allSettled(useCats.map((c) => getCategoryTests(user.uid, c.id)))
        const allCounts = {}
        const ownerCounts = {}
        results.forEach((res, idx) => {
          const id = useCats[idx].id
          const tests = res.status === 'fulfilled' ? res.value : []
          allCounts[id] = tests.length
          ownerCounts[id] = tests.filter((t) => t.isUserTest).length
        })

        setTotalTestCounts(allCounts)
        setUserTestCounts(ownerCounts)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const testCategories = [
    ...categories.map((c) => ({
      id: c.id,
      title: c.title || (c.id.charAt(0).toUpperCase() + c.id.slice(1)),
      description: c.description || '',
      icon: null,
      totalTests: totalTestCounts[c.id] || 0,
    }))
  ]

  const getCompletedCount = (categoryId) => {
    return Object.keys(completedTests).filter(key => key.startsWith(categoryId) || key.startsWith(`custom-`) && completedTests[key]?.category === categoryId).length
  }

  const getTotalTests = (category) => {
    return totalTestCounts[category.id] || 0
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/test/${categoryId}`)
  }

  const handleCreateCategory = async () => {
    const raw = (newTypeTitle || '').trim()
    if (!raw) return
    const key = raw.toLowerCase().replace(/\s+/g, '-')
    try {
      await createCategory(key, raw, user?.uid || null)
      setNewTypeTitle('')
      setShowAddType(false)
      // reload categories
      const remote = await getCategories()
      setCategories(remote)
    } catch (err) {
      console.error('Failed to create category:', err)
      alert('Failed to create category. See console for details.')
    }
  }

  if (isLoading) {
    return (
      <div className="page-loader">
        <p>Loading your test dashboard...</p>
      </div>
    )
  }

  return (
    <div className="test-container">
      <div className="page-header">
        <h1 className="page-title">Mock Tests</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p className="page-description" style={{ margin: 0 }}>Select a category to view available tests</p>
          <div style={{ marginLeft: 12 }}>
            <button className="action-btn primary" onClick={() => setShowAddType((s) => !s)}>
              {showAddType ? 'Close' : 'Add Type'}
            </button>
          </div>
        </div>
        {showAddType && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="form-input"
              placeholder="New test type e.g., Verbal Reasoning"
              value={newTypeTitle}
              onChange={(e) => setNewTypeTitle(e.target.value)}
            />
            <button className="action-btn primary" onClick={handleCreateCategory}>Create</button>
          </div>
        )}
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
