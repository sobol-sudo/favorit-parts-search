const API_URL = '/api/hsprice'
const API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001'
const TIMEOUT_MS = 15000

// Пользователю — понятный текст без кодов и технических деталей.
// Подробности для разработчика уходят в консоль.
const MESSAGES = {
  offline: 'Нет подключения к интернету. Проверьте соединение и попробуйте снова.',
  timeout: 'Сервис отвечает слишком долго. Попробуйте ещё раз.',
  quota: 'Слишком много запросов по этой позиции. Попробуйте через пару минут.',
  unavailable: 'Сервис поиска временно недоступен. Попробуйте чуть позже.',
}

class ApiError extends Error {
  constructor(kind, details) {
    super(MESSAGES[kind])
    this.name = 'ApiError'
    console.error('[parts-api]', kind, details)
  }
}

// Ошибки API приходят полем error, в том числе вместе с HTTP 403.
function errorKind(apiError) {
  if (/quota/i.test(apiError)) return 'quota'
  return 'unavailable' // неверный/пустой ключ и прочее — проблема на нашей стороне, не у пользователя
}

async function request(params, signal) {
  const query = new URLSearchParams({ key: API_KEY, ...params })
  // Отмена из UI (новый запрос) + таймаут, чтобы лоадер не крутился вечно.
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response
  try {
    response = await fetch(`${API_URL}?${query}`, { signal: combined })
  } catch (err) {
    if (timeout.aborted) throw new ApiError('timeout', err)
    if (err.name === 'AbortError') throw err
    throw new ApiError(navigator.onLine === false ? 'offline' : 'unavailable', err)
  }

  let data = null
  try {
    data = await response.json()
  } catch (err) {
    throw new ApiError('unavailable', { status: response.status, err })
  }

  if (data?.error) throw new ApiError(errorKind(data.error), { status: response.status, error: data.error })
  if (!response.ok) throw new ApiError('unavailable', { status: response.status, data })

  // Если деталь не найдена, API возвращает массив с одной пустой записью.
  return (data.goods || []).filter((item) => item.brand && item.number)
}

export function searchBrands(number, signal) {
  return request({ number }, signal)
}

export async function searchOffers(number, brand, signal) {
  const goods = await request({ number, brand, analogues: 'on' }, signal)
  const [original] = goods
  if (!original) return []
  const { analogues = [], ...item } = original
  return [{ ...item, isOriginal: true }, ...analogues]
}
