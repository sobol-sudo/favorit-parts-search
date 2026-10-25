import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { searchBrands, searchOffers } from '../../api/partsApi'

export const fetchBrands = createAsyncThunk('parts/fetchBrands', (number, { signal }) =>
  searchBrands(number, signal),
)

export const fetchOffers = createAsyncThunk('parts/fetchOffers', ({ number, brand }, { signal }) =>
  searchOffers(number, brand, signal),
)

const initialState = {
  number: '',
  brands: { items: [], status: 'idle', error: null },
  selectedBrand: null,
  offers: { items: [], status: 'idle', error: null },
}

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    resetSearch: () => initialState,
    // Назад к списку производителей. Сброс requestId заодно отбрасывает ещё не пришедший ответ.
    clearBrand: (state) => {
      state.selectedBrand = null
      state.offers = initialState.offers
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.number = action.meta.arg
        state.brands = { items: [], status: 'loading', error: null }
        state.selectedBrand = null
        state.offers = initialState.offers
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = { items: action.payload, status: 'succeeded', error: null }
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.brands = { items: [], status: 'failed', error: action.error.message }
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedBrand = action.meta.arg.brand
        state.offers = { items: [], status: 'loading', error: null, requestId: action.meta.requestId }
      })
      // Пользователь мог успеть выбрать другой бренд — устаревшие ответы игнорируем.
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return
        state.offers = { items: action.payload, status: 'succeeded', error: null }
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (action.meta.aborted || state.offers.requestId !== action.meta.requestId) return
        state.offers = { items: [], status: 'failed', error: action.error.message }
      })
  },
})

export const { resetSearch, clearBrand } = partsSlice.actions
export default partsSlice.reducer

export const selectParts = (state) => state.parts

// Одна строка таблицы = одна позиция (товар). Цена — минимальная среди складов
// с остатком (поле price у товара API просит не использовать), остаток — по всем складам.
// Разбивка по складам хранится в строке и показывается при раскрытии.
export const selectOfferRows = createSelector(
  (state) => state.parts.offers.items,
  (items) =>
    items
      .map((item) => {
        const warehouses = [...(item.warehouses || [])].sort((a, b) => a.price - b.price)
        const available = warehouses.filter((wh) => wh.stock > 0)
        const priced = available.length ? available : warehouses
        const dates = available.map((wh) => wh.shipmentDate).filter(Boolean).sort()
        return {
          key: item.goodsID,
          brand: item.brand,
          number: item.number,
          name: item.name,
          isOriginal: Boolean(item.isOriginal),
          price: priced.length ? priced[0].price : null,
          stock: item.count,
          warehouses,
          nearestShipment: dates[0] || null,
        }
      })
      // Сначала искомая деталь, затем то, что есть в наличии, внутри — по цене.
      .sort(
        (a, b) =>
          b.isOriginal - a.isOriginal ||
          (b.stock > 0) - (a.stock > 0) ||
          (a.price ?? Infinity) - (b.price ?? Infinity),
      ),
)
