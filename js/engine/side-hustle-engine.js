/**
 * FinCast Financial Engine - Side Hustle & Freelance Tax Simulator
 * Calculates 15.3% Self-Employment Tax, Federal/State Tax brackets, expense write-offs, and true net hourly rate.
 */

(function (global) {
  'use strict';

  const SideHustleEngine = {
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
     * Calculates tax breakdown for 1099 / Freelance / Side Hustle income
     */
    calculateTaxes: function (options) {
      const grossIncome = Math.max(0, Number(options.grossIncome) || 25000);
      const businessExpenses = Math.max(0, Number(options.businessExpenses) || 4000);
      const hoursWorkedPerWeek = Math.max(1, Math.min(100, Number(options.hoursWorkedPerWeek) || 10));
      const weeksPerYear = Math.max(1, Math.min(52, Number(options.weeksPerYear) || 50));
      const stateTaxRate = Math.max(0, Math.min(13.3, Number(options.stateTaxRate) || 5.0));
      const w2OtherIncome = Math.max(0, Number(options.w2OtherIncome) || 65000);

      // Net Schedule C Business Profit
      const netProfit = Math.max(0, grossIncome - businessExpenses);

      // Self-Employment Tax (15.3% applied to 92.35% of net profit)
      const seTaxableBase = netProfit * 0.9235;
      const seTax = Math.round(seTaxableBase * 0.153);

      // 50% SE Tax Deduction from Adjusted Gross Income (AGI)
      const seDeduction = seTax * 0.5;

      // Approximate Taxable Income Addition from Side Hustle
      const taxableIncomeAddition = Math.max(0, netProfit - seDeduction);

      // Estimated Marginal Federal Tax Rate (based on W2 income + side hustle)
      let federalMarginalRate = 0.12;
      const totalIncome = w2OtherIncome + taxableIncomeAddition;
      if (totalIncome > 191950) federalMarginalRate = 0.24;
      else if (totalIncome > 95375) federalMarginalRate = 0.22;
      else if (totalIncome > 44725) federalMarginalRate = 0.22;
      else if (totalIncome > 11000) federalMarginalRate = 0.12;

      const federalIncomeTax = Math.round(taxableIncomeAddition * federalMarginalRate);
      const stateIncomeTax = Math.round(taxableIncomeAddition * (stateTaxRate / 100));

      const totalTaxLiability = seTax + federalIncomeTax + stateIncomeTax;
      const netTakeHome = Math.max(0, netProfit - (seTax + federalIncomeTax + stateIncomeTax));

      // Effective tax rate on side hustle profit
      const effectiveTaxRate = netProfit > 0 ? ((totalTaxLiability / netProfit) * 100).toFixed(1) : '0.0';

      // Tax savings created by business expenses
      const totalCombinedMarginalRate = 0.153 + federalMarginalRate + (stateTaxRate / 100);
      const taxSavingsFromWriteOffs = Math.round(businessExpenses * totalCombinedMarginalRate);

      // Hourly Rate Metrics
      const totalAnnualHours = hoursWorkedPerWeek * weeksPerYear;
      const grossHourlyRate = totalAnnualHours > 0 ? (grossIncome / totalAnnualHours).toFixed(2) : '0.00';
      const netHourlyRate = totalAnnualHours > 0 ? (netTakeHome / totalAnnualHours).toFixed(2) : '0.00';

      // Quarterly Estimated Tax Payment Amount
      const quarterlyPayment = Math.round(totalTaxLiability / 4);

      return {
        grossIncome,
        businessExpenses,
        netProfit,
        seTax,
        federalIncomeTax,
        stateIncomeTax,
        totalTaxLiability,
        netTakeHome,
        effectiveTaxRate: Number(effectiveTaxRate),
        taxSavingsFromWriteOffs,
        grossHourlyRate: Number(grossHourlyRate),
        netHourlyRate: Number(netHourlyRate),
        totalAnnualHours,
        quarterlyPayment
      };
    }
  };

  global.SideHustleEngine = SideHustleEngine;
})(typeof window !== 'undefined' ? window : this);
