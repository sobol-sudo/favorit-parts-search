const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

export const formatPrice = (price) => (price != null ? priceFormat.format(price) : '—')

export const formatDate = (date) => (date ? dateFormat.format(new Date(date)) : '')

// Срок отгрузки в днях понятнее даты: «сегодня», «завтра», «через 3 дн.».
export function formatShipment(date) {
  if (!date) return '—'
  const day = new Date(date)
  const today = new Date()
  const diff = Math.round(
    (new Date(day.getFullYear(), day.getMonth(), day.getDate()) -
      new Date(today.getFullYear(), today.getMonth(), today.getDate())) /
      86_400_000,
  )
  if (diff <= 0) return 'сегодня'
  if (diff === 1) return 'завтра'
  return `через ${diff} дн.`
}
