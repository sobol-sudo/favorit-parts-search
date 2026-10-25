import { useState } from 'react'
import { formatDate, formatPrice, formatShipment } from './format'

const INITIAL_COUNT = 5

// Предложения по складам: «склад · срок · остаток · цена», от дешёвых к дорогим.
export default function WarehouseList({ warehouses }) {
  const [showAll, setShowAll] = useState(false)
  const available = warehouses.filter((wh) => wh.stock > 0)

  if (!available.length) {
    return <div className="text-secondary small py-2">Нет в наличии на складах</div>
  }

  const shown = showAll ? available : available.slice(0, INITIAL_COUNT)

  return (
    <>
      <ul className="list-group list-group-flush">
        {shown.map((wh) => (
          <li
            key={wh.id + wh.shipmentDate}
            className="list-group-item bg-transparent d-flex align-items-center gap-3 px-0"
          >
            <div className="flex-grow-1">
              <div>Склад {wh.code || '—'}</div>
              {/* На узких экранах срок и остаток — второй строкой */}
              <div className="d-md-none small text-secondary">
                {formatShipment(wh.shipmentDate)} · {wh.stock} шт.
              </div>
            </div>
            <span
              className="d-none d-md-inline text-secondary text-nowrap"
              title={formatDate(wh.shipmentDate)}
            >
              {formatShipment(wh.shipmentDate)}
            </span>
            <span className="d-none d-md-inline text-nowrap text-end" style={{ minWidth: '4.5rem' }}>
              {wh.stock} шт.
            </span>
            <strong className="text-nowrap text-end">{formatPrice(wh.price)}</strong>
          </li>
        ))}
      </ul>
      {available.length > INITIAL_COUNT && (
        <button
          type="button"
          className="btn btn-link btn-sm px-0 text-decoration-none"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Свернуть' : `Ещё склады (${available.length - INITIAL_COUNT})`}
        </button>
      )}
    </>
  )
}
