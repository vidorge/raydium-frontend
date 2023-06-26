import { AmmV3 } from '@raydium-io/raydium-sdk'

import assert from '@/functions/assert'
import toPubString from '@/functions/format/toMintString'
import { isMeaningfulNumber } from '@/functions/numberish/compare'
import { toString } from '@/functions/numberish/toString'

import useAppSettings from '../common/useAppSettings'
import { isQuantumSOLVersionSOL } from '../token/quantumSOL'
import txHandler from '../txTools/handleTx'
import useWallet from '../wallet/useWallet'

import { HydratedConcentratedInfo, UserPositionAccount } from './type'
import useConcentrated from './useConcentrated'
import { getComputeBudgetConfig } from '../txTools/getComputeBudgetConfig'
import toBN from '@/functions/numberish/toBN'

export default function txIncreaseConcentrated({
  currentAmmPool = useConcentrated.getState().currentAmmPool,
  targetUserPositionAccount = useConcentrated.getState().targetUserPositionAccount
}: {
  currentAmmPool?: HydratedConcentratedInfo
  targetUserPositionAccount?: UserPositionAccount
} = {}) {
  return txHandler(async ({ transactionCollector, baseUtils: { connection, owner } }) => {
    const { coin1, coin2, coin1Amount, coin2Amount, coin1SplippageAmount, coin2SplippageAmount, liquidity } =
      useConcentrated.getState()
    const { tokenAccountRawInfos } = useWallet.getState()
    assert(currentAmmPool, 'not seleted amm pool')
    assert(coin1, 'not set coin1')
    assert(coin1Amount, 'not set coin1Amount')
    assert(coin2, 'not set coin2')
    assert(coin2Amount, 'not set coin2Amount')
    assert(coin1SplippageAmount, 'not set coin1SplippageAmount')
    assert(coin2SplippageAmount, 'not set coin2SplippageAmount')
    assert(isMeaningfulNumber(liquidity), 'not set liquidity')
    assert(targetUserPositionAccount, 'not set targetUserPositionAccount')
    const { innerTransactions } = await AmmV3.makeIncreaseLiquidityInstructionSimple({
      connection: connection,
      liquidity,
      poolInfo: currentAmmPool.state,
      ownerInfo: {
        feePayer: owner,
        wallet: owner,
        tokenAccounts: tokenAccountRawInfos,
        useSOLBalance: isQuantumSOLVersionSOL(coin1) || isQuantumSOLVersionSOL(coin2)
      },
      ownerPosition: targetUserPositionAccount.sdkParsed,
      computeBudgetConfig: await getComputeBudgetConfig(),
      checkCreateATAOwner: true,
      amountSlippageA: toBN(coin1SplippageAmount, coin1.decimals),
      amountSlippageB: toBN(coin2SplippageAmount, coin2.decimals)
    })
    transactionCollector.add(innerTransactions, {
      txHistoryInfo: {
        title: 'Liquidity Added',
        description: `Added ${toString(coin1Amount)} ${coin1.symbol} and ${toString(coin2Amount)} ${
          coin2.symbol
        } to ${toPubString(targetUserPositionAccount.poolId).slice(0, 6)}`
      }
    })
  })
}
