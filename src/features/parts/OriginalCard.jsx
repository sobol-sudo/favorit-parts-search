import WarehouseList from './WarehouseList'
import { formatPrice } from './format'

// Искомая деталь — отдельной карточкой над аналогами.
export default function OriginalCard({ item }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
          <div>
            <span className="badge text-bg-primary mb-2">Искомая деталь</span>
            <div className="h5 mb-1">
              {item.brand} <span className="text-secondary fw-normal">{item.number}</span>
            </div>
            <div>{item.name}</div>
          </div>
          <div className="text-md-end">
            {item.price != null ? (
              <>
                {item.warehouses.length > 1 && <div className="small text-secondary">от</div>}
                <div className="fs-3 fw-bold lh-1">{formatPrice(item.price)}</div>
                <div className="small text-secondary mt-1">
                  {item.stock > 0 ? `в наличии ${item.stock} шт.` : 'нет в наличии'}
                </div>
              </>
            ) : (
              <span className="badge text-bg-secondary">нет в наличии</span>
            )}
          </div>
        </div>
        <WarehouseList warehouses={item.warehouses} />
      </div>
    </div>
  )
}
