import { useState } from 'react'
import {
  ListChecks,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { generateQuiz } from '../api/client'

const FORMATS = ['MCQ', 'True/False', 'Short/Long']

function optionLetter(option) {
  const match = option.match(/^([A-Za-z])[.)]/)
  return match ? match[1].toUpperCase() : option
}

function QuizQuestion({ question, index, total, onNext, isLast }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const isMCQ = Array.isArray(question.options) && question.options.length > 0
  const isTrueFalse = !isMCQ && /^(true|false)$/i.test(String(question.answer ?? ''))
  const hasAnswer = question.answer !== undefined && question.answer !== null && question.answer !== ''

  const handleSelect = (value) => {
    if (revealed) return
    setSelected(value)
    setRevealed(true)
  }

  const next = () => {
    setSelected(null)
    setRevealed(false)
    onNext()
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>
          Question {index + 1} of {total}
        </span>
      </div>

      <p className="text-base font-medium text-zinc-100">{question.question}</p>

      {isMCQ && (
        <div className="mt-5 space-y-2">
          {question.options.map((option) => {
            const letter = optionLetter(option)
            const isCorrect = letter === question.answer
            const isSelected = selected === letter

            let stateClasses = 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
            if (revealed) {
              if (isCorrect) stateClasses = 'border-emerald-500/50 bg-emerald-500/10'
              else if (isSelected) stateClasses = 'border-red-500/50 bg-red-500/10'
              else stateClasses = 'border-zinc-800 opacity-60'
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(letter)}
                disabled={revealed}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm text-zinc-200 transition-colors disabled:cursor-default ${stateClasses}`}
              >
                <span>{option}</span>
                {revealed && isCorrect && <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />}
                {revealed && isSelected && !isCorrect && <XCircle size={16} className="shrink-0 text-red-400" />}
              </button>
            )
          })}
        </div>
      )}

      {!isMCQ && isTrueFalse && (
        <div className="mt-5 flex gap-3">
          {['True', 'False'].map((option) => {
            const isCorrect = option.toLowerCase() === String(question.answer).toLowerCase()
            const isSelected = selected === option

            let stateClasses = 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
            if (revealed) {
              if (isCorrect) stateClasses = 'border-emerald-500/50 bg-emerald-500/10'
              else if (isSelected) stateClasses = 'border-red-500/50 bg-red-500/10'
              else stateClasses = 'border-zinc-800 opacity-60'
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={revealed}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium text-zinc-200 transition-colors disabled:cursor-default ${stateClasses}`}
              >
                {option}
                {revealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                {revealed && isSelected && !isCorrect && <XCircle size={16} className="text-red-400" />}
              </button>
            )
          })}
        </div>
      )}

      {!isMCQ && !isTrueFalse && (
        <div className="mt-5">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              {hasAnswer ? 'Show model answer' : 'Reveal question complete — think through your answer'}
            </button>
          ) : hasAnswer ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {question.answer}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              This is a free-response question — compare your answer against your notes.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!revealed}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {isLast ? 'Finish' : 'Next question'}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('MCQ')
  const [numQuestions, setNumQuestions] = useState(5)
  const [status, setStatus] = useState('idle') // idle | loading | ready | not-covered | error | done
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await generateQuiz({ topic: topic.trim(), format, num_questions: numQuestions })
      if (!res.questions || res.questions.length === 0) {
        setStatus('not-covered')
        return
      }
      setQuestions(res.questions)
      setCurrentIndex(0)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Failed to generate quiz. Please try again.')
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      setStatus('done')
    }
  }

  const startOver = () => {
    setStatus('idle')
    setQuestions([])
    setCurrentIndex(0)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-100">Quiz yourself</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Generate practice questions from your uploaded material to test your understanding.
      </p>

      {(status === 'idle' || status === 'loading' || status === 'error') && (
        <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Enter topic to quiz on</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, World War II, Big-O notation…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-32">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300"># Questions</label>
              <input
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || status === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating quiz…
              </>
            ) : (
              <>
                <ListChecks size={16} />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      )}

      {status === 'not-covered' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            This topic is not covered in your uploaded material
          </div>
          <button
            onClick={startOver}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw size={15} />
            Try a different topic
          </button>
        </div>
      )}

      {status === 'ready' && questions.length > 0 && (
        <div className="mt-6">
          <QuizQuestion
            key={currentIndex}
            question={questions[currentIndex]}
            index={currentIndex}
            total={questions.length}
            onNext={handleNext}
            isLast={currentIndex === questions.length - 1}
          />
        </div>
      )}

      {status === 'done' && (
        <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Quiz complete</h2>
          <p className="text-sm text-zinc-400">You went through all {questions.length} questions on "{topic}".</p>
          <button
            onClick={startOver}
            className="mx-auto flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            <RotateCcw size={15} />
            Start a new quiz
          </button>
        </div>
      )}
    </div>
  )
}
