import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showReview, setShowReview] = useState(false)

  const { questions, answers, correct, incorrect, skipped, total, category, timeSpent } = location.state || {}

  if (!location.state) {
    return (
      <div className="result-container">
        <div className="result-card">
          <h2>No results available</h2>
          <p>Please complete a test first.</p>
          <button className="action-btn primary" onClick={() => navigate('/test')}>
            Go to Tests
          </button>
        </div>
      </div>
    )
  }

  const percentage = Math.round((correct / total) * 100)
  const passed = percentage >= 50

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getCategoryTitle = () => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className={`result-icon ${passed ? 'pass' : 'fail'}`}>
          {passed ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>

        <h1 className={`result-title ${passed ? 'pass' : 'fail'}`}>
          {passed ? 'Congratulations!' : 'Keep Practicing!'}
        </h1>
        <p style={{ color: '#718096', marginBottom: '0.5rem' }}>
          {getCategoryTitle()} Test Completed
        </p>
        
        <div className="result-score">{correct}/{total}</div>
        <div className="result-percentage">
          {percentage}% {passed ? '- Passed' : '- Not Passed'}
        </div>

        <div className="score-breakdown">
          <div className="score-item">
            <div className="score-label">Correct</div>
            <div className="score-value correct">{correct}</div>
          </div>
          <div className="score-item">
            <div className="score-label">Incorrect</div>
            <div className="score-value incorrect">{incorrect}</div>
          </div>
          <div className="score-item">
            <div className="score-label">Skipped</div>
            <div className="score-value skipped">{skipped}</div>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', color: '#718096' }}>
          Time spent: {formatTime(timeSpent)}
        </p>
      </div>

      <div className="result-actions">
        <button className="action-btn primary" onClick={() => navigate(`/test/${category}/test-1`)}>
          Retry Test
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/test')}>
          All Tests
        </button>
        <button 
          className="action-btn secondary" 
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? 'Hide Answers' : 'Review Answers'}
        </button>
      </div>

      {showReview && (
        <div className="review-section">
          <h2 className="review-title">Answer Review</h2>
          
          {questions.map((question, index) => {
            const userAnswer = answers[question.id]
            const isCorrect = userAnswer === question.correct
            const isSkipped = userAnswer === undefined

            return (
              <div key={question.id} className="question-card">
                <div className="question-number" style={{ 
                  color: isSkipped ? '#A0AEC0' : isCorrect ? '#48BB78' : '#F56565' 
                }}>
                  Question {index + 1} - {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                </div>
                <div className="question-text">{question.question}</div>
                <div className="options-list">
                  {question.options.map((option, optionIndex) => {
                    let className = 'option-item'
                    if (optionIndex === question.correct) {
                      className += ' correct'
                    } else if (optionIndex === userAnswer && userAnswer !== question.correct) {
                      className += ' incorrect'
                    }

                    return (
                      <div key={optionIndex} className={className}>
                        <span className="option-letter">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="option-text">
                          {option}
                          {optionIndex === question.correct && (
                            <span style={{ marginLeft: '0.5rem', color: '#48BB78', fontWeight: 500 }}>
                              ✓ Correct Answer
                            </span>
                          )}
                          {optionIndex === userAnswer && userAnswer !== question.correct && (
                            <span style={{ marginLeft: '0.5rem', color: '#F56565', fontWeight: 500 }}>
                              ✗ Your Answer
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Result
