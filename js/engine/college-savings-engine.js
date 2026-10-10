/**
 * FinCast Financial Engine - College Savings & 529 Plan Simulator
 * Projects future 4-year tuition with education inflation, compound growth, and state tax deduction savings.
 */

(function (global) {
  'use strict';

  const CollegeSavingsEngine = {
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
     * Calculates college savings and tuition inflation
     */
    calculateCollege: function (options) {
      const childAge = Math.max(0, Math.min(17, Number(options.childAge) || 3));
      const targetAge = 18;
      const yearsUntilCollege = Math.max(1, targetAge - childAge);

      const collegeType = options.collegeType || 'public-in-state'; // 'public-in-state', 'public-out-state', 'private'
      let currentAnnualTuition = 27000; // Average annual public in-state tuition + room/board
      if (collegeType === 'public-out-state') currentAnnualTuition = 45000;
      else if (collegeType === 'private') currentAnnualTuition = 60000;
      else if (options.customTuition) currentAnnualTuition = Number(options.customTuition);

      const tuitionInflation = Math.max(0, Number(options.tuitionInflation) || 5.0);
      const currentSavings = Math.max(0, Number(options.currentSavings) || 10000);
      const monthlyContribution = Math.max(0, Number(options.monthlyContribution) || 350);
      const investmentReturn = Math.max(0, Number(options.investmentReturn) || 7.0);
      const stateTaxDeductionRate = Math.max(0, Number(options.stateTaxDeductionRate) || 5.0);

      // Future annual tuition cost when child turns 18
      const futureAnnualTuition = currentAnnualTuition * Math.pow(1 + tuitionInflation / 100, yearsUntilCollege);
      
      // Total 4-Year College Cost (inflating each year during college)
      let total4YrCost = 0;
      for (let y = 0; y < 4; y++) {
        total4YrCost += futureAnnualTuition * Math.pow(1 + tuitionInflation / 100, y);
      }
      total4YrCost = Math.round(total4YrCost);

      // Growth of 529 portfolio over years until college
      let balance = currentSavings;
      let totalContributions = currentSavings;
      const yearlySchedule = [];

      for (let y = 1; y <= yearsUntilCollege; y++) {
        for (let m = 1; m <= 12; m++) {
          balance += monthlyContribution;
          totalContributions += monthlyContribution;
          balance += balance * ((investmentReturn / 100) / 12);
        }

        yearlySchedule.push({
          year: y,
          childAge: childAge + y,
          balance: Math.round(balance),
          totalContributions: Math.round(totalContributions),
          interestEarned: Math.round(balance - totalContributions)
        });
      }

      const final529Balance = Math.round(balance);
      const savingsGap = Math.max(0, total4YrCost - final529Balance);
      const percentCovered = Math.min(100, Math.round((final529Balance / total4YrCost) * 100));

      // Monthly deposit needed to 100% cover the cost
      // Target FV = total4YrCost - (currentSavings * (1+r)^t)
      const fvCurrentSavings = currentSavings * Math.pow(1 + investmentReturn / 100, yearsUntilCollege);
      const neededFVFromDeposits = Math.max(0, total4YrCost - fvCurrentSavings);
      const monthlyReturn = (investmentReturn / 100) / 12;
      const totalMonths = yearsUntilCollege * 12;
      const requiredMonthlyDeposit = Math.round((neededFVFromDeposits * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1));

      // Annual state tax savings from 529 contributions
      const annualStateTaxSavings = Math.round((monthlyContribution * 12) * (stateTaxDeductionRate / 100));

      return {
        yearsUntilCollege,
        futureAnnualTuition: Math.round(futureAnnualTuition),
        total4YrCost,
        final529Balance,
        totalContributions: Math.round(totalContributions),
        savingsGap,
        percentCovered,
        requiredMonthlyDeposit,
        annualStateTaxSavings,
        yearlySchedule
      };
    }
  };

  global.CollegeSavingsEngine = CollegeSavingsEngine;
})(typeof window !== 'undefined' ? window : this);
