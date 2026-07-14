import { useState } from 'react'
import Sidebar from './components/Sidebar'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import QuizPage from './pages/QuizPage'

function App() {
  const [page, setPage] = useState('upload')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-zinc-100">
      <Sidebar active={page} onNavigate={setPage} />

      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
        {page === 'upload' && <UploadPage />}
        {page === 'chat' && <ChatPage />}
        {page === 'quiz' && <QuizPage />}
      </main>
    </div>
  )
}

export default App
