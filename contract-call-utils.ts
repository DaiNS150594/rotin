import BigNumber from 'bignumber.js';
import { Web3JsCallOptions, Web3JsAbiCall, Web3JsSendOptions } from '../../abi-common';
import { Contract, Contracts } from './interfaces';

export type RotInHellAlias = NonNullable<Contracts['RotInHell']>;
export type NFTMarketAlias = NonNullable<Contracts['NFTMarket']>;

type RotInHellMethodsFunction = (rotinHellContract: RotInHellAlias['methods']) => Web3JsAbiCall<string>;

export async function getFeeInHellFromUsd(
  rotinHellContract: RotInHellAlias,
  opts: Web3JsCallOptions,
  fn: RotInHellMethodsFunction
): Promise<string> {
  const feeInUsd = await fn(rotinHellContract.methods).call(opts);

  const feeInHell = await rotinHellContract.methods
    .usdToHell(feeInUsd)
    .call(opts);

  return feeInHell;
}

type WithOptionalFrom<T extends { from: unknown }> = Omit<T, 'from'> & Partial<Pick<T, 'from'>>;

export async function approveFee(
  rotinHellContract: RotInHellAlias,
  hellToken: Contracts['HellToken'],
  from: NonNullable<Web3JsCallOptions['from']>,
  hellRewardsAvailable: string,
  callOpts: WithOptionalFrom<Web3JsCallOptions>,
  approveOpts: WithOptionalFrom<Web3JsSendOptions>,
  fn: RotInHellMethodsFunction
) {
  const callOptsWithFrom: Web3JsCallOptions = { from, ...callOpts };
  const approveOptsWithFrom: Web3JsSendOptions = { from, ...approveOpts };

  let feeInHell = new BigNumber(await getFeeInHellFromUsd(rotinHellContract, callOptsWithFrom, fn));

  try {
    feeInHell = await rotinHellContract.methods
      .getHellNeededFromUserWallet(from, feeInHell.toString())
      .call(callOptsWithFrom)
      .then(n => new BigNumber(n));

  }
  catch(err) {
    const paidByRewardPool = feeInHell.lte(hellRewardsAvailable);

    if(paidByRewardPool) {
      return null;
    }
  }

  const allowance = await hellToken.methods
    .allowance(from, rotinHellContract.options.address)
    .call(callOptsWithFrom);

  if(feeInHell.lte(allowance)) {
    return null;
  }

  return await hellToken.methods
    .approve(rotinHellContract.options.address, feeInHell.toString())
    .send(approveOptsWithFrom);
}

export async function waitUntilEvent(contract: Contract<unknown>, eventName: string, opts: Record<string, unknown>): Promise<Record<string, unknown>> {
  let subscriber: any;

  const data = await new Promise<Record<string, unknown>>((resolve, reject) => {
    subscriber = contract.events[eventName](opts, (err: Error | null, data: Record<string, unknown> | null) => {
      if(err) reject(err);
      else resolve(data!);
    });
  });

  subscriber.unsubscribe();

  return data;
}
