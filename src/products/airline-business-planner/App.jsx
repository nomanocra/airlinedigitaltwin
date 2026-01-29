import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StudyPage from './pages/StudyPage'

function AirlineBusinessPlanner() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="study/:studyId" element={<StudyPage />} />
    </Routes>
  )
}

export default AirlineBusinessPlanner
