import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { flip, path, uncurryN, uniqBy } from 'ramda'

import { Activity, ActivityType, NFT, Network, Order } from '../../../common/types'

export const collectionTokenApi = createApi({
  reducerPath: 'collectionTokenApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/reservoir' }),
  endpoints: builder => ({
    getTokenByContractAndTokenId: builder.query<
      { token: any },
      { contract: string; tokenId: string; network: Network }
    >({
      query: ({ contract, tokenId, network }) =>
        `${network}/tokens/v7?tokens=${contract}:${tokenId}&includeTopBid=true&includeAttributes=true&normalizeRoyalties=true`,
      transformResponse: (response): NFT => path(['tokens', 0])(response) as NFT,
    }),
    getTokenActivity: builder.query<
      { activities: Activity[]; continuation: string | null },
      {
        contract: string
        tokenId: string
        network: Network
        selectedActivityTypes?: ActivityType[]
        continuation?: string
      }
    >({
      query: ({ contract, tokenId, network, selectedActivityTypes = [], continuation = '' }) => {
        const activityTypes = selectedActivityTypes.map(type => `types=${type}`).join('&')
        return `${network}/tokens/${contract}:${tokenId}/activity/v5?${
          selectedActivityTypes.length ? `${activityTypes}` : ''
        }${continuation ? `&continuation=${continuation}` : ''}`
      },
      serializeQueryArgs: ({ endpointName, queryArgs: { selectedActivityTypes, contract, tokenId } }) => {
        const activityTypes = selectedActivityTypes.map(type => `types=${type}`).join('&')
        return `${endpointName}-${contract}-${tokenId}-${activityTypes}`
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.activities = uniqBy(path(['timestamp']), [...currentCache.activities, ...newItems.activities])
        currentCache.continuation = newItems.continuation
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg
      },
    }),
    getTokenListings: builder.query<
      { orders: Order[]; continuation: string | null },
      { contract: string; tokenId: string; network: Network; continuation?: string }
    >({
      query: ({ contract, tokenId, network, continuation = '' }) =>
        `${network}/orders/asks/v5?token=${contract}:${tokenId}&includeCriteriaMetadata=true&includeRawData=true&sortBy=price&normalizeRoyalties=false${
          continuation ? `&continuation=${continuation}` : ''
        }`,
      serializeQueryArgs: ({ endpointName, queryArgs: { contract, tokenId } }) => {
        return `${endpointName}-${contract}-${tokenId}`
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.orders = uniqBy(path(['id']), [...currentCache.orders, ...newItems.orders])
        currentCache.continuation = newItems.continuation
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg
      },
    }),
    getTokenOffers: builder.query<
      { orders: Order[]; continuation: string | null },
      { contract: string; tokenId: string; network: Network; continuation?: string }
    >({
      query: ({ contract, tokenId, network, continuation }) =>
        `${network}/orders/bids/v5?token=${contract}:${tokenId}&includeCriteriaMetadata=true&includeRawData=true&sortBy=price&normalizeRoyalties=false${
          continuation ? `&continuation=${continuation}` : ''
        }`,
      serializeQueryArgs: ({ endpointName, queryArgs: { contract, tokenId } }) => {
        return `${endpointName}-${contract}-${tokenId}`
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.orders = uniqBy(path(['id']), [...currentCache.orders, ...newItems.orders])
        currentCache.continuation = newItems.continuation
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg
      },
    }),
  }),
})

export const { reducer } = collectionTokenApi

export const selectTokenByContract = flip(uncurryN(2, collectionTokenApi.endpoints.getTokenByContractAndTokenId.select))
