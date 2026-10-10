/**
 * FinCast Financial Engine - Emergency Fund & Financial Resilience Calculator
 * Multi-factor risk scoring, HYSA growth yield, runway projection, and essential budget breakdown.
 */

(function (global) {
  'use strict';

  const EmergencyFundEngine = {
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
     * Recommends target buffer months based on personal risk profile
     */
    assessRiskProfile: function (options) {
      let riskScore = 0; // Higher means higher financial risk -> needs larger fund

      // Job Stability (1 = High/Tenured, 2 = Medium/Corporate, 3 = Variable/Freelance/Commission)
      const jobStability = Number(options.jobStability) || 2;
      if (jobStability === 3) riskScore += 3;
      else if (jobStability === 2) riskScore += 1;

      // Income Sources (1 = Dual income household, 2 = Single income household, 3 = Solo earner + dependents)
      const incomeStructure = Number(options.incomeStructure) || 2;
      if (incomeStructure === 3) riskScore += 3;
      else if (incomeStructure === 2) riskScore += 2;

      // Housing (1 = Renting, 2 = Owning with mortgage, 3 = Mortgage + older home repairs)
      const housingType = Number(options.housingType) || 2;
      if (housingType === 3) riskScore += 2;
      else if (housingType === 2) riskScore += 1;

      // Recommended cushion months: 3 to 12 months
      let recommendedMonths = 3;
      if (riskScore >= 7) recommendedMonths = 9;
      else if (riskScore >= 4) recommendedMonths = 6;
      else recommendedMonths = 3;

      return { riskScore, recommendedMonths };
    },

    /**
     * Calculates emergency fund metrics
     */
    calculateBuffer: function (options) {
      const housing = Math.max(0, Number(options.housing) || 1500);
      const utilities = Math.max(0, Number(options.utilities) || 250);
      const food = Math.max(0, Number(options.food) || 600);
      const debtPayments = Math.max(0, Number(options.debtPayments) || 400);
      const insurance = Math.max(0, Number(options.insurance) || 300);
      const transport = Math.max(0, Number(options.transport) || 0);
      const healthcare = Math.max(0, Number(options.healthcare) || 0);

      const monthlyEssentialExpenses = housing + utilities + food + debtPayments + insurance + transport + healthcare;

      const currentSavings = Math.max(0, Number(options.currentSavings) || 5000);
      const monthlyContribution = Math.max(0, Number(options.monthlyContribution) || 400);
      const hysaApy = Math.max(0, Number(options.hysaApy) || 4.25);
      const targetMonthsChosen = Math.max(1, Math.min(24, Number(options.targetMonths) || 6));

      const { riskScore, recommendedMonths } = this.assessRiskProfile(options);

      const targetAmount = Math.round(monthlyEssentialExpenses * targetMonthsChosen);
      const recommendedTargetAmount = Math.round(monthlyEssentialExpenses * recommendedMonths);

      const currentRunwayMonths = monthlyEssentialExpenses > 0 
        ? (currentSavings / monthlyEssentialExpenses).toFixed(1) 
        : 0;

      const deficit = Math.max(0, targetAmount - currentSavings);
      const percentFunded = targetAmount > 0 
        ? Math.min(100, Math.round((currentSavings / targetAmount) * 100)) 
        : 100;

      // Time to reach target with interest + monthly contribution
      let monthsToGoal = 0;
      let projectedBalance = currentSavings;
      const monthlyApy = (hysaApy / 100) / 12;

      while (projectedBalance < targetAmount && monthsToGoal < 240) {
        projectedBalance += monthlyContribution;
        projectedBalance += projectedBalance * monthlyApy;
        monthsToGoal++;
      }

      // Annual interest earned once target is reached in HYSA
      const annualHYSAInterestAtTarget = Math.round(targetAmount * (hysaApy / 100));

      return {
        monthlyEssentialExpenses,
        currentSavings,
        targetMonthsChosen,
        targetAmount,
        recommendedMonths,
        recommendedTargetAmount,
        currentRunwayMonths: Number(currentRunwayMonths),
        deficit,
        percentFunded,
        monthsToGoal: deficit === 0 ? 0 : monthsToGoal,
        annualHYSAInterestAtTarget,
        hysaApy,
        breakdown: { housing, utilities, food, debtPayments, insurance, transport, healthcare }
      };
    }
  };

  global.EmergencyFundEngine = EmergencyFundEngine;
})(typeof window !== 'undefined' ? window : this);
