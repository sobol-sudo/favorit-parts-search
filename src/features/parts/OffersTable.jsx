import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import { fetchOffers, selectOfferRows, selectParts } from './partsSlice'

const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

export default function OffersTable() {
  const dispatch = useDispatch()
  const { number, selectedBrand, offers } = useSelector(selectParts)
  const rows = useSelector(selectOfferRows)

  if (!selectedBrand) return null

  return (
    <section>
      <h2 className="h5 mb-3">
        Шаг 2. Аналоги и предложения для {selectedBrand} {number}
      </h2>

      {offers.status === 'loading' && <Loader text="Загружаем аналоги и остатки…" />}

      {offers.status === 'failed' && (
        <ErrorAlert
          message={offers.error}
          onRetry={() => dispatch(fetchOffers({ number, brand: selectedBrand }))}
        />
      )}

      {offers.status === 'succeeded' && !rows.length && (
        <div className="alert alert-secondary">Аналогов и предложений не найдено.</div>
      )}

      {offers.status === 'succeeded' && rows.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Производитель</th>
                <th>Номер</th>
                <th>Название</th>
                <th>Склад</th>
                <th className="text-end">Цена</th>
                <th className="text-end">Остаток</th>
                <th className="text-end">Отгрузка</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className={row.stock > 0 ? '' : 'text-secondary'}>
                  <td>
                    <strong>{row.brand}</strong>
                    {row.isOriginal && <span className="badge text-bg-primary ms-2">искомая</span>}
                  </td>
                  <td>{row.number}</td>
                  <td>{row.name}</td>
                  <td className="text-nowrap">{row.warehouse}</td>
                  <td className="text-end text-nowrap">
                    {row.price != null ? priceFormat.format(row.price) : '—'}
                  </td>
                  <td className="text-end">{row.stock > 0 ? `${row.stock} шт.` : 'нет'}</td>
                  <td className="text-end">
                    {row.shipmentDate ? dateFormat.format(new Date(row.shipmentDate)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
