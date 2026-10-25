import { Fragment, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import ErrorAlert from '../../components/ErrorAlert'
import { fetchOffers, selectOfferRows, selectParts } from './partsSlice'

const PAGE_SIZE = 50

const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

const formatPrice = (price) => (price != null ? priceFormat.format(price) : '—')
const formatDate = (date) => (date ? dateFormat.format(new Date(date)) : '—')

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

  const filtered = onlyInStock ? rows.filter((row) => row.stock > 0 || row.isOriginal) : rows
  const shown = filtered.slice(0, visible)
  const inStockCount = rows.filter((row) => row.stock > 0).length

  return (
    <section ref={sectionRef} style={{ scrollMarginTop: 16 }}>
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
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <span className="text-secondary">
              Позиций: {rows.length}, в наличии: {inStockCount}
            </span>
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
                  <th className="text-end d-none d-md-table-cell">Отгрузка</th>
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
                          {row.isOriginal && <span className="badge text-bg-primary ms-2">искомая</span>}
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
                          {formatPrice(row.price)}
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
                        <td className="text-end d-none d-md-table-cell">{formatDate(row.nearestShipment)}</td>
                        <td className="text-end text-nowrap text-secondary small">
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
                          <td colSpan={7} className="p-0">
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr>
                                  <th className="ps-4">Склад</th>
                                  <th className="text-end">Цена</th>
                                  <th className="text-end">Остаток</th>
                                  <th className="text-end pe-4">Отгрузка</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.warehouses.map((wh) => (
                                  <tr key={wh.id + wh.shipmentDate}>
                                    <td className="ps-4">{wh.code || '—'}</td>
                                    <td className="text-end text-nowrap">{formatPrice(wh.price)}</td>
                                    <td className="text-end">{wh.stock} шт.</td>
                                    <td className="text-end pe-4">{formatDate(wh.shipmentDate)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

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
