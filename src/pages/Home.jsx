import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const categories = [
    {
      id: 'english',
      title: 'English',
      description: 'Master vocabulary, grammar, reading comprehension, and verbal reasoning skills.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'quantitative',
      title: 'Quantitative',
      description: 'Sharpen your mathematical abilities with arithmetic, algebra, and data interpretation.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'analytical',
      title: 'Analytical',
      description: 'Develop logical reasoning, critical thinking, and problem-solving skills.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ]

  const handleCardClick = (categoryId) => {
    navigate(`/test/${categoryId}`)
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Prepare for GAT General</h1>
      <p className="home-subtitle">Choose a section to start your mock test</p>
      
      <div className="cards-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${category.id}`}
            onClick={() => handleCardClick(category.id)}
          >
            <div className="card-icon">
              {category.icon}
            </div>
            <h2 className="card-title">{category.title}</h2>
            <p className="card-description">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
