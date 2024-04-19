import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { evolve, toString } from 'ramda'

import { RootState } from '../../../common/redux/store'

const tranformations = {
  tokenId: toString,
  startTimeInEpochSeconds: toString,
  endTimeInEpochSeconds: toString,
  quantity: toString,
  reservePrice: toString,
  buyoutPrice: toString,
  buyoutCurrencyValuePerToken: {
    value: toString,
  },
  asset: {
    id: toString,
  },
  reservePriceCurrencyValuePerToken: {
    value: toString,
  },
}

export const fetchFeaturedAuction = createAsyncThunk<
  {
    getAsk: ({ contract, askId }) => Promise<any>
    contract: string
    askId: string
  },
  { rejectValue: string }
>('featuredAuction/fetch', ({ getAsk, contract, askId }: any, { rejectWithValue }) =>
  getAsk({ contract, askId })
    .then(evolve(tranformations) as any)
    .catch((error: Error) => rejectWithValue(error.message)),
)

interface FeaturedAuctionState {
  entities: any
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null | undefined
}

const initialState = {
  entities: {},
  status: 'idle',
  error: null,
} as FeaturedAuctionState

// Then, handle actions in your reducers:
export const FeaturedAuctionSlice = createSlice({
  name: 'featuredAuction',
  initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder
      .addCase(fetchFeaturedAuction.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchFeaturedAuction.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        // @ts-ignore
        state.entities = payload
      })
      .addCase(fetchFeaturedAuction.rejected, (state, action) => {
        const { payload, error } = action
        state.status = 'failed'
        if (payload) {
          state.error = payload as string
        } else {
          state.error = error.message
        }
      })
  },
})

export const { reducer } = FeaturedAuctionSlice

// Other code such as selectors can use the imported `RootState` type
export const selectFeaturedAuction = (state: RootState) => state.featuredAuction.entities
export const selectLoadingState = (state: RootState) => state.featuredAuction.status
