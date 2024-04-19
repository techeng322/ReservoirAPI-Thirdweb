import { createAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { RootState } from '../../../common/redux/store'
import { jsonRpcProvider, reservoirClient, walletClient } from '../../../common/web3'
import { ReservoirClient } from '@reservoir0x/reservoir-sdk'
import { Network } from '../../../common/types'
import { getUnixTime } from 'date-fns/fp'
import { defaultAbiCoder, toUtf8Bytes } from 'ethers/lib/utils'
import { keccak256 } from 'viem'
import { SEPOLIA_MINTER, ZORA_FEE } from '@/common/constants/constants'
import { getChainIdFromNetwork } from '@/common/utils'

export const tokenAdapter = createEntityAdapter({})

export const interactionProgressAction = createAction<any>('collection/interaction/progress')
export const showListToken = createAction<any>('listToken/show')
export const showCreateBid = createAction<any>('createBid/show')

export const mintTokenTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<Promise<any>, { contract: string; tokenId: string; address: string; network: Network, amount: string }>(
    'token/mint',
    ({ contract, tokenId, address, network, amount }, { rejectWithValue }) => {
      const signature = keccak256(toUtf8Bytes('mintWithRewards(address,uint256,uint256,bytes,address)'))
      const minterArguments = defaultAbiCoder.encode(["address", "string"], [address, "!!!"])
      
      return client(network)
        ?.actions.mintToken({
          items: [{
            custom: {
              details: {
                tx: {
                  data: {
                    signature,
                    params: [
                      {abiType: 'address', abiValue: SEPOLIA_MINTER},
                      {abiType: 'uint256', abiValue: tokenId},
                      {abiType: 'uint256', abiValue: amount},
                      {
                        abiType: 'bytes',
                        abiValue: minterArguments
                      },
                      {abiType: 'address', abiValue: address}
                    ]
                  },
                  to: contract
                }
              },
              contract,
              price: ZORA_FEE
            }
          }],
          wallet: walletClient(address, network),
          options: {
            onlyPath: false,
            partial: false,
            skipBalanceCheck: false,
            taker: address,
            currencyChainId: getChainIdFromNetwork(network),
          },
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps, "ZIAD")
          },
        })
        .catch((err: any) => {
          console.log("ZIAD", err)
          return rejectWithValue(err.response.data)
        })
    },
  )

export const mintToken = mintTokenTh(reservoirClient, walletClient)

export const buyTokenTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<Promise<any>, { contract: string; tokenId: string; address: string; network: Network }>(
    'token/buy',
    ({ contract, tokenId, address, network }, { rejectWithValue }) => {
      return client(network)
        ?.actions.buyToken({
          items: [{ token: `${contract}:${tokenId}`, quantity: 1 }],
          wallet: walletClient(address, network),
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps)
          },
        })
        .catch((err: any) => {
          return rejectWithValue(err.response.data)
        })
    },
  )

export const buyToken = buyTokenTh(reservoirClient, walletClient)

export const createBidTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<
    Promise<any>,
    {
      contract: string
      tokenId: string
      wei: string
      address: string
      network: Network
      currency: string
      expiration: Date
      platforms: string[]
    }
  >(
    'token/makeBid',
    ({ contract, tokenId, wei, address, network, currency, expiration, platforms }, { rejectWithValue }) => {
      const bids: {
        token: string
        orderbook: 'reservoir' | 'opensea'
        orderKind: 'seaport-v1.5'
        weiPrice: string
        expirationTime: string
      }[] = [
        {
          token: `${contract}:${tokenId}`,
          orderbook: 'reservoir',
          orderKind: 'seaport-v1.5',
          weiPrice: wei,
          expirationTime: getUnixTime(expiration).toString(),
        },
      ]

      if (platforms.includes('opensea')) {
        bids.push({
          token: `${contract}:${tokenId}`,
          orderbook: 'opensea',
          orderKind: 'seaport-v1.5',
          weiPrice: wei,
          expirationTime: getUnixTime(expiration).toString(),
        })
      }

      return client(network)
        ?.actions.placeBid({
          bids: bids,
          wallet: walletClient(address, network),
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps)
          },
        })
        .catch((err: any) => {
          return rejectWithValue(err)
        })
    },
  )

export const createBid = createBidTh(reservoirClient, walletClient)

export const listTokenTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<
    Promise<any>,
    {
      contract: string
      tokenId: string
      wei: string
      address: string
      network: Network
      currency: string
      expiration: Date
      platforms: string[]
    }
  >(
    'token/list',
    ({ contract, tokenId, wei, address, network, currency, expiration, platforms }, { rejectWithValue, dispatch }) => {
      const listings: {
        token: string
        orderbook: 'reservoir' | 'opensea'
        orderKind: 'seaport-v1.5'
        weiPrice: string
        expirationTime: string
      }[] = [
        {
          token: `${contract}:${tokenId}`,
          orderbook: 'reservoir',
          orderKind: 'seaport-v1.5',
          weiPrice: wei,
          expirationTime: getUnixTime(expiration).toString(),
        },
      ]

      if (platforms.includes('opensea')) {
        listings.push({
          token: `${contract}:${tokenId}`,
          orderbook: 'opensea',
          orderKind: 'seaport-v1.5',
          weiPrice: wei,
          expirationTime: getUnixTime(expiration).toString(),
        })
      }

      return client(network)
        ?.actions.listToken({
          listings,
          wallet: walletClient(address, network),
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps)
          },
        })
        .catch((err: any) => {
          return rejectWithValue(err)
        })
    },
  )

export const listToken = listTokenTh(reservoirClient, walletClient)

export const acceptOfferTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<Promise<any>, { contract: string; tokenId: string; address: string; network: Network }>(
    'token/acceptOffer',
    ({ contract, tokenId, address, network }, { rejectWithValue, dispatch }) => {
      return client(network)
        ?.actions.acceptOffer({
          items: [
            {
              token: `${contract}:${tokenId}`,
              quantity: 1,
            },
          ],
          wallet: walletClient(address, network),
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps)
          },
        })
        .catch((err: any) => {
          return rejectWithValue(err)
        })
    },
  )

export const acceptOffer = acceptOfferTh(reservoirClient, walletClient)

export const cancelOrderTh = (client: (network: Network) => ReservoirClient, walletClient: any) =>
  createAsyncThunk<Promise<any>, { id: string; address: string; network: Network }>(
    'token/cancelOrder',
    ({ id, address, network }, { rejectWithValue, dispatch }) => {
      return client(network)
        ?.actions.cancelOrder({
          ids: [id],
          wallet: walletClient(address, network),
          onProgress: steps => {
            // dispatch(interactionProgressAction(steps))
            console.log(steps)
          },
        })
        .catch((err: any) => {
          return rejectWithValue(err)
        })
    },
  )

export const cancelOrder = cancelOrderTh(reservoirClient, walletClient)

export const tokenSlice = createSlice({
  name: 'collectionTokenInteraction',
  initialState: tokenAdapter.getInitialState({
    status: 'idle',
  }),
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(mintToken.pending, state => {
        state.status = 'pending'
      })
      .addCase(mintToken.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(mintToken.rejected, state => {
        state.status = 'failed'
      })
      .addCase(buyToken.pending, state => {
        state.status = 'pending'
      })
      .addCase(buyToken.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(buyToken.rejected, state => {
        state.status = 'failed'
      })
      .addCase(createBid.pending, state => {
        state.status = 'pending'
      })
      .addCase(createBid.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(createBid.rejected, state => {
        state.status = 'failed'
      })
      
      .addCase(listToken.pending, state => {
        state.status = 'pending'
      })
      .addCase(listToken.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(listToken.rejected, state => {
        state.status = 'failed'
      })
      .addCase(acceptOffer.pending, state => {
        state.status = 'pending'
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(acceptOffer.rejected, state => {
        state.status = 'failed'
      })
      .addCase(cancelOrder.pending, state => {
        state.status = 'pending'
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const { payload } = action
        state.status = 'succeeded'
        tokenAdapter.addOne(state, payload)
      })
      .addCase(cancelOrder.rejected, state => {
        state.status = 'failed'
      })
  },
})

export const collectionTokenInteractionReducer = tokenSlice.reducer
export const selectCollectionTokenInteractionStatus = (state: RootState) => state.collectionTokenInteraction
