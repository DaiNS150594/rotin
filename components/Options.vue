<template>
  <div class="body main-font menu-toggle-top">
    <b-navbar-nav>
      <b-nav-item-dropdown right>
        <template #button-content>
          <i class="fa fa-bars"></i>
        </template>

        <b-dropdown-group>

        <b-dropdown-header>Links</b-dropdown-header>

        <b-dropdown-item @click="claimHell(ClaimStage.WaxBridge)">Claim Hell </b-dropdown-item>

        <b-dropdown-item @click.native="$router.push('portal')">Portal </b-dropdown-item>

        <b-dropdown-item href="#" target="_blank">Gitbook (comingsoon) <b-icon scale="0.8" icon="question-circle"/></b-dropdown-item>

        </b-dropdown-group>

        <b-dropdown-group>

        <b-dropdown-header>Options</b-dropdown-header>

        <b-dropdown-item @click="toggleRewards()">Reward Bar: {{ hideRewards ? 'Off' : 'On' }}</b-dropdown-item>

        <b-dropdown-item @click="toggleAdvanced()">Advanced UI: {{ hideAdvanced ? 'Off' : 'On' }}</b-dropdown-item>

        <b-dropdown-item @click="toggleHideWalletWarning()">Hide Wallet Warning: {{ hideWalletWarning ? 'On' : 'Off' }}</b-dropdown-item>

        </b-dropdown-group>

      </b-nav-item-dropdown>
    </b-navbar-nav>

    <b-modal class="centered-modal" ref="need-gas-modal" title="Need Gas?"
      @ok="claimHell(ClaimStage.Stake)" ok-title="Next" @cancel="$router.push({ name: 'portal' })" cancel-title="Go to WAX Bridge" >
        Need Gas? Try our WAX Bridge, which will pay you .5% under market rate to sell your WAX for AVAX!
    </b-modal>
    <b-modal class="centered-modal" ref="stake-suggestion-modal" title="Stake Hell"
      @ok="$router.push({ name: 'select-stake-type' })" ok-only ok-title="Go to Stake" >
        If you stake your HELL now, we will give you a 10% bonus in HELL that you can use in-game right away!
      <a href="#" @click="claimHell(ClaimStage.Claim)"> <br>No thanks, I'd rather {{ (this.rewardsClaimTaxAsFactorBN > 0)?"pay " +
        this.formattedTaxAmount + " in taxes and " : ""  }}forfeit my bonus </a>
    </b-modal>
    <b-modal class="centered-modal" ref="claim-confirmation-modal" title="Claim Hell" ok-title="I am sure"
      @ok="onClaimTokens()"> You are about to {{ (this.rewardsClaimTaxAsFactorBN > 0)?"pay " + formattedRewardsClaimTax +
      " tax for early withdrawal, costing you " + this.formattedTaxAmount + " HELL. You will also " : "" }}
      miss out on {{formattedBonusLost}} bonus HELL. Are you sure
      you wish to continue? <b>This action cannot be undone.</b>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Events from '../events';
import { mapActions, mapGetters, mapState } from 'vuex';
import BN from 'bignumber.js';
import Web3 from 'web3';
import { Accessors } from 'vue/types/options';
import Vue from 'vue';

interface StoreMappedState {
  hellRewards: string;
  directStakeBonusPercent: number;
}

interface StoreMappedActions {
  claimTokenRewards(): Promise<void>;
}
interface Data {
  showGraphics: boolean;
  hideRewards: boolean;
  hideAdvanced: boolean;
  hideWalletWarning: boolean;
}

interface StoreMappedGetters {
  rewardsClaimTaxAsFactorBN: BN;
  maxRewardsClaimTaxAsFactorBN: BN;
}

enum ClaimStage {
  WaxBridge = 0,
  Stake = 1,
  Claim = 2
}

export default Vue.extend({
  created() {
    this.showGraphics = localStorage.getItem('useGraphics') === 'false';
    this.hideRewards = localStorage.getItem('hideRewards') === 'true';
    this.hideAdvanced = localStorage.getItem('hideAdvanced') === 'true';
    this.hideWalletWarning = localStorage.getItem('hideWalletWarning') === 'true';
  },

  data() {
    return {
      showGraphics: false,
      hideRewards: false,
      hideAdvanced: false,
      hideWalletWarning: false,
      ClaimStage
    } as Data;
  },

  computed: {
    ...(mapState(['hellRewards', 'directStakeBonusPercent']) as Accessors<StoreMappedState>),
    ...(mapGetters(['rewardsClaimTaxAsFactorBN', 'maxRewardsClaimTaxAsFactorBN']) as Accessors<StoreMappedGetters>),

    formattedHellReward(): string {
      const hellRewards = Web3.utils.fromWei(this.hellRewards, 'ether');
      return `${new BN(hellRewards).toFixed(4)}`;
    },
    formattedTaxAmount(): string {
      const hellRewards = Web3.utils.fromWei((parseFloat(this.hellRewards)* parseFloat(String(this.rewardsClaimTaxAsFactorBN))).toString(), 'ether');
      return `${new BN(hellRewards).toFixed(4)}`;
    },
    formattedRewardsClaimTax(): string {
      const frac =
        this.hellRewards === '0'
          ? this.maxRewardsClaimTaxAsFactorBN
          : this.rewardsClaimTaxAsFactorBN;

      return `${frac.multipliedBy(100).decimalPlaces(0, BN.ROUND_HALF_UP)}%`;
    },
    formattedBonusLost(): string {
      const hellLost = Web3.utils.fromWei((parseFloat(this.hellRewards)*this.directStakeBonusPercent/100).toString(), 'ether');
      return `${new BN(hellLost).toFixed(4)}`;
    },
    canClaimTokens(): boolean {
      if(new BN(this.hellRewards).lte(0)) {
        return false;
      }
      return true;
    },
  },

  methods: {
    ...(mapActions(['claimTokenRewards']) as StoreMappedActions),
    toggleGraphics() {
      this.showGraphics = !this.showGraphics;
      if (this.showGraphics) localStorage.setItem('useGraphics', 'false');
      else localStorage.setItem('useGraphics', 'false');

      Events.$emit('setting:useGraphics', { value: this.showGraphics });
    },

    toggleRewards() {
      this.hideRewards = !this.hideRewards;
      if (this.hideRewards) localStorage.setItem('hideRewards', 'true');
      else localStorage.setItem('hideRewards', 'false');

      Events.$emit('setting:hideRewards', { value: this.hideRewards });
    },

    toggleAdvanced() {
      this.hideAdvanced = !this.hideAdvanced;
      if (this.hideAdvanced) localStorage.setItem('hideAdvanced', 'true');
      else localStorage.setItem('hideAdvanced', 'false');

      Events.$emit('setting:hideAdvanced', { value: this.hideAdvanced });
    },
    async onClaimTokens() {
      if(this.canClaimTokens) {
        await this.claimTokenRewards();
      }
    },
    async claimHell(stage: ClaimStage) {
      if(stage === ClaimStage.WaxBridge) {
        (this.$refs['need-gas-modal'] as any).show();
      }
      if(stage === ClaimStage.Stake) {
        (this.$refs['stake-suggestion-modal'] as any).show();
      }
      if(stage === ClaimStage.Claim) {
        (this.$refs['stake-suggestion-modal'] as any).hide();
        (this.$refs['claim-confirmation-modal'] as any).show();
      }
    },

    toggleHideWalletWarning() {
      this.hideWalletWarning = !this.hideWalletWarning;
      if (this.hideWalletWarning) localStorage.setItem('hideWalletWarning', 'true');
      else localStorage.setItem('hideWalletWarning', 'false');

      Events.$emit('setting:hideWalletWarning', { value: this.hideWalletWarning });
    },
  }
});
</script>

<style scoped></style>
