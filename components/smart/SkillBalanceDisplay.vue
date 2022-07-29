<template>
  <div class="hell-balance-display">
    <div size="sm" class="my-2 my-sm-0 mr-3" variant="primary" v-tooltip="'Buy HELL'" @click="onBuyHell">
      <!-- <i class="fa fa-plus gtag-link-others" tagname="buy_hell"></i> -->
      <img src="../../assets/addButton.png" class="add-button gtag-link-others"  tagname="buy_hell">
    </div>

    <div class="balance-container">
      <strong class="mr-2 balance-text">Total Balance</strong>
      <span class="balance"
        v-tooltip="{ content: totalHellTooltipHtml , trigger: (isMobile() ? 'click' : 'hover') }"
        @mouseover="hover = !isMobile() || true"
        @mouseleave="hover = !isMobile()"
      >{{ formattedTotalHellBalance }} <b-icon-gift-fill scale="1" v-if="hasInGameHell" variant="success"/>
      </span>
    </div>

    <div class="bnb-withdraw-container mx-3" v-if="hasBnbAvailableToWithdraw">
      <b-icon-diamond-half scale="1.2"
                           :class="canWithdrawBnb ? 'pointer' : null"
                           :variant="canWithdrawBnb ? 'success' : 'warning'"
                           @click="onWithdrawBNB"
                           v-tooltip.bottom="bnbClaimTooltip" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Accessors } from 'vue/types/options';
import { mapActions, mapState, mapGetters } from 'vuex';
import BN from 'bignumber.js';
import Web3 from 'web3';
import { IState } from '@/interfaces';
import { formatDurationFromSeconds } from '@/utils/date-time';

type StoreMappedState = Pick<IState, 'hellBalance' | 'inGameOnlyFunds' | 'waxBridgeWithdrawableBnb' | 'waxBridgeTimeUntilLimitExpires'>;

interface StoreMappedGetters {
  getExchangeUrl: string;
  availableBNB: string;
}

interface StoreMappedActions {
  addMoreHell(hellToAdd: string): Promise<void>;
  withdrawBnbFromWaxBridge(): Promise<void>;
}

export default Vue.extend({
  computed: {
    ...(mapState(['hellBalance', 'inGameOnlyFunds', 'waxBridgeWithdrawableBnb', 'waxBridgeTimeUntilLimitExpires']) as Accessors<StoreMappedState>),
    ...(mapGetters({
      availableBNB: 'waxBridgeAmountOfBnbThatCanBeWithdrawnDuringPeriod',
      getExchangeUrl: 'getExchangeUrl'
    }) as Accessors<StoreMappedGetters>),

    formattedTotalHellBalance(): string {
      const hellBalance = Web3.utils.fromWei(Web3.utils.toBN(this.hellBalance).add(Web3.utils.toBN(this.inGameOnlyFunds)), 'ether');
      return `${new BN(hellBalance).toFixed(4)} HELL`;
    },

    formattedHellBalance(): string {
      const hellBalance = Web3.utils.fromWei(this.hellBalance, 'ether');
      return `${new BN(hellBalance).toFixed(4)} HELL`;
    },

    hasBnbAvailableToWithdraw(): boolean {
      return new BN(this.waxBridgeWithdrawableBnb).gt(0);
    },

    canWithdrawBnb(): boolean {
      return new BN(this.availableBNB).gt(0);
    },

    formattedBnbThatCanBeWithdrawn(): string {
      return this.formatBnb(this.availableBNB);
    },

    formattedTotalAvailableBnb(): string {
      return this.formatBnb(this.waxBridgeWithdrawableBnb);
    },

    durationUntilLimitPeriodOver(): string {
      return formatDurationFromSeconds(this.waxBridgeTimeUntilLimitExpires);
    },

    bnbClaimTooltip(): string {
      if(!this.canWithdrawBnb) {
        return `
          You have reached your limit for withdrawing BNB from the portal for this period,
          please wait about ${this.durationUntilLimitPeriodOver}
          (${this.formattedTotalAvailableBnb} left)
        `;
      }

      return `${this.formattedBnbThatCanBeWithdrawn} of ${this.formattedTotalAvailableBnb} withdrawable from the portal`;
    },
    formattedInGameOnlyFunds(): string {
      const hellBalance = Web3.utils.fromWei(this.inGameOnlyFunds, 'ether');
      return `${new BN(hellBalance).toFixed(4)} HELL`;
    },
    totalHellTooltipHtml() {
      const inGameOnlyFundsBalance = Web3.utils.fromWei(this.inGameOnlyFunds, 'ether');
      const hellBalance = Web3.utils.fromWei(this.hellBalance, 'ether');

      let html =  new BN(hellBalance).toFixed(4) + ' HELL';

      if(parseFloat(inGameOnlyFundsBalance) !== 0){
        html += '<br>+ IN GAME ONLY ' + new BN(inGameOnlyFundsBalance).toFixed(4) + ' HELL';
      }

      return html;
    },
    hasInGameHell(): boolean {
      const inGameOnlyFundsBalance = Web3.utils.fromWei(this.inGameOnlyFunds, 'ether');
      return parseFloat(inGameOnlyFundsBalance) !== 0;
    },
  },

  methods: {
    ...(mapActions(['addMoreHell', 'withdrawBnbFromWaxBridge']) as StoreMappedActions),

    formatBnb(bnb: string): string {
      const amount = Web3.utils.fromWei(bnb, 'ether');
      return `${new BN(amount).toFixed(4)} BNB`;
    },

    onBuyHell() {
      window.open(this.getExchangeUrl, '_blank');
    },

    async onWithdrawBNB() {
      if(!this.canWithdrawBnb) return;

      await this.withdrawBnbFromWaxBridge();
    }
  },

  components: {
  }
});
</script>

<style scoped>
.hell-balance-display {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.balance-container {
  margin-right: 5px;
  color: #b3b0a7;
}

.balance-text {
  color : #efc245;
}
.add-button {
  width : 30px;
  height: 100%;
}
.add-button:hover {
  cursor: pointer;
}
</style>
