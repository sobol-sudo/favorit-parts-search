import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchBrands, resetSearch } from './partsSlice'

const MIN_LENGTH = 3
const DEBOUNCE_MS = 500

export default function SearchForm() {
  const dispatch = useDispatch()
  const [value, setValue] = useState('')
  const requestRef = useRef(null)

  const search = (number) => {
    requestRef.current?.abort()
    requestRef.current = dispatch(fetchBrands(number))
  }

  // Поиск «по факту ввода»: ждём паузу в наборе и отменяем устаревший запрос.
  useEffect(() => {
    const number = value.trim()
    if (number.length < MIN_LENGTH) {
      requestRef.current?.abort()
      dispatch(resetSearch())
      return
    }
    const timer = setTimeout(() => search(number), DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()
    const number = value.trim()
    if (number.length >= MIN_LENGTH) search(number)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="article" className="form-label fw-semibold">
        Артикул детали
      </label>
      <div className="input-group">
        <input
          id="article"
          type="search"
          className="form-control form-control-lg"
          placeholder="Например, 7160500039S или 01089"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <button type="submit" className="btn btn-primary px-4">
          Найти
        </button>
      </div>
      <div className="form-text">Поиск запускается автоматически, от {MIN_LENGTH} символов.</div>
    </form>
  )
}
