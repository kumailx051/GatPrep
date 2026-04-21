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
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Progress from './pages/Progress'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preparation" element={<Preparation />} />
        <Route path="/preparation/:category" element={<PreparationDetail />} />
        <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
        <Route path="/test/:category" element={<ProtectedRoute><CategoryTests /></ProtectedRoute>} />
        <Route path="/test/custom/:testId" element={<ProtectedRoute><TestDetail /></ProtectedRoute>} />
        <Route path="/test/:category/:testId" element={<ProtectedRoute><TestDetail /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/create-test" element={<ProtectedRoute><CreateTest /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  )
}

export default App
