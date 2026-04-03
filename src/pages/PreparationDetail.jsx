import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function PreparationDetail() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const preparationData = {
    english: {
      title: 'Verbal Reasoning (English)',
      weight: '~50% weight',
      description: 'This section checks your English understanding and verbal skills.',
      color: '#4A90E2',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      topics: [
        {
          heading: 'Synonyms & Antonyms',
          points: [
            'Understanding words with similar meanings (synonyms)',
            'Understanding words with opposite meanings (antonyms)',
            'Building vocabulary through word pairs',
            'Context-based synonym/antonym identification',
            'Common GAT vocabulary words'
          ],
          tips: 'Practice 10-15 new words daily with their synonyms and antonyms.'
        },
        {
          heading: 'Analogies',
          points: [
            'Understanding word relationships',
            'Types: Part to Whole, Cause to Effect, Synonyms, Antonyms',
            'Worker to Tool relationships',
            'Category relationships',
            'Degree or intensity relationships'
          ],
          tips: 'Focus on identifying the relationship first, then find the matching pair.'
        },
        {
          heading: 'Sentence Completion',
          points: [
            'Preposition usage (in, on, at, by, with, of)',
            'Verb forms and tenses',
            'Conditional sentences',
            'Conjunctions and connectors',
            'Idiomatic expressions'
          ],
          tips: 'Read English newspapers and articles to improve natural language feel.'
        },
        {
          heading: 'Reading Comprehension',
          points: [
            'Main idea identification',
            'Supporting details extraction',
            'Inference and implications',
            'Author\'s tone and purpose',
            'Vocabulary in context'
          ],
          tips: 'Practice skimming and scanning techniques. Read the questions first.'
        },
        {
          heading: 'Critical Reasoning',
          points: [
            'Identifying arguments and conclusions',
            'Strengthening and weakening arguments',
            'Assumptions in reasoning',
            'Logical flaws identification',
            'Drawing valid conclusions'
          ],
          tips: 'Break down arguments into premise and conclusion.'
        },
        {
          heading: 'Vocabulary Building',
          points: [
            'Root words, prefixes, and suffixes',
            'Word origins (Latin, Greek)',
            'Commonly confused words',
            'One-word substitutions',
            'Idioms and phrases'
          ],
          tips: 'Learn word roots to guess meanings of unknown words.'
        },
        {
          heading: 'Grammar Basics',
          points: [
            'Subject-verb agreement',
            'Tense consistency',
            'Pronoun references',
            'Modifier placement',
            'Parallel structure'
          ],
          tips: 'Focus on the most common grammar rules tested in GAT.'
        },
        {
          heading: 'Sentence Correction',
          points: [
            'Identifying grammatical errors',
            'Correcting sentence structure',
            'Punctuation errors',
            'Word order issues',
            'Redundancy and wordiness'
          ],
          tips: 'Read the entire sentence before identifying the error.'
        }
      ]
    },
    quantitative: {
      title: 'Quantitative Reasoning',
      weight: '~30% weight',
      description: 'Basic math concepts and problem-solving skills.',
      color: '#9F7AEA',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      topics: [
        {
          heading: 'Arithmetic',
          points: [
            'Percentages and percentage change',
            'Ratios and proportions',
            'Averages (mean, median, mode)',
            'Fractions and decimals',
            'LCM and HCF'
          ],
          tips: 'Master percentage shortcuts: 10% = divide by 10, 5% = half of 10%.'
        },
        {
          heading: 'Algebra',
          points: [
            'Linear equations (one variable)',
            'Simultaneous equations',
            'Quadratic equations basics',
            'Inequalities',
            'Algebraic expressions'
          ],
          tips: 'Practice solving equations step by step. Check your answers by substitution.'
        },
        {
          heading: 'Word Problems',
          points: [
            'Age problems',
            'Work and time problems',
            'Mixture problems',
            'Partnership problems',
            'Translating words to equations'
          ],
          tips: 'Identify what is being asked, assign variables, form equations.'
        },
        {
          heading: 'Number Series',
          points: [
            'Arithmetic progressions',
            'Geometric progressions',
            'Mixed patterns',
            'Alternate patterns',
            'Square/cube series'
          ],
          tips: 'Look for differences between consecutive numbers first.'
        },
        {
          heading: 'Profit & Loss',
          points: [
            'Cost price, selling price, profit',
            'Profit and loss percentage',
            'Marked price and discount',
            'Successive discounts',
            'Break-even analysis'
          ],
          tips: 'Remember: Profit % = (Profit/CP) × 100'
        },
        {
          heading: 'Time & Work',
          points: [
            'Work done = Rate × Time',
            'Combined work problems',
            'Efficiency comparisons',
            'Pipes and cisterns',
            'Alternate day work'
          ],
          tips: 'Convert work to fractions: If A does in 10 days, A\'s 1 day work = 1/10'
        },
        {
          heading: 'Time, Speed & Distance',
          points: [
            'Speed = Distance / Time',
            'Average speed calculations',
            'Relative speed',
            'Trains and platforms',
            'Boats and streams'
          ],
          tips: 'Use consistent units. Convert km/hr to m/s by multiplying by 5/18.'
        },
        {
          heading: 'Basic Geometry',
          points: [
            'Area of triangles, rectangles, circles',
            'Perimeter calculations',
            'Properties of triangles',
            'Circle properties (radius, diameter)',
            'Volume basics'
          ],
          tips: 'Memorize key formulas: Area of circle = πr², Triangle = ½ × base × height'
        },
        {
          heading: 'Data Interpretation',
          points: [
            'Reading bar graphs',
            'Analyzing line charts',
            'Pie chart calculations',
            'Table data analysis',
            'Comparing data sets'
          ],
          tips: 'Read all labels and scales carefully before solving.'
        }
      ]
    },
    analytical: {
      title: 'Analytical Reasoning',
      weight: '~20% weight',
      description: 'Logic-based questions testing reasoning abilities.',
      color: '#48BB78',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      topics: [
        {
          heading: 'Logical Puzzles',
          points: [
            'Arrangement problems (linear, circular)',
            'Selection and grouping',
            'Comparison puzzles',
            'Conditional statements',
            'Multi-constraint problems'
          ],
          tips: 'Draw diagrams and use elimination method.'
        },
        {
          heading: 'Seating Arrangement',
          points: [
            'Linear seating (facing same/opposite)',
            'Circular seating',
            'Square/rectangular arrangements',
            'Multiple row arrangements',
            'Floor-based arrangements'
          ],
          tips: 'Start with fixed positions, then place others relative to them.'
        },
        {
          heading: 'Pattern Recognition',
          points: [
            'Number patterns',
            'Letter patterns',
            'Figure patterns',
            'Matrix patterns',
            'Symbol series'
          ],
          tips: 'Look for operations: add, subtract, multiply, divide, alternate.'
        },
        {
          heading: 'Blood Relations',
          points: [
            'Family tree construction',
            'Identifying relationships',
            'Generation gaps',
            'Coded relationships',
            'Mixed blood relations'
          ],
          tips: 'Draw family trees. Use M/F symbols for male/female.'
        },
        {
          heading: 'Series (Letters & Numbers)',
          points: [
            'Alphabet position values',
            'Letter jumping patterns',
            'Alphanumeric series',
            'Missing number in series',
            'Wrong number in series'
          ],
          tips: 'A=1, B=2... Z=26. Memorize positions of key letters.'
        },
        {
          heading: 'Direction Problems',
          points: [
            'Cardinal directions (N, S, E, W)',
            'Distance calculations',
            'Displacement vs distance',
            'Shadow-based directions',
            'Map reading'
          ],
          tips: 'Draw the path as you read. Use Pythagoras for displacement.'
        },
        {
          heading: 'Coding-Decoding',
          points: [
            'Letter shifting codes',
            'Reverse order codes',
            'Symbol substitution',
            'Positional codes',
            'Mixed coding patterns'
          ],
          tips: 'Find the pattern in given examples before decoding.'
        },
        {
          heading: 'Statement & Conclusion',
          points: [
            'Drawing logical conclusions',
            'Identifying valid inferences',
            'Statement and assumptions',
            'Cause and effect',
            'Course of action'
          ],
          tips: 'Conclusions must logically follow from statements only.'
        }
      ]
    }
  }

  const data = preparationData[category]

  if (!data) {
    return (
      <div className="preparation-detail-container">
        <div className="error-message">Category not found</div>
      </div>
    )
  }

  const filteredTopics = data.topics.filter(topic =>
    topic.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.points.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="preparation-detail-container">
      <button className="back-btn" onClick={() => navigate('/preparation')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Categories
      </button>

      <div className="prep-detail-header" style={{ background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}dd 100%)` }}>
        <div className="prep-detail-icon">
          {data.icon}
        </div>
        <div className="prep-detail-info">
          <span className="prep-weight-badge">{data.weight}</span>
          <h1 className="prep-detail-title">{data.title}</h1>
          <p className="prep-detail-description">{data.description}</p>
        </div>
      </div>

      <div className="search-container">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="topics-count">
        <span>{filteredTopics.length} Topics</span>
      </div>

      <div className="topics-grid">
        {filteredTopics.map((topic, index) => (
          <div key={index} className="topic-card">
            <div className="topic-card-header">
              <span className="topic-number">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="topic-card-title">{topic.heading}</h3>
            </div>
            
            <ul className="topic-points">
              {topic.points.map((point, pointIndex) => (
                <li key={pointIndex}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={data.color} strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            {topic.tips && (
              <div className="topic-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span><strong>Tip:</strong> {topic.tips}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="prep-cta">
        <h3>Ready to practice?</h3>
        <p>Test your knowledge with mock tests</p>
        <button className="cta-btn" onClick={() => navigate(`/test/${category}`)}>
          Take a Test
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PreparationDetail
