import React from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import NextNProgress from 'nextjs-progressbar'

import {
  useDeviceInfoSyc,
  useSentryConfigurator,
  useSlippageTolerenceSyncer,
  useSlippageTolerenceValidator,
  useThemeModeSync
} from '@/application/appSettings/initializationHooks'
import useConnectionInitialization from '@/application/connection/useConnectionInitialization'
import { useUserCustomizedEndpointInitLoad } from '@/application/connection/useUserCustomizedEndpointInitLoad'
import useFarmInfoFetcher from '@/application/farms/useFarmInfoLoader'
import useInjectRaydiumFeeAprFromPair from '@/application/farms/useInjectRaydiumFeeAprFromPair'
import useAutoFetchIdoInfos from '@/application/ido/useAutoFetchIdoInfos'
import useLiquidityInfoLoader from '@/application/liquidity/feature/useLiquidityInfoLoader'
import useMessageBoardFileLoader from '@/application/messageBoard/useMessageBoardFileLoader'
import useMessageBoardReadedIdRecorder from '@/application/messageBoard/useMessageBoardReadedIdRecorder'
import usePoolsInfoLoader from '@/application/pools/usePoolsInfoLoader'
import { useAutoSyncUserAddedTokens } from '@/application/token/feature/useAutoSyncUserAddedTokens'
import useAutoUpdateSelectableTokens from '@/application/token/feature/useAutoUpdateSelectableTokens'
import { useLpTokenMethodsLoad } from '@/application/token/feature/useLpTokenMethodsLoad'
import useLpTokensLoader from '@/application/token/feature/useLpTokensLoader'
import useTokenMintAutoRecord from '@/application/token/feature/useTokenFlaggedMintAutoRecorder'
import useTokenListSettingsLocalStorage from '@/application/token/feature/useTokenListSettingsLocalStorage'
import useTokenListsLoader from '@/application/token/feature/useTokenListsLoader'
import useTokenPriceRefresher from '@/application/token/feature/useTokenPriceRefresher'
import useInitRefreshTransactionStatus from '@/application/txHistory/feature/useInitRefreshTransactionStatus'
import useSyncTxHistoryWithLocalStorage from '@/application/txHistory/feature/useSyncTxHistoryWithLocalStorage'
import useInitBalanceRefresher from '@/application/wallet/feature/useBalanceRefresher'
import { useSyncWithSolanaWallet } from '@/application/wallet/feature/useSyncWithSolanaWallet'
import useTokenAccountsRefresher from '@/application/wallet/feature/useTokenAccountsRefresher'
import { useWalletAccountChangeListeners } from '@/application/wallet/feature/useWalletAccountChangeListeners'
import RecentTransactionDialog from '@/pageComponents/dialogs/RecentTransactionDialog'
import WalletSelectorDialog from '@/pageComponents/dialogs/WalletSelectorDialog'
import NotificationSystemStack from '@/components/NotificationSystemStack'
import { SolanaWalletProviders } from '@/components/SolanaWallets/SolanaWallets'
import useHandleWindowTopError from '@/hooks/useHandleWindowTopError'

import '../styles/index.css'
import { useWalletConnectNotifaction } from '@/application/wallet/feature/useWalletConnectNotifaction'
import { useInitShadowKeypairs } from '@/application/wallet/feature/useInitShadowKeypairs'
import { useAppInitVersionPostHeartBeat, useJudgeAppVersion } from '@/application/appVersion/useAppVersion'
import useStealDataFromFarm from '@/application/staking/feature/useStealDataFromFarm'
import { useTokenGetterFnLoader } from '@/application/token/feature/useTokenGetterFnLoader'

import { PublicKey } from '@solana/web3.js'
import toPubString from '@/functions/format/toMintString'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect '
import { inClient } from '@/functions/judgers/isSSR'
import { createDOMElement } from '@/functions/dom/createDOMElement'
import useFarmResetSelfCreatedByOwner from '@/application/farms/useFarmResetSelfCreatedByOwner'

import { POPOVER_STACK_ID } from '@/components/Popover'
import { DRAWER_STACK_ID } from '@/components/Drawer'
import useFreshChainTimeOffset from '@/application/connection/useFreshChainTimeOffset'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()

  /* add popup stack */
  useIsomorphicLayoutEffect(() => {
    if (inClient) {
      const popoverStackElement = createDOMElement({
        classNames: ['fixed', 'z-popover', 'inset-0', 'self-pointer-events-none'],
        id: POPOVER_STACK_ID
      })
      const drawerStackElement = createDOMElement({
        classNames: ['fixed', 'z-drawer', 'inset-0', 'self-pointer-events-none'],
        id: DRAWER_STACK_ID
      })

      document.body.append(popoverStackElement)
      document.body.append(drawerStackElement)
    }
  }, [])

  return (
    <SolanaWalletProviders>
      {/* initializations hooks */}
      <ClientInitialization />
      {pathname !== '/' && <ApplicationsInitializations />}

      <div className="app">
        <NextNProgress color="#34ade5" showOnShallow={false} />

        {/* Page Components */}
        <Component {...pageProps} />

        {/* Global Components */}
        <RecentTransactionDialog />
        <WalletSelectorDialog />
        <NotificationSystemStack />
      </div>
    </SolanaWalletProviders>
  )
}

// accelerayte
PublicKey.prototype.toString = function () {
  return toPubString(this)
}
PublicKey.prototype.toJSON = function () {
  return toPubString(this)
}

function ClientInitialization() {
  useHandleWindowTopError()

  // sentry settings
  useSentryConfigurator()

  useThemeModeSync()

  useDeviceInfoSyc()

  return null
}

function ApplicationsInitializations() {
  const { pathname } = useRouter()
  useSlippageTolerenceValidator()
  useSlippageTolerenceSyncer()
  // TODO: it may load too much data in init action. should improve this in 0.0.2

  // load liquidity info (jsonInfo, sdkParsedInfo, hydratedInfo)
  useLiquidityInfoLoader()

  /********************** appVersion **********************/
  useAppInitVersionPostHeartBeat()
  useJudgeAppVersion()

  /********************** connection **********************/
  useUserCustomizedEndpointInitLoad()
  useConnectionInitialization()
  useFreshChainTimeOffset()

  /********************** message boards **********************/
  useMessageBoardFileLoader() // load `raydium-message-board.json`
  useMessageBoardReadedIdRecorder() // sync user's readedIds

  /********************** wallet **********************/

  // experimental features. will not let user see
  useInitShadowKeypairs()

  useSyncWithSolanaWallet()
  useWalletConnectNotifaction()
  useTokenAccountsRefresher()
  useInitBalanceRefresher()
  useWalletAccountChangeListeners()

  /********************** token **********************/
  // application initializations
  useAutoUpdateSelectableTokens()
  useAutoSyncUserAddedTokens()
  useTokenListsLoader()
  useLpTokensLoader()
  useLpTokenMethodsLoad()
  useTokenPriceRefresher()
  useTokenMintAutoRecord()
  useTokenListSettingsLocalStorage()
  useTokenGetterFnLoader()

  /********************** pariInfo(pools) **********************/
  usePoolsInfoLoader()

  /********************** farm **********************/
  useInjectRaydiumFeeAprFromPair() // auto inject apr to farm info from backend pair interface
  useFarmInfoFetcher()
  useFarmResetSelfCreatedByOwner()

  /********************** staking **********************/
  useStealDataFromFarm() // auto inject apr to farm info from backend pair interface

  /********************** txHistory **********************/
  useInitRefreshTransactionStatus()
  useSyncTxHistoryWithLocalStorage()

  /********************** acceleraytor **********************/
  // useAutoFetchIdoInfo({
  //   when: pathname.toLowerCase().includes('/acceleraytor') || pathname.toLowerCase().includes('/basement')
  // })

  useAutoFetchIdoInfos({
    when: pathname.toLowerCase().includes('/acceleraytor') || pathname.toLowerCase().includes('/basement')
  })
  return null
}
