import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import { fetchBrands, fetchOffers, selectParts } from './partsSlice'

export default function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, selectedBrand } = useSelector(selectParts)

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

  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">
        Шаг 1. Выберите производителя{' '}
        <span className="text-secondary fw-normal">({brands.items.length})</span>
      </h2>
      <div className="list-group">
        {brands.items.map((item) => (
          <button
            key={item.goodsID}
            type="button"
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
              item.brand === selectedBrand ? 'active' : ''
            }`}
            onClick={() => dispatch(fetchOffers({ number: item.number, brand: item.brand }))}
          >
            <span>
              <strong>{item.brand}</strong>
              <span className="ms-2">{item.name}</span>
            </span>
            <span className={`badge ${item.count > 0 ? 'text-bg-success' : 'text-bg-secondary'}`}>
              {item.count > 0 ? `в наличии: ${item.count}` : 'нет в наличии'}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
