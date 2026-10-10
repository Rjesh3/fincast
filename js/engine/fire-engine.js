/**
 * FinCast Financial Engine - FIRE (Financial Independence, Retire Early) Simulator
 * Calculates FIRE Target, Lean/Fat/Coast FIRE thresholds, projected FIRE age, and wealth accumulation schedule.
 */

(function (global) {
  'use strict';

  const FIREEngine = {
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
     * Calculates FIRE independence trajectory
     * 
     * @param {Object} options
     * @param {number} options.currentAge - Current age (years)
     * @param {number} options.currentNetWorth - Current invested portfolio ($)
     * @param {number} options.annualRetirementExpenses - Desired annual spending in retirement ($)
     * @param {number} options.monthlySavings - Current monthly savings/investment deposit ($)
     * @param {number} options.annualReturnRate - Investment return rate before retirement (%)
     * @param {number} options.inflationRate - Expected inflation rate (%)
     * @param {number} options.swrRate - Safe Withdrawal Rate (%, typically 3.5 - 4.0%)
     * @param {number} options.sideHustleIncome - Optional extra annual side income during retirement ($)
     */
    calculateFIRE: function (options) {
      const currentAge = Math.max(18, Math.min(80, Number(options.currentAge) || 30));
      const currentNetWorth = Math.max(0, Number(options.currentNetWorth) || 50000);
      const annualExpenses = Math.max(1000, Number(options.annualRetirementExpenses) || 60000);
      const monthlySavings = Math.max(0, Number(options.monthlySavings) || 2000);
      const returnRate = Math.max(0, Number(options.annualReturnRate) || 8.0);
      const inflationRate = Math.max(0, Number(options.inflationRate) || 2.5);
      const swr = Math.max(1.0, Math.min(10.0, Number(options.swrRate) || 4.0));
      const sideIncome = Math.max(0, Number(options.sideHustleIncome) || 0);

      // Real rate of return (Fisher equation approximation)
      const realReturn = (1 + returnRate / 100) / (1 + inflationRate / 100) - 1;

      // Net annual expenses to cover from portfolio = annual expenses - side income
      const netAnnualExpenses = Math.max(0, annualExpenses - sideIncome);

      // Target FIRE Nest Egg (in today's purchasing power dollars)
      const fireTarget = Math.round(netAnnualExpenses / (swr / 100));
      const leanFireTarget = Math.round((netAnnualExpenses * 0.75) / (swr / 100));
      const fatFireTarget = Math.round((netAnnualExpenses * 1.35) / (swr / 100));

      // Coast FIRE: Amount needed TODAY so that without adding another dime, it grows to FIRE Target at Age 65
      const yearsTo65 = Math.max(1, 65 - currentAge);
      const coastFireTarget = Math.round(fireTarget / Math.pow(1 + realReturn, yearsTo65));

      let balance = currentNetWorth;
      let totalContributions = currentNetWorth;
      let fireReachedAge = null;
      let fireReachedYear = null;
      let monthsToFIRE = 0;
      const yearlySchedule = [];

      const currentYear = new Date().getFullYear();
      const maxYears = 50;

      for (let year = 1; year <= maxYears; year++) {
        const age = currentAge + year;
        const yearDate = currentYear + year;

        // Simulate 12 months in year
        for (let month = 1; month <= 12; month++) {
          balance += monthlySavings;
          totalContributions += monthlySavings;
          balance += balance * (realReturn / 12);

          monthsToFIRE++;
          if (balance >= fireTarget && fireReachedAge === null) {
            fireReachedAge = currentAge + Math.floor(monthsToFIRE / 12);
            fireReachedYear = currentYear + Math.floor(monthsToFIRE / 12);
          }
        }

        yearlySchedule.push({
          year: year,
          calendarYear: yearDate,
          age: age,
          portfolioBalance: Math.round(balance),
          fireTarget: fireTarget,
          leanFireTarget: leanFireTarget,
          fatFireTarget: fatFireTarget,
          totalContributions: Math.round(totalContributions),
          totalGrowth: Math.round(balance - totalContributions)
        });

        if (age >= 100) break;
      }

      if (fireReachedAge === null) {
        fireReachedAge = '> ' + (currentAge + maxYears);
        fireReachedYear = '> ' + (currentYear + maxYears);
      }

      const yearsNeeded = typeof fireReachedAge === 'number' ? fireReachedAge - currentAge : maxYears;
      const monthlyPassiveIncomeAtFIRE = Math.round((fireTarget * (swr / 100)) / 12);

      return {
        fireTarget,
        leanFireTarget,
        fatFireTarget,
        coastFireTarget,
        fireReachedAge,
        fireReachedYear,
        yearsNeeded,
        monthlyPassiveIncomeAtFIRE,
        currentNetWorth,
        monthlySavings,
        swr,
        yearlySchedule
      };
    }
  };

  global.FIREEngine = FIREEngine;
})(typeof window !== 'undefined' ? window : this);
