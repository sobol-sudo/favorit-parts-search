import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import { fetchBrands, fetchOffers, selectParts } from './partsSlice'

function BrandButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3 ${
        active ? 'active' : ''
      }`}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
    >
      <span>
        <strong>{item.brand}</strong>
        <span className="ms-2">{item.name}</span>
      </span>
      <span
        className={`badge flex-shrink-0 ${item.count > 0 ? 'text-bg-success' : 'text-bg-secondary'}`}
      >
        {item.count > 0 ? `в наличии ${item.count}` : 'нет в наличии'}
      </span>
    </button>
  )
}

export default function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, selectedBrand } = useSelector(selectParts)
  const [showAll, setShowAll] = useState(false)

  if (brands.status === 'idle') return null
  if (brands.status === 'loading') return <Loader text="Ищем производителей…" />
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />
  }
  if (!brands.items.length) {
    return (
      <div className="alert alert-secondary">
        По артикулу <strong>{number}</strong> ничего не найдено. Проверьте номер детали.
      </div>
    )
  }

  const selectBrand = (item) => {
    setShowAll(false)
    dispatch(fetchOffers({ number: item.number, brand: item.brand }))
  }

  // Сначала то, что есть в наличии.
  const sorted = [...brands.items].sort((a, b) => (b.count > 0) - (a.count > 0))
  const selected = sorted.find((item) => item.brand === selectedBrand)
  // После выбора сворачиваем список до выбранного бренда, чтобы не листать до результатов.
  const collapsed = selected && !showAll && sorted.length > 1

  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">
        Шаг 1. {collapsed ? 'Производитель' : 'Выберите производителя'}{' '}
        <span className="text-secondary fw-normal">({brands.items.length})</span>
      </h2>
      <div className="list-group">
        {(collapsed ? [selected] : sorted).map((item) => (
          <BrandButton
            key={item.goodsID}
            item={item}
            active={item.brand === selectedBrand}
            onClick={() => selectBrand(item)}
          />
        ))}
      </div>
      {collapsed && (
        <button
          type="button"
          className="btn btn-link btn-sm px-0 mt-1 text-decoration-none"
          onClick={() => setShowAll(true)}
        >
          Сменить производителя ({sorted.length - 1})
        </button>
      )}
    </section>
  )
}
