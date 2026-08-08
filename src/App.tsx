import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext'
import { AuthGate } from './modules/auth/AuthGate'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './modules/home/HomePage'
import { MoodPage } from './modules/mood/MoodPage'
import { CounterPage } from './modules/counter/CounterPage'
import { MemoriesPage } from './modules/memories/MemoriesPage'
import { NewMemoryPage } from './modules/memories/NewMemoryPage'
import { MemoryDetailPage } from './modules/memories/MemoryDetailPage'
import { MapPage } from './modules/map/MapPage'
import { NoteComposerPage } from './modules/notes/NoteComposerPage'
import { RoomPage } from './modules/room/RoomPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/counter" element={<CounterPage />} />
              <Route path="/memories" element={<MemoriesPage />} />
              <Route path="/memories/new" element={<NewMemoryPage />} />
              <Route path="/memories/:id" element={<MemoryDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/notes/new" element={<NoteComposerPage />} />
              <Route path="/room" element={<RoomPage />} />
            </Routes>
          </AppLayout>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  )
}
