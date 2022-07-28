import { allStakeTypes, isStakeType, StakeType } from './interfaces';

let availableStakingContracts = allStakeTypes;

if(process.env.VUE_APP_STAKE_TYPES_AVAILABLE) {
  availableStakingContracts = process.env.VUE_APP_STAKE_TYPES_AVAILABLE
    .split(',')
    .filter(isStakeType);
}

export interface StakingContractEntry {
  stakingRewardsAddress: string;
  stakingTokenAddress: string;
}

export const stakingContractsInfo: Partial<Record<StakeType, Partial<StakingContractEntry>>> = {
  hell: {
    stakingRewardsAddress: process.env.VUE_APP_HELL_STAKING_REWARDS_CONTRACT_ADDRESS,
    stakingTokenAddress: process.env.VUE_APP_HELL_TOKEN_CONTRACT_ADDRESS
  }
};

if(availableStakingContracts.includes('hell2')) {
  stakingContractsInfo.hell2 = {
    stakingRewardsAddress: process.env.VUE_APP_HELL2_STAKING_REWARDS_CONTRACT_ADDRESS,
    stakingTokenAddress: process.env.VUE_APP_HELL2_TOKEN_CONTRACT_ADDRESS
  };
}

if(availableStakingContracts.includes('lp')) {
  stakingContractsInfo.lp = {
    stakingRewardsAddress: process.env.VUE_APP_LP_STAKING_REWARDS_CONTRACT_ADDRESS,
    stakingTokenAddress: process.env.VUE_APP_LP_TOKEN_CONTRACT_ADDRESS
  };
}

if(availableStakingContracts.includes('lp2')) {
  stakingContractsInfo.lp2 = {
    stakingRewardsAddress: process.env.VUE_APP_LP_2_STAKING_REWARDS_CONTRACT_ADDRESS,
    stakingTokenAddress: process.env.VUE_APP_LP_2_TOKEN_CONTRACT_ADDRESS
  };
}

interface HumanReadableDetailsForStakeType {
  stakeTokenName: string;
  rewardTokenName: string;
  stakeTitle: string;
  deprecated?: boolean;
}

const defaultHumanReadableDetailsForStakeTypes: Record<StakeType, HumanReadableDetailsForStakeType> = {
  hell: {
    stakeTokenName: 'HELL',
    rewardTokenName: 'HELL',
    stakeTitle: 'HELL for HELL (Old)',
    deprecated: true
  },
  hell2: {
    stakeTokenName: 'HELL',
    rewardTokenName: 'HELL',
    stakeTitle: 'HELL for HELL'
  },
  lp: {
    stakeTokenName: 'HELL-WAVAX',
    rewardTokenName: 'HELL',
    stakeTitle: 'HELL-WAVAX for HELL'
  },
  lp2: {
    stakeTokenName: 'HELL-AVAX',
    rewardTokenName: 'HELL',
    stakeTitle: 'HELL-AVAX for HELL V2'
  },
};

export const humanReadableDetailsForStakeTypes = defaultHumanReadableDetailsForStakeTypes;

const stakeTypeForUnclaimedRewards = process.env.VUE_APP_STAKE_TYPE_FOR_UNCLAIMED_REWARDS;

export const stakeTypeThatCanHaveUnclaimedRewardsStakedTo: StakeType =
  stakeTypeForUnclaimedRewards && isStakeType(stakeTypeForUnclaimedRewards)
    ? stakeTypeForUnclaimedRewards
    : 'hell';
