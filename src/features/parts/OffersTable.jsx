import { Fragment, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import OriginalCard from './OriginalCard'
import WarehouseList from './WarehouseList'
import { formatDate, formatPrice, formatShipment } from './format'
import { fetchOffers, selectOfferRows, selectParts } from './partsSlice'

const PAGE_SIZE = 50

export default function OffersTable() {
  const dispatch = useDispatch()
  const { number, selectedBrand, offers } = useSelector(selectParts)
  const rows = useSelector(selectOfferRows)

  const [onlyInStock, setOnlyInStock] = useState(true)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expanded, setExpanded] = useState(null)
  const sectionRef = useRef(null)

  // Новый бренд — новая выдача: сбрасываем пагинацию и раскрытую строку.
  useEffect(() => {
    setVisible(PAGE_SIZE)
    setExpanded(null)
  }, [selectedBrand, number])

  // Когда результат пришёл, а блок ниже экрана (на мобильных почти всегда) — подводим к нему.
  useEffect(() => {
    if (offers.status !== 'succeeded' && offers.status !== 'failed') return
    const section = sectionRef.current
    if (section && section.getBoundingClientRect().top > window.innerHeight * 0.6) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [offers.status])

  if (!selectedBrand) return null

  const original = rows.find((row) => row.isOriginal)
  const analogues = rows.filter((row) => !row.isOriginal)
  const filtered = onlyInStock ? analogues.filter((row) => row.stock > 0) : analogues
  const shown = filtered.slice(0, visible)
  const inStockCount = analogues.filter((row) => row.stock > 0).length

  return (
    <section ref={sectionRef} style={{ scrollMarginTop: 16 }}>
      <h2 className="h5 mb-3">
        Шаг 2. Предложения для {selectedBrand} {number}
      </h2>

      {offers.status === 'loading' && <Loader text="Загружаем аналоги и остатки…" />}

      {offers.status === 'failed' && (
        <ErrorAlert
          message={offers.error}
          onRetry={() => dispatch(fetchOffers({ number, brand: selectedBrand }))}
        />
      )}

      {offers.status === 'succeeded' && !rows.length && (
        <div className="alert alert-secondary">Предложений не найдено.</div>
      )}

      {offers.status === 'succeeded' && original && <OriginalCard item={original} />}

      {offers.status === 'succeeded' && original && !analogues.length && (
        <div className="alert alert-secondary">Аналогов других производителей не найдено.</div>
      )}

      {offers.status === 'succeeded' && analogues.length > 0 && (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <h3 className="h6 mb-0">
              Аналоги других производителей{' '}
              <span className="text-secondary fw-normal">
                ({analogues.length}, в наличии {inStockCount})
              </span>
            </h3>
            <div className="form-check form-switch mb-0">
              <input
                id="only-in-stock"
                className="form-check-input"
                style={{ cursor: 'pointer' }}
                type="checkbox"
                role="switch"
                checked={onlyInStock}
                onChange={(e) => {
                  setOnlyInStock(e.target.checked)
                  setVisible(PAGE_SIZE)
                }}
              />
              <label className="form-check-label" htmlFor="only-in-stock" style={{ cursor: 'pointer' }}>
                Только в наличии
              </label>
            </div>
          </div>

          {!filtered.length && (
            <div className="alert alert-secondary">
              Аналогов в наличии нет — выключите фильтр, чтобы увидеть все.
            </div>
          )}

          {filtered.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Производитель</th>
                    <th className="d-none d-md-table-cell">Номер</th>
                    <th className="d-none d-md-table-cell">Название</th>
                    <th className="text-end">Цена</th>
                    <th className="text-end">
                      <span className="d-none d-md-inline">Остаток</span>
                      <span className="d-md-none">Ост.</span>
                    </th>
                    <th className="text-end d-none d-md-table-cell">Срок</th>
                    <th>
                      <span className="visually-hidden">Склады</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => {
                    const isOpen = expanded === row.key
                    const canExpand = row.warehouses.length > 0
                    return (
                      <Fragment key={row.key}>
                        <tr
                          className={row.stock > 0 ? '' : 'text-secondary'}
                          style={{ cursor: canExpand ? 'pointer' : 'default' }}
                          onClick={() => canExpand && setExpanded(isOpen ? null : row.key)}
                        >
                          <td>
                            <strong className="text-break">{row.brand}</strong>
                            {/* На узких экранах номер и название — под производителем */}
                            <div className="d-md-none small">
                              <div className="text-secondary">{row.number}</div>
                              <div>{row.name}</div>
                            </div>
                          </td>
                          <td className="text-nowrap d-none d-md-table-cell">{row.number}</td>
                          <td className="d-none d-md-table-cell">{row.name}</td>
                          <td className="text-end text-nowrap">
                            {row.price != null && row.warehouses.length > 1 && (
                              <span className="d-block d-md-inline small text-secondary me-md-1">от</span>
                            )}
                            <strong>{formatPrice(row.price)}</strong>
                          </td>
                          <td className="text-end text-nowrap">
                            {row.stock > 0 ? (
                              <>
                                {row.stock}
                                <span className="d-none d-md-inline"> шт.</span>
                              </>
                            ) : (
                              'нет'
                            )}
                          </td>
                          <td
                            className="text-end text-nowrap text-secondary d-none d-md-table-cell"
                            title={formatDate(row.nearestShipment)}
                          >
                            {row.nearestShipment ? formatShipment(row.nearestShipment) : '—'}
                          </td>
                          <td className="text-end text-nowrap small">
                            {canExpand && (
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-decoration-none p-0"
                                aria-expanded={isOpen}
                                aria-label={`Склады (${row.warehouses.length})`}
                              >
                                <span className="d-none d-md-inline">{row.warehouses.length} скл. </span>
                                {isOpen ? '▲' : '▼'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="table-light">
                            <td colSpan={7} className="px-3 py-1">
                              <WarehouseList warehouses={row.warehouses} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > visible && (
            <div className="text-center mb-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
              >
                Показать ещё ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
