import { useNavigate } from 'react-router-dom'

function Preparation() {
  const navigate = useNavigate()

  const categories = [
    {
      id: 'english',
      title: 'Verbal Reasoning (English)',
      weight: '~50% weight',
      description: 'This checks your English understanding.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: '#4A90E2',
      topicsPreview: ['Synonyms & Antonyms', 'Analogies', 'Reading Comprehension', 'Grammar']
    },
    {
      id: 'quantitative',
      title: 'Quantitative Reasoning',
      weight: '~30% weight',
      description: 'Basic math (NOT very advanced).',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: '#9F7AEA',
      topicsPreview: ['Arithmetic', 'Algebra', 'Geometry', 'Data Interpretation']
    },
    {
      id: 'analytical',
      title: 'Analytical Reasoning',
      weight: '~20% weight',
      description: 'Logic-based questions.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: '#48BB78',
      topicsPreview: ['Logical Puzzles', 'Pattern Recognition', 'Coding-Decoding', 'Series']
    }
  ]

  return (
    <div className="preparation-container">
      <div className="page-header">
        <h1 className="page-title">Preparation Materials</h1>
        <p className="page-description">Comprehensive study materials for GAT General</p>
      </div>

      <div className="cards-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="prep-category-card"
            onClick={() => navigate(`/preparation/${category.id}`)}
            style={{ '--card-color': category.color }}
          >
            <div className="prep-card-header">
              <div className="prep-card-icon" style={{ background: category.color }}>
                {category.icon}
              </div>
              <span className="prep-card-weight">{category.weight}</span>
            </div>
            
            <h2 className="prep-card-title">{category.title}</h2>
            <p className="prep-card-description">{category.description}</p>
            
            <div className="prep-card-topics">
              {category.topicsPreview.map((topic, index) => (
                <span key={index} className="topic-tag">{topic}</span>
              ))}
            </div>

            <div className="prep-card-action">
              <span>View Topics</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Preparation
