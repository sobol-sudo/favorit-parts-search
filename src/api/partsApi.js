const API_URL = '/api/hsprice'
const API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001'
const TIMEOUT_MS = 15000

async function request(params, signal) {
  const query = new URLSearchParams({ key: API_KEY, ...params })
  // Отмена из UI (новый запрос) + таймаут, чтобы лоадер не крутился вечно.
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response
  try {
    response = await fetch(`${API_URL}?${query}`, { signal: combined })
  } catch (err) {
    if (timeout.aborted) throw new Error('Сервер долго не отвечает. Попробуйте ещё раз.')
    if (err.name === 'AbortError') throw err
    throw new Error('Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.')
  }

  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}. Попробуйте позже.`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Сервер вернул некорректный ответ. Попробуйте позже.')
  }
  if (data.error) throw new Error(`Ошибка API: ${data.error}`)

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
