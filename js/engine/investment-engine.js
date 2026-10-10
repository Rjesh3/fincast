/**
 * FinCast Financial Engine - Investment & Wealth "What If" Simulator
 * Multi-frequency compounding, annual step-up escalation, inflation adjustment & Plan A vs Plan B comparison.
 */

(function (global) {
  'use strict';

  const InvestmentEngine = {
    /**
     * Formats currency with commas
     */
    formatCurrency: function (amount) {
      if (isNaN(amount) || !isFinite(amount)) return '$0';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(Math.round(amount));
    },

    /**
     * Calculates future value of investments with optional annual step-up and inflation adjustments
     * 
     * @param {Object} options
     * @param {number} options.initialPrincipal - Starting principal ($)
     * @param {number} options.monthlyContribution - Monthly deposit ($)
     * @param {number} options.annualReturnRate - Expected annual return (%)
     * @param {number} options.years - Investment horizon in years
     * @param {number} options.annualIncreaseRate - % annual increase in monthly contributions
     * @param {number} options.compoundFrequency - Compounds per year (12 = Monthly, 4 = Quarterly, 1 = Annually, 365 = Daily)
     * @param {boolean} options.adjustForInflation - Whether to calculate inflation-adjusted purchasing power
     * @param {number} options.inflationRate - Annual inflation rate (%) - default 2.8%
     */
    calculateGrowth: function (options) {
      const initialPrincipal = Math.max(0, Number(options.initialPrincipal) || 0);
      let monthlyContribution = Math.max(0, Number(options.monthlyContribution) || 0);
      const annualReturnRate = Math.max(0, Number(options.annualReturnRate) || 0);
      const years = Math.max(1, Math.min(60, Number(options.years) || 10));
      const annualIncreaseRate = Math.max(0, Number(options.annualIncreaseRate) || 0);
      const compoundFrequency = Number(options.compoundFrequency) || 12;
      const adjustForInflation = Boolean(options.adjustForInflation);
      const inflationRate = Number(options.inflationRate) || 2.8;

      let currentBalance = initialPrincipal;
      let totalContributions = initialPrincipal;
      let totalInterestEarned = 0;

      const yearlySchedule = [];
      const totalMonths = years * 12;

      // Rate per month
      const monthlyReturnRate = Math.pow(1 + (annualReturnRate / 100) / compoundFrequency, compoundFrequency / 12) - 1;

      for (let month = 1; month <= totalMonths; month++) {
        // Step-up contribution every 12 months if specified
        if (month > 1 && month % 12 === 1 && annualIncreaseRate > 0) {
          monthlyContribution *= (1 + annualIncreaseRate / 100);
        }

        // Add monthly contribution
        currentBalance += monthlyContribution;
        totalContributions += monthlyContribution;

        // Apply monthly growth
        const monthlyInterest = currentBalance * monthlyReturnRate;
        currentBalance += monthlyInterest;
        totalInterestEarned += monthlyInterest;

        // End of year snapshot
        if (month % 12 === 0) {
          const currentYear = month / 12;
          
          // Inflation-adjusted purchasing power: FV / (1 + i)^t
          const inflationFactor = Math.pow(1 + inflationRate / 100, currentYear);
          const realPurchasingPower = adjustForInflation 
            ? Math.round(currentBalance / inflationFactor) 
            : Math.round(currentBalance);

          yearlySchedule.push({
            year: currentYear,
            nominalBalance: Math.round(currentBalance),
            realBalance: realPurchasingPower,
            totalContributions: Math.round(totalContributions),
            totalInterest: Math.round(totalInterestEarned),
            currentMonthlyDeposit: Math.round(monthlyContribution)
          });
        }
      }

      const finalNominal = Math.round(currentBalance);
      const finalInflationAdjusted = adjustForInflation 
        ? Math.round(finalNominal / Math.pow(1 + inflationRate / 100, years)) 
        : finalNominal;

      return {
        futureValue: finalNominal,
        realFutureValue: finalInflationAdjusted,
        totalContributions: Math.round(totalContributions),
        totalGrowth: Math.round(currentBalance - totalContributions),
        yearlySchedule: yearlySchedule,
        years: years,
        isInflationAdjusted: adjustForInflation
      };
    },

    /**
     * Side-by-side comparison between Plan A and Plan B (e.g. $300/mo vs $500/mo)
     */
    comparePlans: function (planAOptions, planBOptions) {
      const resultA = this.calculateGrowth(planAOptions);
      const resultB = this.calculateGrowth(planBOptions);

      const additionalContribution = Math.max(0, resultB.totalContributions - resultA.totalContributions);
      const additionalFutureValue = Math.max(0, resultB.futureValue - resultA.futureValue);
      const wealthMultiplier = additionalContribution > 0 
        ? (additionalFutureValue / additionalContribution).toFixed(1) 
        : '0.0';

      return {
        planA: resultA,
        planB: resultB,
        additionalContribution: Math.round(additionalContribution),
        additionalFutureValue: Math.round(additionalFutureValue),
        wealthMultiplier: wealthMultiplier
      };
    }
  };

  global.InvestmentEngine = InvestmentEngine;
})(typeof window !== 'undefined' ? window : this);
