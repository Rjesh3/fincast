/**
 * FinCast Financial Engine - Financial Life & Net Worth Multi-Decade Simulator
 * Forecasts complete net worth trajectories, major life events, and FIRE milestones from 2026 to 2050+.
 */

(function (global) {
  'use strict';

  const LifeSimulatorEngine = {
    /**
     * Projects multi-decade financial life trajectory
     * @param {Object} options
     */
    projectTrajectory: function (options) {
      const currentAge = Math.max(18, Math.min(80, Number(options.currentAge) || 30));
      const retirementAge = Math.max(currentAge + 1, Math.min(90, Number(options.retirementAge) || 65));
      let currentNetWorth = Number(options.currentNetWorth) || 25000;
      let annualIncome = Math.max(0, Number(options.annualIncome) || 85000);
      const savingsRate = Math.max(0, Math.min(90, Number(options.savingsRate) || 20));
      const annualReturn = Math.max(0, Number(options.annualReturn) || 8.0);
      const incomeGrowthRate = Math.max(0, Number(options.incomeGrowthRate) || 2.5);
      const annualLivingExpenses = annualIncome * (1 - (savingsRate / 100));

      const startYear = 2026;
      const totalYears = Math.min(45, Math.max(10, (retirementAge + 15) - currentAge));
      const timeline = [];
      let fireReachedYear = null;
      const fireTarget = annualLivingExpenses * 25; // 4% rule

      for (let i = 0; i <= totalYears; i++) {
        const year = startYear + i;
        const age = currentAge + i;
        const isRetired = age >= retirementAge;

        let annualSavings = 0;
        if (!isRetired) {
          annualSavings = annualIncome * (savingsRate / 100);
          annualIncome *= (1 + incomeGrowthRate / 100);
        } else {
          // In retirement, withdraw 4% of portfolio for living expenses
          const annualWithdrawal = currentNetWorth * 0.04;
          currentNetWorth -= annualWithdrawal;
        }

        // Apply annual investment growth
        const investmentGrowth = currentNetWorth * (annualReturn / 100);
        currentNetWorth += investmentGrowth + annualSavings;

        if (!fireReachedYear && currentNetWorth >= fireTarget) {
          fireReachedYear = year;
        }

        timeline.push({
          year: year,
          age: age,
          netWorth: Math.round(currentNetWorth),
          isRetired: isRetired,
          annualSavings: Math.round(annualSavings),
          investmentGrowth: Math.round(investmentGrowth)
        });
      }

      return {
        startYear: startYear,
        endYear: startYear + totalYears,
        finalNetWorth: Math.round(currentNetWorth),
        retirementAge: retirementAge,
        fireTarget: Math.round(fireTarget),
        fireReachedYear: fireReachedYear,
        timeline: timeline
      };
    }
  };

  global.LifeSimulatorEngine = LifeSimulatorEngine;
})(typeof window !== 'undefined' ? window : this);
