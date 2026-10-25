import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import { fetchBrands, fetchOffers, selectParts } from './partsSlice'

export default function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, selectedBrand } = useSelector(selectParts)

  // Производитель выбран — список скрыт, вернуться к нему можно хлебными крошками или «назад».
  if (brands.status === 'idle' || selectedBrand) return null
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
    // Отдельная запись в истории — чтобы кнопка/жест «назад» возвращали к списку производителей.
    window.history.pushState({ brand: item.brand }, '')
    dispatch(fetchOffers({ number: item.number, brand: item.brand }))
  }

  // Сначала то, что есть в наличии.
  const sorted = [...brands.items].sort((a, b) => (b.count > 0) - (a.count > 0))

  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">
        Выберите производителя{' '}
        <span className="text-secondary fw-normal">({brands.items.length})</span>
      </h2>
      <div className="list-group">
        {sorted.map((item) => (
          <button
            key={item.goodsID}
            type="button"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3"
            onClick={() => selectBrand(item)}
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
        ))}
      </div>
    </section>
  )
}
