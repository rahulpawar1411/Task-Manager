import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AssignPage from './pages/AssignPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ActivitiesPage />} />
            <Route path="/assign" element={<AssignPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
