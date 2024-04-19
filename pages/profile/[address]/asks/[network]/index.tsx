import React, { FC, useEffect } from 'react'
import { useRouter } from 'next/router'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import Head from 'next/head'
import { isEmpty, isNil } from 'ramda'

import { userApi } from '../../../../../modules/User'
import { useAppDispatch, useAppSelector } from '../../../../../common/redux/store'
import { selectUserAsks } from '../../../../../modules/User/user.api'
import { useInfiniteLoading } from '../../../../../common/useInfiniteLoading'
import { Loader } from '../../../../../modules/Loader'
import { Layout, Network } from '../../../../../common/types'
import { withLayout } from '../../../../../common/layouts/MainLayout/withLayout'
import { Footer } from '../../../../../modules/Footer'
import { DashboardNav } from '../../../../../modules/DashboardNav'
import { NetworkNav } from '../../../../../modules/NetworkNav'
import { UserAsks } from '../../../../../modules/UserAsks'
import { lookupAddress, selectENSByAddress, selectEnsStatus } from '../../../../../common/ens'
import { truncateAddress } from '../../../../../common/utils'

export const ActivityDashboard: FC = ({}) => {
  const {
    query: { network, address },
  } = useRouter()
  const dispatch = useAppDispatch()

  const { data, status } = useAppSelector(selectUserAsks({ address: address as string, network: network as Network }))
  const ens = useAppSelector(state => selectENSByAddress(state, address as string))
  const ensStatus = useAppSelector(selectEnsStatus)

  const { ref: activityRef } = useInfiniteLoading(userApi.endpoints.getUserAsks.initiate, {
    address: address as string,
    continuation: data?.continuation,
    network,
  })

  useEffect(() => {
    if (!address || !network) return
    dispatch(userApi.endpoints.getUserAsks.initiate({ address: address as string, network: network as Network }))
  }, [dispatch, address, network])

  useEffect(() => {
    if (!ens?.name && ensStatus !== QueryStatus.pending && address) {
      dispatch(lookupAddress({ address: address as string }))
    }
  }, [ens, address, ensStatus, dispatch])

  return (
    <div className="flex items-center flex-col">
      <Head>
        <title>Ikigai Labs - Shaped by Photography</title>
        <meta name="description" content="Shaped by Photography" />
        <link rel="icon" href="/assets/images/IKIGAI_LABS_logo.svg" />
      </Head>
      <div className="text-yellow text-left w-full pt-32 max-w-screen-2xl pl-8 pb-8">
        <h1 className="font-normal">{ens?.name ? ens?.name : truncateAddress(address)}</h1>
        <h3 className="text-4xl pb-0 mb-0">Asks</h3>
        <h2 className="">
          on <span className="capitalize">{network}</span>
        </h2>
      </div>
      <main className="w-full">
        <div className="bg-white w-full flex py-4 justify-center items-center text-black flex-col">
          <div className="max-w-screen-2xl w-full m-4 flex md:px-6 lg:px-8">
            <div className="block w-full">
              <DashboardNav network={network as Network} currentTab="asks" address={address as string} />
            </div>
          </div>
          <div className="max-w-screen-2xl w-full m-4">
            <div className="flex flex-row">
              <div className="w-1/6">
                <div className="ml-8">
                  <NetworkNav network={network as Network} tab="asks" address={address as string} />
                </div>
              </div>
              <div className="w-5/6">
                {!isNil(data?.orders) && !isEmpty(data?.orders) && (
                  <div className="mr-8">
                    <UserAsks asks={data?.orders} network={network as Network} />
                  </div>
                )}
                {status !== QueryStatus.pending && isEmpty(data?.orders) && (
                  <div className="w-full text-center">No asks found</div>
                )}
                {status === QueryStatus.pending && (
                  <div className="w-full text-center">
                    <Loader />
                  </div>
                )}
                {!address && <div className="w-full text-center">Not Connected</div>}
                <div ref={activityRef} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default withLayout(Layout.main)(ActivityDashboard as any)
