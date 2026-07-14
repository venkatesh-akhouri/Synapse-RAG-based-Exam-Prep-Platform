const BASE_URL = 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ? JSON.stringify(body.detail) : detail
    } catch {
      // ignore parse errors, fall back to statusText
    }
    throw new ApiError(detail || `Request failed with status ${res.status}`, res.status)
  }
  return res.json()
}

export async function uploadFiles(files, onProgress) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/uploadfiles/`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      let body
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        body = null
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body)
      } else {
        reject(new ApiError(body?.detail ? JSON.stringify(body.detail) : `Upload failed (${xhr.status})`, xhr.status))
      }
    }

    xhr.onerror = () => reject(new ApiError('Network error — is the backend running at localhost:8000?', 0))

    xhr.send(formData)
  })
}

export async function sendChatMessage(message) {
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    return await handleResponse(res)
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Network error — is the backend running at localhost:8000?', 0)
  }
}

export async function generateQuiz({ topic, format, num_questions }) {
  try {
    const res = await fetch(`${BASE_URL}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, format, num_questions }),
    })
    return await handleResponse(res)
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Network error — is the backend running at localhost:8000?', 0)
  }
}

export { ApiError }
