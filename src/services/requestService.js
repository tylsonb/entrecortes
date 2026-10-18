// La carrera asegura un límite incluso si el transporte tarda en atender la cancelación.
export async function withRequestTimeout(task, { signal, timeoutMs = 3000 } = {}) {
  const controller = new AbortController()
  let timer
  let abort
  const cancelled = new Promise((_, reject) => {
    abort = () => {
      controller.abort()
      reject(new Error('REQUEST_CANCELLED'))
    }
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error('REQUEST_TIMEOUT'))
    }, timeoutMs)
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
  try {
    return await Promise.race([cancelled, Promise.resolve().then(() => task(controller.signal))])
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
