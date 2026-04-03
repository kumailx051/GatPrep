import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Preparation from './pages/Preparation'
import PreparationDetail from './pages/PreparationDetail'
import Test from './pages/Test'
import CategoryTests from './pages/CategoryTests'
import TestDetail from './pages/TestDetail'
import Result from './pages/Result'
import CreateTest from './pages/CreateTest'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preparation" element={<Preparation />} />
        <Route path="/preparation/:category" element={<PreparationDetail />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/:category" element={<CategoryTests />} />
        <Route path="/test/custom/:testId" element={<TestDetail />} />
        <Route path="/test/:category/:testId" element={<TestDetail />} />
        <Route path="/result" element={<Result />} />
        <Route path="/create-test" element={<CreateTest />} />
      </Routes>
    </Router>
  )
}

export default App
