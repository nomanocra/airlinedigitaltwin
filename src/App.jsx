import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AirlineBusinessPlanner from './products/airline-business-planner/App'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/airline-business-planner/*" element={<AirlineBusinessPlanner />} />
    </Routes>
  )
}

export default App
