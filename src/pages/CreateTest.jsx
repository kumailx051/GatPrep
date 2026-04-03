import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CreateTest() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('paste')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Paste MCQs state
  const [mcqText, setMcqText] = useState('')
  const [answerKey, setAnswerKey] = useState('')
  const [sectionType, setSectionType] = useState('auto')
  
  // Video state
  const [videoUrl, setVideoUrl] = useState('')
  
  // PDF state
  const [pdfText, setPdfText] = useState('')
  
  // Test name
  const [testName, setTestName] = useState('')

  const tabs = [
    { id: 'paste', label: 'Paste MCQs', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    )},
    { id: 'video', label: 'Video to MCQs', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )},
    { id: 'pdf', label: 'PDF to MCQs', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )}
  ]

  const parseMCQs = (text, answers) => {
    const questions = []
    const lines = text.trim().split('\n').filter(line => line.trim())
    
    // Parse answer key
    const answerMap = {}
    const answerLines = answers.trim().split('\n').filter(line => line.trim())
    answerLines.forEach(line => {
      const match = line.match(/(\d+)[\s\-\.:]+([A-Da-d])/i)
      if (match) {
        answerMap[parseInt(match[1])] = match[2].toUpperCase()
      }
    })

    let currentQuestion = null
    let questionNum = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if this is a new question (starts with number)
      const questionMatch = line.match(/^(\d+)[\.\)\s]+(.+)/)
      if (questionMatch) {
        if (currentQuestion && currentQuestion.options.length === 4) {
          questions.push(currentQuestion)
        }
        questionNum = parseInt(questionMatch[1])
        currentQuestion = {
          id: questionNum,
          question: questionMatch[2].trim(),
          options: [],
          correct: 0,
          part: detectSection(questionMatch[2])
        }
        continue
      }

      // Check if this is an option
      const optionMatch = line.match(/^([A-Da-d])[\)\.\s]+(.+)/)
      if (optionMatch && currentQuestion) {
        currentQuestion.options.push(optionMatch[2].trim())
        
        // Set correct answer based on answer key
        const correctLetter = answerMap[questionNum]
        if (correctLetter) {
          const letterIndex = correctLetter.charCodeAt(0) - 65
          currentQuestion.correct = letterIndex
        }
      }
    }

    // Add last question
    if (currentQuestion && currentQuestion.options.length === 4) {
      questions.push(currentQuestion)
    }

    return questions
  }

  const detectSection = (text) => {
    const lowerText = text.toLowerCase()
    
    // English patterns
    if (lowerText.includes('synonym') || lowerText.includes('antonym') || 
        lowerText.includes('grammar') || lowerText.includes('vocabulary') ||
        lowerText.includes('sentence') || lowerText.includes('comprehension')) {
      return 'English'
    }
    
    // Quantitative patterns
    if (lowerText.includes('%') || lowerText.includes('ratio') || 
        lowerText.includes('average') || lowerText.includes('algebra') ||
        lowerText.includes('calculate') || lowerText.includes('percentage') ||
        /\d+\s*[\+\-\×\÷\*\/]\s*\d+/.test(lowerText)) {
      return 'Quantitative'
    }
    
    // Analytical patterns
    if (lowerText.includes('logic') || lowerText.includes('pattern') || 
        lowerText.includes('series') || lowerText.includes('reasoning') ||
        lowerText.includes('sequence') || lowerText.includes('direction')) {
      return 'Analytical'
    }
    
    return 'General'
  }

  const handlePasteMCQs = () => {
    setError('')
    setSuccess('')
    
    if (!mcqText.trim()) {
      setError('Please paste your MCQs')
      return
    }
    if (!answerKey.trim()) {
      setError('Please provide the answer key')
      return
    }
    if (!testName.trim()) {
      setError('Please enter a test name')
      return
    }

    setIsProcessing(true)

    try {
      const questions = parseMCQs(mcqText, answerKey)
      
      if (questions.length === 0) {
        setError('Could not parse any questions. Please check the format.')
        setIsProcessing(false)
        return
      }

      // Apply section type if not auto
      let targetCategory = sectionType
      if (sectionType === 'auto') {
        // Detect category from first question or majority
        const sectionCounts = { english: 0, quantitative: 0, analytical: 0 }
        questions.forEach(q => {
          const section = detectSection(q.question).toLowerCase()
          if (section === 'english') sectionCounts.english++
          else if (section === 'quantitative') sectionCounts.quantitative++
          else if (section === 'analytical') sectionCounts.analytical++
        })
        // Pick the majority section
        const maxSection = Object.entries(sectionCounts).reduce((a, b) => a[1] > b[1] ? a : b)
        targetCategory = maxSection[1] > 0 ? maxSection[0] : 'english'
      }
      
      // Update part names to be consistent
      questions.forEach(q => q.part = targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1))

      // Save to localStorage
      const customTests = JSON.parse(localStorage.getItem('customTests') || '[]')
      const newTest = {
        id: `custom-${Date.now()}`,
        name: testName,
        category: targetCategory,
        questions: questions,
        createdAt: new Date().toISOString(),
        questionCount: questions.length
      }
      customTests.push(newTest)
      localStorage.setItem('customTests', JSON.stringify(customTests))

      const categoryTitle = targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1)
      setSuccess(`Successfully created "${testName}" with ${questions.length} questions in ${categoryTitle}!`)
      setMcqText('')
      setAnswerKey('')
      setTestName('')
      
      setTimeout(() => {
        navigate(`/test/${targetCategory}`)
      }, 2000)
    } catch (err) {
      setError('Error processing MCQs. Please check the format.')
    }
    
    setIsProcessing(false)
  }

  const handleVideoToMCQs = () => {
    setError('')
    setSuccess('')
    
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL')
      return
    }
    if (!testName.trim()) {
      setError('Please enter a test name')
      return
    }

    // Note: This would require backend integration with YouTube API and AI
    setError('Video to MCQs feature requires backend AI integration. Coming soon!')
  }

  const handlePdfToMCQs = () => {
    setError('')
    setSuccess('')
    
    if (!pdfText.trim()) {
      setError('Please paste the PDF text content')
      return
    }
    if (!testName.trim()) {
      setError('Please enter a test name')
      return
    }

    // Note: This would require backend AI integration
    setError('PDF to MCQs feature requires backend AI integration. Coming soon!')
  }

  return (
    <div className="create-test-container">
      <div className="page-header">
        <h1 className="page-title">Create Test</h1>
        <p className="page-description">Generate MCQs from different sources</p>
      </div>

      <div className="create-test-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`create-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id)
              setError('')
              setSuccess('')
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {success}
        </div>
      )}

      <div className="create-test-content">
        {/* Common Test Name Input */}
        <div className="form-group">
          <label className="form-label">Test Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., English Practice Test 2"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>

        {/* Paste MCQs Tab */}
        {activeTab === 'paste' && (
          <div className="tab-content">
            <div className="tab-description">
              <h3>📋 Paste Your MCQs</h3>
              <p>Paste questions with options and provide the answer key separately.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Section Type</label>
              <select
                className="form-select"
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                <option value="English">English</option>
                <option value="Quantitative">Quantitative</option>
                <option value="Analytical">Analytical</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label className="form-label">MCQs Text</label>
                <textarea
                  className="form-textarea"
                  rows="12"
                  placeholder={`Paste your MCQs here in format:

1. What is the synonym of 'INTEGRITY'?
A) sadness
B) honesty
C) fear
D) doubt

2. If A > B and B > C, then?
A) A < C
B) A > C
C) A = C
D) None`}
                  value={mcqText}
                  onChange={(e) => setMcqText(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Answer Key</label>
                <textarea
                  className="form-textarea"
                  rows="12"
                  placeholder={`Paste answer key:

1-B
2-B
3-A
4-C
...`}
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="create-btn"
              onClick={handlePasteMCQs}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create Test
                </>
              )}
            </button>
          </div>
        )}

        {/* Video to MCQs Tab */}
        {activeTab === 'video' && (
          <div className="tab-content">
            <div className="tab-description">
              <h3>🎬 Video to MCQs</h3>
              <p>Enter a YouTube video URL to generate MCQs from its content.</p>
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Video URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Section Type</label>
              <select
                className="form-select"
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                <option value="English">English</option>
                <option value="Quantitative">Quantitative</option>
                <option value="Analytical">Analytical</option>
              </select>
            </div>

            <div className="auto-detect-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Number of questions will be automatically detected from video content</span>
            </div>

            <div className="coming-soon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Requires AI Backend Integration</span>
            </div>

            <button 
              className="create-btn"
              onClick={handleVideoToMCQs}
              disabled={isProcessing}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Generate from Video
            </button>
          </div>
        )}

        {/* PDF to MCQs Tab */}
        {activeTab === 'pdf' && (
          <div className="tab-content">
            <div className="tab-description">
              <h3>📄 PDF to MCQs</h3>
              <p>Paste text from a PDF document to generate MCQs.</p>
            </div>

            <div className="form-group">
              <label className="form-label">PDF Text Content</label>
              <textarea
                className="form-textarea"
                rows="10"
                placeholder="Paste the text content extracted from your PDF here..."
                value={pdfText}
                onChange={(e) => setPdfText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Section Type</label>
              <select
                className="form-select"
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                <option value="English">English</option>
                <option value="Quantitative">Quantitative</option>
                <option value="Analytical">Analytical</option>
              </select>
            </div>

            <div className="auto-detect-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Number of questions will be automatically detected from PDF content</span>
            </div>

            <div className="coming-soon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Requires AI Backend Integration</span>
            </div>

            <button 
              className="create-btn"
              onClick={handlePdfToMCQs}
              disabled={isProcessing}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Generate from PDF
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="create-instructions">
        <h3>📝 Format Instructions</h3>
        <div className="instructions-grid">
          <div className="instruction-card">
            <h4>MCQ Format</h4>
            <pre>{`1. Question text here?
A) Option A
B) Option B
C) Option C
D) Option D`}</pre>
          </div>
          <div className="instruction-card">
            <h4>Answer Key Format</h4>
            <pre>{`1-B
2-A
3-C
4-D`}</pre>
          </div>
        </div>
      </div>

      {/* AI Prompt Template */}
      <div className="ai-prompt-section">
        <div className="ai-prompt-header">
          <h3>🤖 AI Prompt Template</h3>
          <p>Copy this prompt and use it with ChatGPT, Claude, or any AI to generate MCQs in the correct format</p>
        </div>
        <div className="ai-prompt-box">
          <pre>{`Generate [NUMBER] MCQs for GAT [SECTION] preparation.

Topic: [YOUR TOPIC HERE]

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should be exam-style, not too easy
- Mix difficulty levels (easy, medium, hard)

Output Format (STRICT):
Questions should be numbered and formatted exactly like this:

1. Question text here?
A) First option
B) Second option
C) Third option
D) Fourth option

2. Next question here?
A) Option A
B) Option B
C) Option C
D) Option D

[Continue for all questions...]

After all questions, provide Answer Key in this exact format:

Answer Key:
1-B
2-A
3-C
4-D
[Continue for all answers...]

IMPORTANT:
- Do NOT add explanations
- Do NOT add extra text
- Follow the exact format above
- Answers must be A, B, C, or D only`}</pre>
          <button 
            className="copy-prompt-btn"
            onClick={() => {
              const prompt = `Generate [NUMBER] MCQs for GAT [SECTION] preparation.

Topic: [YOUR TOPIC HERE]

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should be exam-style, not too easy
- Mix difficulty levels (easy, medium, hard)

Output Format (STRICT):
Questions should be numbered and formatted exactly like this:

1. Question text here?
A) First option
B) Second option
C) Third option
D) Fourth option

2. Next question here?
A) Option A
B) Option B
C) Option C
D) Option D

[Continue for all questions...]

After all questions, provide Answer Key in this exact format:

Answer Key:
1-B
2-A
3-C
4-D
[Continue for all answers...]

IMPORTANT:
- Do NOT add explanations
- Do NOT add extra text
- Follow the exact format above
- Answers must be A, B, C, or D only`
              navigator.clipboard.writeText(prompt)
              alert('Prompt copied to clipboard!')
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy Prompt
          </button>
        </div>
        <div className="prompt-tips">
          <h4>💡 How to use:</h4>
          <ol>
            <li>Click "Copy Prompt" button above</li>
            <li>Paste it in ChatGPT, Claude, Gemini, or any AI</li>
            <li>Replace <code>[NUMBER]</code> with how many questions you want (e.g., 20)</li>
            <li>Replace <code>[SECTION]</code> with English, Quantitative, or Analytical</li>
            <li>Replace <code>[YOUR TOPIC HERE]</code> with specific topic (e.g., "Synonyms and Antonyms")</li>
            <li>Copy the AI's response and paste MCQs and Answer Key in the fields above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default CreateTest
