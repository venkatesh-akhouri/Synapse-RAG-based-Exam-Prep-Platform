import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { uploadFiles } from '../api/client'

const ACCEPTED_EXTENSIONS = ['.pdf', '.pptx', '.docx']
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function isAcceptedFile(file) {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext)) || ACCEPTED_MIME.includes(file.type)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [rejectedNames, setRejectedNames] = useState([])
  const inputRef = useRef(null)

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList)
    const accepted = incoming.filter(isAcceptedFile)
    const rejected = incoming.filter((f) => !isAcceptedFile(f))

    setRejectedNames(rejected.map((f) => f.name))
    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const deduped = accepted.filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
      return [...prev, ...deduped]
    })
    setStatus('idle')
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ''
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const reset = () => {
    setFiles([])
    setStatus('idle')
    setProgress(0)
    setErrorMessage('')
    setRejectedNames([])
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    try {
      await uploadFiles(files, setProgress)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Upload failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-100">Upload study materials</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Add PDF, PPTX, or DOCX files. Synapse will index them so you can chat and quiz yourself on the content.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          isDragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-zinc-700 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-950/70'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.pptx,.docx"
          className="hidden"
          onChange={handleFileInput}
        />
        <UploadCloud size={36} className="mb-3 text-zinc-500" />
        <p className="text-sm font-medium text-zinc-200">
          Drag and drop files here, or <span className="text-violet-400">browse</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">PDF, PPTX, DOCX &middot; multiple files supported</p>
      </div>

      {rejectedNames.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Skipped unsupported file{rejectedNames.length > 1 ? 's' : ''}: {rejectedNames.join(', ')}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
            >
              <FileText size={18} className="shrink-0 text-zinc-500" />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm text-zinc-200">{file.name}</p>
                <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
              </div>
              {status !== 'uploading' && (
                <button
                  onClick={() => removeFile(i)}
                  className="shrink-0 rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {status === 'uploading' && (
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Uploading and processing…
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={18} className="shrink-0" />
          {files.length} file{files.length !== 1 ? 's' : ''} processed successfully
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={18} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || status === 'uploading'}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {status === 'uploading' && <Loader2 size={16} className="animate-spin" />}
          {status === 'uploading' ? 'Uploading…' : 'Upload files'}
        </button>
        {files.length > 0 && status !== 'uploading' && (
          <button
            onClick={reset}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
