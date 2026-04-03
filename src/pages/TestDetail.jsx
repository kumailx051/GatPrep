import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuestionsByCategory } from '../data/questions'

function TestDetail() {
  const { category, testId } = useParams()
  const navigate = useNavigate()
  
  const [questions, setQuestions] = useState([])
  const [testName, setTestName] = useState('')
  const [testCategory, setTestCategory] = useState(category)
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showFeedback, setShowFeedback] = useState({}) // Track which questions show feedback
  const [timeLeft, setTimeLeft] = useState(90 * 60) // 90 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const questionsPerPage = 10
  const isCustomTest = category === 'custom'

  useEffect(() => {
    if (isCustomTest) {
      // Load custom test from localStorage by testId
      const customTests = JSON.parse(localStorage.getItem('customTests') || '[]')
      const customTest = customTests.find(t => t.id === testId)
      if (customTest) {
        setQuestions(customTest.questions)
        setTestName(customTest.name)
        setTestCategory(customTest.category)
      }
    } else {
      const allQuestions = getQuestionsByCategory(category)
      // Don't randomize for practice - keep original order
      setQuestions(allQuestions)
      setTestName(`${category.charAt(0).toUpperCase() + category.slice(1)} Test 1`)
      setTestCategory(category)
    }
  }, [category, testId, isCustomTest])

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId, optionIndex) => {
    // Only allow answer if not already answered
    if (answers[questionId] !== undefined) return
    
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }))
    
    // Show feedback for this question
    setShowFeedback((prev) => ({
      ...prev,
      [questionId]: true
    }))
  }

  const handleSubmit = useCallback(() => {
    setIsTimerRunning(false)
    
    // Calculate score
    let correct = 0
    let incorrect = 0
    let skipped = 0

    questions.forEach((q) => {
      if (answers[q.id] === undefined) {
        skipped++
      } else if (answers[q.id] === q.correct) {
        correct++
      } else {
        incorrect++
      }
    })

    const percentage = Math.round((correct / questions.length) * 100)
    const passed = percentage >= 50
    const timeSpent = 90 * 60 - timeLeft

    const resultData = {
      questions,
      answers,
      correct,
      incorrect,
      skipped,
      total: questions.length,
      category: testCategory,
      testName,
      timeSpent,
      percentage,
      passed,
      isCustomTest
    }

    // Save to localStorage with proper key
    const key = isCustomTest ? `custom-${testId}` : `${category}-${testId}`
    const completedTests = JSON.parse(localStorage.getItem('completedTests') || '{}')
    completedTests[key] = {
      correct,
      incorrect,
      skipped,
      percentage,
      passed,
      category: testCategory,
      completedAt: new Date().toISOString(),
      fullResult: resultData
    }
    localStorage.setItem('completedTests', JSON.stringify(completedTests))

    // Navigate to result page with state
    navigate('/result', {
      state: resultData
    })
  }, [questions, answers, timeLeft, category, testId, testCategory, testName, isCustomTest, navigate])

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the test? All answers will be cleared.')) {
      setAnswers({})
      setShowFeedback({})
      setCurrentPage(0)
      setTimeLeft(90 * 60)
      setIsTimerRunning(true)
    }
  }

  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  // Calculate current score
  const correctCount = Object.entries(answers).filter(
    ([id, ans]) => questions.find(q => q.id === parseInt(id))?.correct === ans
  ).length

  const getCategoryTitle = () => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Get part label for question
  const getPartLabel = (question) => {
    if (question.part) return question.part
    return ''
  }

  return (
    <div className="test-detail-container">
      <div className="test-header">
        <div className="test-info">
          <h1>{getCategoryTitle()} - Test 1</h1>
          <p className="progress-text">
            Question {currentPage * questionsPerPage + 1} - {Math.min((currentPage + 1) * questionsPerPage, questions.length)} of {questions.length}
          </p>
          <p className="progress-text">
            Answered: {answeredCount}/{questions.length} | 
            <span style={{ color: '#48BB78', marginLeft: '8px' }}>✓ {correctCount}</span>
            <span style={{ color: '#F56565', marginLeft: '8px' }}>✗ {answeredCount - correctCount}</span>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="questions-section">
        {currentQuestions.map((question, index) => {
          const questionNumber = currentPage * questionsPerPage + index + 1
          const userAnswer = answers[question.id]
          const hasAnswered = userAnswer !== undefined
          const isCorrect = hasAnswered && userAnswer === question.correct
          
          return (
            <div key={question.id} className="question-card">
              <div className="question-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Question {questionNumber} {question.part && <span style={{ color: '#718096', fontWeight: 400 }}>— {question.part}</span>}</span>
                {hasAnswered && (
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: isCorrect ? '#C6F6D5' : '#FED7D7',
                    color: isCorrect ? '#276749' : '#C53030'
                  }}>
                    {isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                )}
              </div>
              <div className="question-text">{question.question}</div>
              <div className="options-list">
                {question.options.map((option, optionIndex) => {
                  let className = 'option-item'
                  
                  if (hasAnswered && showFeedback[question.id]) {
                    if (optionIndex === question.correct) {
                      className += ' correct'
                    } else if (optionIndex === userAnswer && userAnswer !== question.correct) {
                      className += ' incorrect'
                    }
                  } else if (userAnswer === optionIndex) {
                    className += ' selected'
                  }

                  return (
                    <div
                      key={optionIndex}
                      className={className}
                      onClick={() => handleAnswer(question.id, optionIndex)}
                      style={{ cursor: hasAnswered ? 'not-allowed' : 'pointer' }}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="option-text">
                        {option}
                        {hasAnswered && showFeedback[question.id] && optionIndex === question.correct && (
                          <span style={{ marginLeft: '10px', color: '#276749', fontWeight: 500 }}>
                            ✓ Correct Answer
                          </span>
                        )}
                        {hasAnswered && showFeedback[question.id] && optionIndex === userAnswer && userAnswer !== question.correct && (
                          <span style={{ marginLeft: '10px', color: '#C53030', fontWeight: 500 }}>
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

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageStart = i * questionsPerPage
          const pageQuestions = questions.slice(pageStart, pageStart + questionsPerPage)
          const pageAnswered = pageQuestions.every((q) => answers[q.id] !== undefined)
          
          return (
            <button
              key={i}
              className={`page-btn ${currentPage === i ? 'active' : ''} ${pageAnswered ? 'answered' : ''}`}
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="navigation-buttons">
        <button
          className="nav-btn prev"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </button>

        <button className="reset-btn" onClick={handleReset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          Reset Test
        </button>

        {currentPage === totalPages - 1 ? (
          <button className="submit-btn" onClick={handleSubmit}>
            Submit Test
          </button>
        ) : (
          <button
            className="nav-btn next"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default TestDetail
