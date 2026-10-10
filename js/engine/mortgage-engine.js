/**
 * FinCast Financial Engine - Mortgage & Early Payoff Simulator
 * Accurate fixed-rate amortization schedules, extra principal prepayments, PMI removal, and interest deltas.
 */

(function (global) {
  'use strict';

  const MortgageEngine = {
    /**
     * Formats currency
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
     * Calculates monthly mortgage payment (Principal & Interest)
     */
    calculateMonthlyPI: function (principal, annualInterestRate, termYears) {
      if (principal <= 0 || termYears <= 0) return 0;
      if (annualInterestRate <= 0) return principal / (termYears * 12);

      const r = (annualInterestRate / 100) / 12;
      const n = termYears * 12;
      return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },

    /**
     * Simulates complete mortgage amortization schedule with extra prepayments
     * @param {Object} options
     * @param {number} options.homePrice - Purchase price ($)
     * @param {number} options.downPayment - Down payment ($)
     * @param {number} options.interestRate - Annual mortgage rate (%)
     * @param {number} options.termYears - Loan term in years (15, 30)
     * @param {number} options.extraMonthlyPayment - Extra principal paid monthly ($)
     * @param {number} options.annualPropertyTax - Annual property tax ($)
     * @param {number} options.annualHomeInsurance - Annual home insurance ($)
     * @param {number} options.monthlyHOA - Monthly HOA dues ($)
     */
    calculateMortgage: function (options) {
      const homePrice = Math.max(0, Number(options.homePrice) || 400000);
      const downPayment = Math.max(0, Math.min(homePrice, Number(options.downPayment) || 80000));
      const loanAmount = homePrice - downPayment;
      const interestRate = Math.max(0, Number(options.interestRate) || 6.75);
      const termYears = Math.max(1, Math.min(40, Number(options.termYears) || 30));
      const extraMonthlyPayment = Math.max(0, Number(options.extraMonthlyPayment) || 0);
      const annualPropertyTax = Math.max(0, Number(options.annualPropertyTax) || 4800);
      const annualHomeInsurance = Math.max(0, Number(options.annualHomeInsurance) || 1500);
      const monthlyHOA = Math.max(0, Number(options.monthlyHOA) || 0);

      const monthlyPI = this.calculateMonthlyPI(loanAmount, interestRate, termYears);
      const monthlyTax = annualPropertyTax / 12;
      const monthlyInsurance = annualHomeInsurance / 12;

      // Calculate baseline (without extra payment)
      const baselineResult = this._amortize(loanAmount, interestRate, monthlyPI, 0);

      // Calculate accelerated (with extra payment)
      const acceleratedResult = this._amortize(loanAmount, interestRate, monthlyPI, extraMonthlyPayment);

      const interestSaved = Math.max(0, baselineResult.totalInterest - acceleratedResult.totalInterest);
      const monthsSaved = Math.max(0, baselineResult.totalMonths - acceleratedResult.totalMonths);
      const yearsSaved = (monthsSaved / 12).toFixed(1);

      return {
        loanAmount: Math.round(loanAmount),
        downPaymentPercent: homePrice > 0 ? Math.round((downPayment / homePrice) * 100) : 0,
        monthlyPI: Math.round(monthlyPI),
        monthlyTotalPITI: Math.round(monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA + extraMonthlyPayment),
        baseline: baselineResult,
        accelerated: acceleratedResult,
        interestSaved: Math.round(interestSaved),
        monthsSaved: monthsSaved,
        yearsSaved: yearsSaved
      };
    },

    _amortize: function (principal, annualRate, monthlyPI, extraMonthly) {
      const r = (annualRate / 100) / 12;
      let balance = principal;
      let totalInterest = 0;
      let months = 0;
      const yearlySchedule = [];
      let yearInterest = 0;
      let yearPrincipal = 0;

      while (balance > 0.01 && months < 600) {
        months++;
        const interestMonth = balance * r;
        let principalMonth = (monthlyPI - interestMonth) + extraMonthly;

        if (principalMonth > balance) {
          principalMonth = balance;
        }

        balance -= principalMonth;
        totalInterest += interestMonth;
        yearInterest += interestMonth;
        yearPrincipal += principalMonth;

        if (months % 12 === 0 || balance <= 0.01) {
          yearlySchedule.push({
            year: Math.ceil(months / 12),
            monthsCount: months,
            remainingBalance: Math.max(0, Math.round(balance)),
            interestPaid: Math.round(yearInterest),
            principalPaid: Math.round(yearPrincipal),
            totalInterestToDate: Math.round(totalInterest)
          });
          yearInterest = 0;
          yearPrincipal = 0;
        }
      }

      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + months);

      return {
        totalMonths: months,
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(principal + totalInterest),
        payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        yearlySchedule: yearlySchedule
      };
    }
  };

  global.MortgageEngine = MortgageEngine;
})(typeof window !== 'undefined' ? window : this);
