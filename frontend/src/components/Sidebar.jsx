import { UploadCloud, MessageSquare, ListChecks, Brain } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'upload', label: 'Upload', icon: UploadCloud },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'quiz', label: 'Quiz', icon: ListChecks },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col shrink-0 border-r border-zinc-800 bg-zinc-950 px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-100">Synapse</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active === id
                  ? 'bg-violet-600/15 text-violet-300'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-2 text-xs text-zinc-600">
          RAG-powered study assistant
        </div>
      </aside>

      {/* Mobile top bar + bottom nav */}
      <div className="md:hidden flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Brain size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold text-zinc-100">Synapse</span>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
              active === id ? 'text-violet-300' : 'text-zinc-500'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </>
  )
}
