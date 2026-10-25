import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearBrand, selectParts } from './partsSlice'

export default function Breadcrumbs() {
  const dispatch = useDispatch()
  const { number, brands, selectedBrand } = useSelector(selectParts)

  // Кнопка/жест «назад» в браузере возвращают к списку производителей.
  useEffect(() => {
    const onPopState = () => dispatch(clearBrand())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [dispatch])

  if (!selectedBrand) return null

  const goBack = (e) => {
    e.preventDefault()
    // Если выбор бренда лёг в историю — откатываем её, чтобы «назад» не уводил дальше.
    if (window.history.state?.brand) window.history.back()
    else dispatch(clearBrand())
  }

  return (
    <nav aria-label="Навигация по поиску" className="mb-3">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <a href="#" onClick={goBack} className="text-decoration-none">
            Артикул {number}
            <span className="text-secondary d-none d-sm-inline">
              {' '}
              · все производители ({brands.items.length})
            </span>
          </a>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {selectedBrand}
        </li>
      </ol>
    </nav>
  )
}
