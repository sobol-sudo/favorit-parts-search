import { configureStore } from '@reduxjs/toolkit'
import partsReducer from '../features/parts/partsSlice'

export const store = configureStore({
  reducer: {
    parts: partsReducer,
  },
})
