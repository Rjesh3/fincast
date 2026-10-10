/**
 * FinCast Financial Engine - Debt Payoff & Decision Simulator
 * Mathematically rigorous amortization schedules, Avalanche vs Snowball, & What-If Delta Analysis.
 */

(function (global) {
  'use strict';

  const DebtEngine = {
    /**
     * Formats currency with commas and sensible decimal rules
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
     * Formats date as Month Year (e.g., September 2028)
     */
    formatDateOffset: function (monthsFromNow) {
      const now = new Date();
      now.setMonth(now.getMonth() + Math.ceil(monthsFromNow));
      return now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    },

    /**
     * Calculates single debt amortization
     * @param {number} balance - Current principal balance ($)
     * @param {number} apr - Annual Percentage Rate (%)
     * @param {number} monthlyPayment - Scheduled monthly payment ($)
     * @param {number} extraMonthlyPayment - Extra monthly payment applied ($)
     * @returns {Object} Amortization summary and schedule
     */
    calculateSingleDebt: function (balance, apr, monthlyPayment, extraMonthlyPayment = 0) {
      balance = Math.max(0, Number(balance) || 0);
      apr = Math.max(0, Number(apr) || 0);
      monthlyPayment = Math.max(0, Number(monthlyPayment) || 0);
      extraMonthlyPayment = Math.max(0, Number(extraMonthlyPayment) || 0);

      const totalPayment = monthlyPayment + extraMonthlyPayment;
      const monthlyRate = (apr / 100) / 12;

      // Edge case: Zero balance
      if (balance === 0) {
        return {
          totalMonths: 0,
          totalInterest: 0,
          totalPaid: 0,
          debtFreeDate: this.formatDateOffset(0),
          isInfinite: false,
          monthlySchedule: [],
          yearlySchedule: []
        };
      }

      // Edge case: Monthly payment doesn't even cover the first month's interest
      const firstMonthInterest = balance * monthlyRate;
      if (monthlyRate > 0 && totalPayment <= firstMonthInterest) {
        return {
          totalMonths: Infinity,
          totalInterest: Infinity,
          totalPaid: Infinity,
          debtFreeDate: 'Never (Payment too low)',
          isInfinite: true,
          monthlySchedule: [],
          yearlySchedule: []
        };
      }

      let currentBalance = balance;
      let totalInterestPaid = 0;
      let months = 0;
      const maxMonthsLimit = 1200; // 100 years safeguard

      const monthlySchedule = [];
      const yearlySchedule = [];
      let yearInterestAccumulator = 0;
      let yearPrincipalAccumulator = 0;

      while (currentBalance > 0.01 && months < maxMonthsLimit) {
        months++;
        const interestForMonth = currentBalance * monthlyRate;
        let principalForMonth = totalPayment - interestForMonth;

        if (principalForMonth > currentBalance) {
          principalForMonth = currentBalance;
        }

        totalInterestPaid += interestForMonth;
        currentBalance -= principalForMonth;
        yearInterestAccumulator += interestForMonth;
        yearPrincipalAccumulator += principalForMonth;

        monthlySchedule.push({
          month: months,
          payment: principalForMonth + interestForMonth,
          principal: principalForMonth,
          interest: interestForMonth,
          remainingBalance: Math.max(0, currentBalance)
        });

        if (months % 12 === 0 || currentBalance <= 0.01) {
          yearlySchedule.push({
            year: Math.ceil(months / 12),
            monthsCount: months,
            interestPaid: yearInterestAccumulator,
            principalPaid: yearPrincipalAccumulator,
            remainingBalance: Math.max(0, currentBalance)
          });
          yearInterestAccumulator = 0;
          yearPrincipalAccumulator = 0;
        }
      }

      return {
        totalMonths: months,
        totalInterest: Math.round(totalInterestPaid),
        totalPaid: Math.round(balance + totalInterestPaid),
        debtFreeDate: this.formatDateOffset(months),
        isInfinite: months >= maxMonthsLimit,
        monthlySchedule: monthlySchedule,
        yearlySchedule: yearlySchedule
      };
    },

    /**
     * Simulates multiple debts payoff using Avalanche (highest APR first) or Snowball (lowest balance first)
     * @param {Array} debts - Array of { name, balance, apr, minPayment }
     * @param {number} extraMonthlyPayment - Extra monthly cash available to accelerate
     * @param {string} strategy - 'avalanche' | 'snowball'
     */
    simulateMultipleDebts: function (debts, extraMonthlyPayment = 0, strategy = 'avalanche') {
      if (!debts || debts.length === 0) {
        return this.calculateSingleDebt(0, 0, 0, 0);
      }

      // Clone debts to avoid mutation
      const activeDebts = debts.map((d, index) => ({
        id: index + 1,
        name: d.name || `Debt ${index + 1}`,
        balance: Math.max(0, Number(d.balance) || 0),
        apr: Math.max(0, Number(d.apr) || 0),
        minPayment: Math.max(0, Number(d.minPayment) || 0)
      })).filter(d => d.balance > 0);

      if (activeDebts.length === 0) {
        return this.calculateSingleDebt(0, 0, 0, 0);
      }

      const initialTotalBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);
      const totalMinPayment = activeDebts.reduce((sum, d) => sum + d.minPayment, 0);

      let months = 0;
      let totalInterestPaid = 0;
      const maxMonthsLimit = 1200;
      const yearlyProgress = [];
      let freedUpMonthlyCash = 0;

      while (activeDebts.some(d => d.balance > 0.01) && months < maxMonthsLimit) {
        months++;

        // 1. Accrue interest on all open debts
        for (let d of activeDebts) {
          if (d.balance > 0.01) {
            const monthlyRate = (d.apr / 100) / 12;
            const interest = d.balance * monthlyRate;
            d.balance += interest;
            totalInterestPaid += interest;
          }
        }

        // 2. Pay minimums first
        for (let d of activeDebts) {
          if (d.balance > 0.01) {
            const pay = Math.min(d.minPayment, d.balance);
            d.balance -= pay;
          }
        }

        // 3. Determine target debt for extra + snowball rolled cash
        let availableExtra = extraMonthlyPayment + freedUpMonthlyCash;

        // Sort candidates
        const remaining = activeDebts.filter(d => d.balance > 0.01);
        if (remaining.length > 0) {
          if (strategy === 'snowball') {
            remaining.sort((a, b) => a.balance - b.balance); // Smallest balance first
          } else {
            remaining.sort((a, b) => b.apr - a.apr); // Highest APR first (Avalanche)
          }

          for (let target of remaining) {
            if (availableExtra <= 0) break;
            const payExtra = Math.min(availableExtra, target.balance);
            target.balance -= payExtra;
            availableExtra -= payExtra;

            if (target.balance <= 0.01) {
              freedUpMonthlyCash += target.minPayment;
            }
          }
        }

        if (months % 12 === 0 || !activeDebts.some(d => d.balance > 0.01)) {
          const currentTotalRemaining = activeDebts.reduce((sum, d) => sum + Math.max(0, d.balance), 0);
          yearlyProgress.push({
            year: Math.ceil(months / 12),
            monthsCount: months,
            totalRemaining: Math.round(currentTotalRemaining),
            totalInterestSoFar: Math.round(totalInterestPaid)
          });
        }
      }

      return {
        totalMonths: months,
        totalInterest: Math.round(totalInterestPaid),
        totalPaid: Math.round(initialTotalBalance + totalInterestPaid),
        initialBalance: Math.round(initialTotalBalance),
        totalMinPayment: Math.round(totalMinPayment),
        debtFreeDate: this.formatDateOffset(months),
        isInfinite: months >= maxMonthsLimit,
        yearlyProgress: yearlyProgress,
        strategy: strategy
      };
    },

    /**
     * Calculates signature "What If?" comparison between Current Plan and Accelerated Plan
     */
    compareWhatIf: function (balance, apr, currentMonthlyPayment, extraMonthlyPayment) {
      const currentPlan = this.calculateSingleDebt(balance, apr, currentMonthlyPayment, 0);
      const acceleratedPlan = this.calculateSingleDebt(balance, apr, currentMonthlyPayment, extraMonthlyPayment);

      const interestSaved = Math.max(0, currentPlan.totalInterest - acceleratedPlan.totalInterest);
      const monthsSaved = Math.max(0, currentPlan.totalMonths - acceleratedPlan.totalMonths);
      const yearsSaved = (monthsSaved / 12).toFixed(1);

      return {
        currentPlan,
        acceleratedPlan,
        interestSaved: Math.round(interestSaved),
        monthsSaved: monthsSaved,
        yearsSaved: yearsSaved,
        percentInterestSaved: currentPlan.totalInterest > 0 
          ? Math.round((interestSaved / currentPlan.totalInterest) * 100) 
          : 0
      };
    }
  };

  global.DebtEngine = DebtEngine;
})(typeof window !== 'undefined' ? window : this);
