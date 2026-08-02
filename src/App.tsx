import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext'
import { RequireAuth } from './modules/auth/RequireAuth'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './modules/home/HomePage'
import { MessagesPage } from './modules/messages/MessagesPage'
import { MoodPage } from './modules/mood/MoodPage'
import { CounterPage } from './modules/counter/CounterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RequireAuth>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/counter" element={<CounterPage />} />
            </Routes>
          </AppLayout>
        </RequireAuth>
      </BrowserRouter>
    </AuthProvider>
  )
}
