import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserCustomTestsByCategory, saveUserCustomTest, getCategories } from '../services/userData'

function CreateTest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isNumbering, setIsNumbering] = useState(false)
  const [isAnswerNumbering, setIsAnswerNumbering] = useState(false)
  const [isAutoNaming, setIsAutoNaming] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Paste MCQs state
  const [mcqText, setMcqText] = useState('')
  const [answerKey, setAnswerKey] = useState('')
  const [sectionType, setSectionType] = useState('english')
  const [sectionOptions, setSectionOptions] = useState([
    { id: 'english', title: 'English' },
    { id: 'quantitative', title: 'Quantitative' },
    { id: 'analytical', title: 'Analytical' },
  ])
  
  // Test name
  const [testName, setTestName] = useState('')
  const [autoTestName, setAutoTestName] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState([])
  const lastFormattedValueRef = useRef('')
  const lastFormattedAnswerValueRef = useRef('')
  const testNameOverrideRef = useRef(false)

  const parseAnswerEntries = (text) => {
    const cleaned = text.replace(/\r/g, '').trim()
    if (!cleaned) return []

    const chunks = cleaned
      .split('\n')
      .flatMap((line) => line.split(/[\s,]+/))
      .map((entry) => entry.trim())
      .filter(Boolean)

    const entries = []
    chunks.forEach((entry) => {
      const numberedMatch = entry.match(/^(\d+)\s*[-.):]?\s*([A-Da-d])$/)
      if (numberedMatch) {
        entries.push({ number: parseInt(numberedMatch[1], 10), letter: numberedMatch[2].toUpperCase() })
        return
      }

      const letterOnlyMatch = entry.match(/^([A-Da-d])$/)
      if (letterOnlyMatch) {
        entries.push({ number: null, letter: letterOnlyMatch[1].toUpperCase() })
      }
    })

    return entries
  }

  const formatAnswerKeyWithNumbers = (text) => {
    const entries = parseAnswerEntries(text)
    if (!entries.length) return text

    const usedNumbers = new Set(entries.filter((entry) => entry.number !== null).map((entry) => entry.number))
    let nextNumber = usedNumbers.size ? Math.max(...usedNumbers) + 1 : 1

    const normalized = entries.map((entry, index) => {
      if (entry.number !== null) {
        return `${entry.number}-${entry.letter}`
      }

      while (usedNumbers.has(nextNumber)) {
        nextNumber += 1
      }
      const assignedNumber = nextNumber
      usedNumbers.add(assignedNumber)
      nextNumber += 1
      return `${assignedNumber}-${entry.letter}`
    })

    // If there were no explicit numbers at all, force strict 1..N mapping.
    const hasExplicitNumbers = entries.some((entry) => entry.number !== null)
    if (!hasExplicitNumbers) {
      return entries.map((entry, index) => `${index + 1}-${entry.letter}`).join('\n')
    }

    return normalized.join('\n')
  }

  const shouldFormatAnswerKeyText = (text) => {
    const entries = parseAnswerEntries(text)
    if (!entries.length) return false
    // Format if answer key has multiple entries on same line (inline format)
    // or if entries are not properly formatted
    const lineCount = text.trim().split('\n').length
    return entries.length > lineCount
  }

  const shouldFormatMcqText = (text) => {
    const rawText = text.trim()
    if (!rawText) return false

    // If already numbered, skip formatting to avoid repeated heavy processing.
    if (/^\s*\d+[\.)]\s+/m.test(rawText)) {
      return false
    }

    // Check for separate option lines (e.g., "A) option" on separate line)
    const optionCount = (rawText.match(/^\s*[A-Da-d][\)\.\s]+.+$/gm) || []).length
    if (optionCount >= 4) return true

    // Check for inline options (e.g., "question? A) opt B) opt C) opt D) opt" on same line)
    const optionMarkerPattern = /(^|\s)([A-Da-d])[\)\.\s]+/g
    const hasInlineOptions = rawText.split('\n').some((line) => {
      const matches = [...line.matchAll(optionMarkerPattern)]
      return matches.length >= 4
    })
    return hasInlineOptions
  }

  const formatMcqTextWithNumbers = (text) => {
    const rawText = text.trim()
    if (!rawText) return text

    const optionPattern = /^([A-Da-d])[\)\.\s]+(.+)/
    const optionMarkerPattern = /(^|\s)([A-Da-d])[\)\.\s]+/g

    const parseInlineQuestionLine = (line) => {
      const matches = [...line.matchAll(optionMarkerPattern)]
      if (matches.length < 4) return null

      const markers = matches.slice(0, 4)
      const questionText = line.slice(0, markers[0].index).trim().replace(/[\s:,-]+$/, '')
      if (!questionText) return null

      const options = markers.map((marker, index) => {
        const optionStart = marker.index + marker[0].length
        const nextMarker = markers[index + 1]
        const optionEnd = nextMarker ? nextMarker.index : line.length
        const optionText = line.slice(optionStart, optionEnd).trim().replace(/[\s:,-]+$/, '')
        return optionText
      })

      if (options.some((option) => !option)) return null
      return { questionText, options }
    }

    const isOptionLine = (line) => optionPattern.test(line.trim())

    const lines = rawText.split('\n')
    const formattedLines = []
    let questionNumber = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (!trimmed) {
        formattedLines.push('')
        continue
      }

      const inlineParsed = parseInlineQuestionLine(trimmed)
      if (!inlineParsed) {
        if (isOptionLine(trimmed)) {
          const match = trimmed.match(optionPattern)
          const letter = match[1].toUpperCase()
          const optionText = match[2].trim()
          formattedLines.push(`${letter}) ${optionText}`)
          continue
        }

        const nextLines = lines.slice(i + 1, i + 5).map((nextLine) => nextLine.trim()).filter(Boolean)
        const sequentialOptions = nextLines.length === 4 && nextLines.every((nextLine) => isOptionLine(nextLine))
        if (sequentialOptions) {
          const numberedMatch = trimmed.match(/^\d+[\.\)\s]+(.+)/)
          const questionText = numberedMatch ? numberedMatch[1].trim() : trimmed
          formattedLines.push(`${questionNumber}. ${questionText}`)
          nextLines.forEach((optionLine) => {
            const match = optionLine.match(optionPattern)
            const letter = match[1].toUpperCase()
            const optionText = match[2].trim()
            formattedLines.push(`${letter}) ${optionText}`)
          })
          formattedLines.push('')
          questionNumber += 1
          i += 4
          continue
        }

        formattedLines.push(trimmed)
        continue
      }

      formattedLines.push(`${questionNumber}. ${inlineParsed.questionText}`)
      inlineParsed.options.forEach((optionText, optionIndex) => {
        formattedLines.push(`${String.fromCharCode(65 + optionIndex)}) ${optionText}`)
      })
      formattedLines.push('')
      questionNumber += 1
    }

    return formattedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  const getSectionDisplayName = (section) => {
    const normalized = (section || '').toLowerCase().trim()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const getNextTestNameForSection = async (section) => {
    if (!user) {
      return `${getSectionDisplayName(section)} Test 1`
    }

    const tests = await getUserCustomTestsByCategory(user.uid, section)
    const prefix = `${getSectionDisplayName(section)} Test `
    const numbers = tests
      .map((test) => {
        const match = (test.name || '').match(new RegExp(`^${getSectionDisplayName(section)} Test\\s+(\\d+)$`, 'i'))
        return match ? parseInt(match[1], 10) : null
      })
      .filter((value) => Number.isInteger(value))

    const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1
    return `${prefix}${nextNumber}`
  }

  const syncAutoTestName = async (section, shouldForce = false) => {
    if (!shouldForce && testNameOverrideRef.current) {
      return
    }

    setIsAutoNaming(true)
    try {
      const nextName = await getNextTestNameForSection(section)
      setAutoTestName(nextName)
      setTestName(nextName)
      testNameOverrideRef.current = false
    } finally {
      setIsAutoNaming(false)
    }
  }

  const parseMCQs = (text, answers) => {
    const questions = []
    const rawText = text.trim()
    
    console.log('=== PARSING MCQs ===')
    console.log('Raw text preview:', rawText.slice(0, 200))
    console.log('Answer key preview:', answers.slice(0, 100))
    
    // Parse answer key
    const answerMap = {}
    const normalizedAnswerText = formatAnswerKeyWithNumbers(answers)
    console.log('Normalized answers:', normalizedAnswerText.slice(0, 100))
    
    const answerLines = normalizedAnswerText.trim().split('\n').filter((line) => line.trim())
    console.log('Answer lines:', answerLines)
    
    answerLines.forEach((line) => {
      const match = line.match(/(\d+)[\s\-\.:]+([A-Da-d])/i)
      if (match) {
        answerMap[parseInt(match[1], 10)] = match[2].toUpperCase()
      }
    })
    
    console.log('Answer map:', answerMap)

    const optionPattern = /^([A-Da-d])[\)\.\s]+(.+)/
    const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean)
    console.log('Total lines to parse:', lines.length)
    console.log('First 5 lines:', lines.slice(0, 5))
    
    let currentQuestion = null
    let questionNum = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      const questionMatch = line.match(/^(\d+)[\.\)\s]+(.+)/)
      if (questionMatch) {
        if (currentQuestion && currentQuestion.options.length === 4) {
          questions.push(currentQuestion)
          console.log('Pushed question:', currentQuestion.id)
        }

        questionNum = parseInt(questionMatch[1], 10)
        currentQuestion = {
          id: questionNum,
          question: questionMatch[2].trim(),
          options: [],
          correct: 0,
          part: detectSection(questionMatch[2]),
        }
        console.log('Found question:', questionNum, currentQuestion.question.slice(0, 50))
        continue
      }

      const optionMatch = line.match(optionPattern)
      if (optionMatch && currentQuestion) {
        currentQuestion.options.push(optionMatch[2].trim())
        const correctLetter = answerMap[currentQuestion.id]
        if (correctLetter) {
          currentQuestion.correct = correctLetter.charCodeAt(0) - 65
        }

        if (currentQuestion.options.length === 4) {
          questions.push(currentQuestion)
          console.log('Pushed question with all options:', currentQuestion.id)
          currentQuestion = null
        }
      }
    }

    if (currentQuestion && currentQuestion.options.length === 4) {
      questions.push(currentQuestion)
      console.log('Pushed final question:', currentQuestion.id)
    }

    console.log('After first pass:', questions.length, 'questions')

    // Fallback for pasted MCQs written as consecutive question + 4 option lines.
    if (questions.length === 0) {
      console.log('Trying sequential fallback parsing...')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const questionMatch = line.match(/^(\d+)[\.\)\s]+(.+)/)
        const questionText = questionMatch ? questionMatch[2].trim() : line

        if (optionPattern.test(line)) {
          continue
        }

        const optionBlock = lines.slice(i + 1, i + 5)
        if (optionBlock.length < 4 || !optionBlock.every((optionLine) => optionPattern.test(optionLine))) {
          continue
        }

        const parsedOptions = optionBlock.map((optionLine) => optionLine.match(optionPattern)[2].trim())
        const questionId = questions.length + 1
        const question = {
          id: questionId,
          question: questionText,
          options: parsedOptions,
          correct: 0,
          part: detectSection(questionText),
        }

        const correctLetter = answerMap[questionId]
        if (correctLetter) {
          question.correct = correctLetter.charCodeAt(0) - 65
        }

        questions.push(question)
        console.log('Sequential fallback parsed question:', questionId)
        i += 4
      }

      console.log('After sequential fallback:', questions.length, 'questions')
    }

    console.log('=== FINAL RESULT ===')
    console.log('Total questions parsed:', questions.length)
    return questions
  }

  const handlePreviewSplit = () => {
    setError('')
    setSuccess('')
    try {
      const questions = parseMCQs(mcqText, answerKey)
      if (!questions || !questions.length) {
        setError('Could not parse any questions. Please check format.')
        return
      }
      // Normalize options as array of 4 strings and ensure fields
      const normalized = questions.map((q, idx) => ({
        id: q.id || idx + 1,
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options.slice(0, 4).concat(Array(4 - (q.options || []).length).fill('')) : ['', '', '', ''],
        correct: Number.isInteger(q.correct) ? q.correct : 0,
        part: q.part || ''
      }))
      setParsedQuestions(normalized)
    } catch (err) {
      console.error('Preview parse failed:', err)
      setError('Failed to parse MCQs. See console for details.')
    }
  }

  const updateParsedQuestion = (index, field, value) => {
    setParsedQuestions((prev) => {
      const copy = prev.map((p) => ({ ...p }))
      if (!copy[index]) return prev
      if (field === 'question') copy[index].question = value
      if (field === 'part') copy[index].part = value
      return copy
    })
  }

  const updateParsedOption = (qIndex, optIndex, value) => {
    setParsedQuestions((prev) => {
      const copy = prev.map((p) => ({ ...p, options: [...p.options] }))
      if (!copy[qIndex]) return prev
      copy[qIndex].options[optIndex] = value
      return copy
    })
  }

  const updateParsedCorrect = (qIndex, value) => {
    setParsedQuestions((prev) => {
      const copy = prev.map((p) => ({ ...p }))
      if (!copy[qIndex]) return prev
      copy[qIndex].correct = Number(value)
      return copy
    })
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

  const handlePasteMCQs = async () => {
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
      console.log('=== CREATE TEST START ===')
      console.log('User:', user?.uid)
      console.log('MCQ text length:', mcqText.length)
      console.log('Answer key length:', answerKey.length)
      
      const questions = parsedQuestions.length ? parsedQuestions.map((q) => ({ id: q.id, question: q.question, options: q.options, correct: q.correct, part: q.part })) : parseMCQs(mcqText, answerKey)
      console.log('Parsed questions:', questions.length)
      if (questions.length > 0) {
        console.log('First question:', questions[0])
      }
      
      if (questions.length === 0) {
        setError('Could not parse any questions. Please check the format.')
        setIsProcessing(false)
        return
      }

      // Apply selected section type
      let targetCategory = sectionType.toLowerCase().trim()
      
      // Update part names to be consistent
      questions.forEach(q => q.part = targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1))

      if (!user) {
        setError('You must be logged in to create a test.')
        setIsProcessing(false)
        return
      }

      const newTest = {
        id: `custom-${Date.now()}`,
        name: testName,
        category: targetCategory,
        questions: questions.map((q, idx) => ({ id: `q-${idx+1}`, question: q.question, options: q.options, correct: q.correct })),
        createdAt: new Date().toISOString(),
        questionCount: questions.length,
      }

      console.log('Saving test to Firebase:', newTest.id)
      console.log('Test payload:', newTest)
      
      await saveUserCustomTest(user.uid, newTest)

      console.log('✓ Test saved successfully')
      const categoryTitle = targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1)
      setSuccess(`Successfully created "${testName}" with ${questions.length} questions in ${categoryTitle}!`)
      setMcqText('')
      setAnswerKey('')
      setTestName('')
      
      setTimeout(() => {
        navigate('/test')
      }, 2000)
    } catch (err) {
      console.error('=== CREATE TEST ERROR ===')
      console.error('Error object:', err)
      console.error('Error code:', err?.code)
      console.error('Error message:', err?.message)
      console.error('Full stack:', err?.stack)
      
      const code = err?.code || ''
      if (code === 'permission-denied' || code === 'PERMISSION_DENIED') {
        setError('Permission denied. Check Firestore rules allow writes to users/{uid}/customTests.')
      } else if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'DEADLINE_EXCEEDED') {
        setError('Firebase timeout. Check internet and try again.')
      } else if (err?.message?.includes('timed out')) {
        setError('Save timed out. Your internet may be slow. Try again.')
      } else {
        setError(err?.message ? `Error: ${err.message}` : 'Error saving test. Try again.')
      }
    }
    
    setIsProcessing(false)
  }

  const handleMcqBlur = () => {
    return
  }

  const handleFormatMcqs = () => {
    if (!shouldFormatMcqText(mcqText)) {
      setError('Paste MCQs in inline format with 4 options per question, then click Format MCQs.')
      return
    }
    if (mcqText === lastFormattedValueRef.current && answerKey === lastFormattedAnswerValueRef.current) {
      return
    }

    const sourceText = mcqText
    const sourceAnswerKey = answerKey
    const startedAt = Date.now()
    setError('')
    setIsNumbering(true)

    // Defer heavy formatting so the loading bar can paint first.
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Format MCQs
        const formatted = formatMcqTextWithNumbers(sourceText)
        if (formatted !== sourceText) {
          lastFormattedValueRef.current = formatted
          setMcqText(formatted)
        }
        
        // Also format answer key if it needs formatting
        if (shouldFormatAnswerKeyText(sourceAnswerKey)) {
          const formattedAnswerKey = formatAnswerKeyWithNumbers(sourceAnswerKey)
          if (formattedAnswerKey !== sourceAnswerKey) {
            lastFormattedAnswerValueRef.current = formattedAnswerKey
            setAnswerKey(formattedAnswerKey)
          }
        }
        
        const elapsed = Date.now() - startedAt
        const minimumVisibleMs = 600
        const remaining = Math.max(0, minimumVisibleMs - elapsed)
        setTimeout(() => setIsNumbering(false), remaining)
      }, 0)
    })
  }

  const handleAnswerKeyBlur = () => {
    if (!shouldFormatAnswerKeyText(answerKey)) {
      return
    }
    if (answerKey === lastFormattedAnswerValueRef.current) {
      return
    }

    const sourceText = answerKey
    const startedAt = Date.now()
    setIsAnswerNumbering(true)

    requestAnimationFrame(() => {
      setTimeout(() => {
        const formatted = formatAnswerKeyWithNumbers(sourceText)
        if (formatted !== sourceText) {
          lastFormattedAnswerValueRef.current = formatted
          setAnswerKey(formatted)
        }
        const elapsed = Date.now() - startedAt
        const minimumVisibleMs = 600
        const remaining = Math.max(0, minimumVisibleMs - elapsed)
        setTimeout(() => setIsAnswerNumbering(false), remaining)
      }, 0)
    })
  }

  const handleSectionChange = async (value) => {
    setSectionType(value)
    testNameOverrideRef.current = false
    await syncAutoTestName(value, true)
  }

  const handleTestNameChange = (value) => {
    setTestName(value)
    testNameOverrideRef.current = value.trim() !== autoTestName.trim()
  }

  // Keep the default test name aligned with the selected section and existing Firebase tests.
  useEffect(() => {
    syncAutoTestName(sectionType, false)
  }, [sectionType, user])

  // Load categories from Firestore so dropdown reflects saved types
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const cats = await getCategories(user?.uid)
        console.log('[CreateTest] Fetched categories:', cats)
        if (!mounted) return
        const defaultCats = [
          { id: 'english', title: 'English' },
          { id: 'quantitative', title: 'Quantitative' },
          { id: 'analytical', title: 'Analytical' },
        ]

        const mergedMap = new Map()
        defaultCats.forEach((c) => mergedMap.set(c.id, c))
        (cats || []).forEach((c) => mergedMap.set(c.id, { id: c.id, title: c.title || (c.id.charAt(0).toUpperCase() + c.id.slice(1)) }))
        const merged = Array.from(mergedMap.values())
        console.log('[CreateTest] Merged categories:', merged)
        if (merged.length) {
          setSectionOptions(merged)
          if (!merged.find((c) => c.id === sectionType)) {
            setSectionType(merged[0].id)
          }
        }
      } catch (err) {
        console.error('[CreateTest] Failed to load categories:', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  return (
    <div className="create-test-container">
      <div className="page-header">
        <h1 className="page-title">Create Test</h1>
        <p className="page-description">Create MCQ tests by pasting questions and answer key</p>
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

      <div className="create-test-layout">
        <div className="create-test-content">
          <div className="form-group">
            <label className="form-label">Test Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., English Practice Test 2"
              value={testName}
              readOnly
              aria-readonly="true"
            />
            {isAutoNaming && (
              <div className="name-status-text">Setting next available test name...</div>
            )}
          </div>

          <div className="tab-content">
            <div className="tab-description">
              <h3>📋 Paste Your MCQs</h3>
              <p>Paste questions with options and provide the answer key separately.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Section Type</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={sectionType}
                  onChange={(e) => handleSectionChange(e.target.value)}
                >
                  {sectionOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.title || (opt.id.charAt(0).toUpperCase() + opt.id.slice(1))}
                    </option>
                  ))}
                </select>
              </div>
              
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label className="form-label">MCQs Text</label>
                {isNumbering && (
                  <div className="numbering-status">
                    <p>Assigning question numbers...</p>
                    <div className="numbering-progress-track">
                      <div className="numbering-progress-bar"></div>
                    </div>
                  </div>
                )}
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
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button type="button" className="action-btn secondary" onClick={handlePreviewSplit}>Preview / Split</button>
                  <button type="button" className="action-btn" onClick={() => { setParsedQuestions([]); setMcqText(''); setAnswerKey('') }}>Clear</button>
                  <button type="button" className="action-btn secondary" onClick={handleFormatMcqs}>Format MCQs</button>
                </div>
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Answer Key</label>
                {isAnswerNumbering && (
                  <div className="numbering-status">
                    <p>Assigning answer numbers...</p>
                    <div className="numbering-progress-track">
                      <div className="numbering-progress-bar"></div>
                    </div>
                  </div>
                )}
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
                  onBlur={handleAnswerKeyBlur}
                />
              </div>
            </div>

            {parsedQuestions.length > 0 && (
              <div className="parsed-questions-preview">
                <h4>Preview / Edit Parsed Questions</h4>
                {parsedQuestions.map((q, idx) => (
                  <div key={q.id} className="parsed-question-block">
                    <label className="form-label">{idx + 1}. Question</label>
                    <textarea className="form-textarea" rows={3} value={q.question} onChange={(e) => updateParsedQuestion(idx, 'question', e.target.value)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi}>
                          <label className="form-label">Option {String.fromCharCode(65 + oi)}</label>
                          <input className="form-input" value={opt} onChange={(e) => updateParsedOption(idx, oi, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <label className="form-label">Correct Answer</label>
                      <select value={q.correct} onChange={(e) => updateParsedCorrect(idx, e.target.value)} className="form-select">
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
            )}

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
        </div>

        <div className="ai-prompt-section">
        <div className="ai-prompt-header">
          <h3>🤖 AI Prompt Template</h3>
          <p>Use this prompt with ChatGPT, Claude, or any AI to generate MCQs in the correct format</p>
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
- Answers must be A, B, C, or D only
- Make sure MCQs are from real past GAT paper`}</pre>
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
- Answers must be A, B, C, or D only
- Make sure MCQs are from real past GAT paper`
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
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #eee' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>General MCQ Format (Detailed)</h4>
            <pre style={{ maxHeight: 220, overflow: 'auto', padding: 10, background: '#fff', borderRadius: 6, border: '1px solid #f2f0f8' }}>{`Use this detailed format when generating MCQs with an AI. Be strict with numbering, option letters, and the final answer key.

Guidelines:
- Create exactly [NUMBER] questions for the requested [SECTION].
- Each question must include exactly four options labeled A) B) C) D).
- Do NOT include any explanations, footnotes, or extra commentary.
- Use exam-style language and vary difficulty across questions.
- Keep questions self-contained; do not reference external passages.

Strict Output Example (exact formatting required):

1. A man invests $1000 at 5% simple interest per annum. What is the interest earned in 2 years?
A) $100
B) $150
C) $200
D) $250

2. Choose the synonym of 'aberration' in the following options.
A) Normality
B) Anomaly
C) Routine
D) Regularity

Answer Key:
1-C
2-B

Answer Key Rules:
- Provide the final answer key after all questions exactly in the form shown above: one entry per line using 'number-letter' (e.g., 1-A).
- Letters must be uppercase A-D.

Deliverable Requirements:
- Start the response with the numbered questions only.
- After completing all questions, append the 'Answer Key:' section with each mapping on a new line.

Do NOT output anything else.`}</pre>
            <div style={{ marginTop: 8 }}>
              <button
                className="copy-prompt-btn"
                onClick={() => {
                  const detailedPrompt = `Use this detailed format when generating MCQs with an AI. Be strict with numbering, option letters, and the final answer key.

Guidelines:
- Create exactly [NUMBER] questions for the requested [SECTION].
- Each question must include exactly four options labeled A) B) C) D).
- Do NOT include any explanations, footnotes, or extra commentary.
- Use exam-style language and vary difficulty across questions.
- Keep questions self-contained; do not reference external passages.

Strict Output Example (exact formatting required):

1. A man invests $1000 at 5% simple interest per annum. What is the interest earned in 2 years?
A) $100
B) $150
C) $200
D) $250

2. Choose the synonym of 'aberration' in the following options.
A) Normality
B) Anomaly
C) Routine
D) Regularity

Answer Key:
1-C
2-B

Answer Key Rules:
- Provide the final answer key after all questions exactly in the form shown above: one entry per line using 'number-letter' (e.g., 1-A).
- Letters must be uppercase A-D.

Deliverable Requirements:
- Start the response with the numbered questions only.
- After completing all questions, append the 'Answer Key:' section with each mapping on a new line.

Do NOT output anything else.`
                  navigator.clipboard.writeText(detailedPrompt)
                  alert('Detailed prompt copied to clipboard!')
                }}
              >
                Copy Detailed Format
              </button>
            </div>
          </div>
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
    </div>
  )
}

export default CreateTest
