/**
 * FinCast Financial Engine - Rent vs Buy Home Simulator
 * Multi-factor long-term net worth comparison between purchasing a home vs renting & investing the difference.
 */

(function (global) {
  'use strict';

  const RentVsBuyEngine = {
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
     * Simulates 30-year wealth trajectories for Renting vs Buying
     */
    compareRentVsBuy: function (options) {
      // Buy Parameters
      const homePrice = Math.max(50000, Number(options.homePrice) || 400000);
      const downPaymentPercent = Math.max(0, Math.min(100, Number(options.downPaymentPercent) || 20));
      const mortgageRate = Math.max(0.1, Number(options.mortgageRate) || 6.5);
      const loanTermYears = 30;
      const homeAppreciationRate = Math.max(0, Number(options.homeAppreciationRate) || 3.5);
      const propertyTaxRate = Math.max(0, Number(options.propertyTaxRate) || 1.2);
      const maintenanceRate = Math.max(0, Number(options.maintenanceRate) || 1.0);
      const annualInsurance = Math.max(0, Number(options.annualInsurance) || 1500);

      // Rent Parameters
      const initialMonthlyRent = Math.max(100, Number(options.monthlyRent) || 2200);
      const rentInflationRate = Math.max(0, Number(options.rentInflationRate) || 3.0);
      const stockMarketReturn = Math.max(0, Number(options.stockMarketReturn) || 8.0);
      const simulationYears = Math.max(1, Math.min(30, Number(options.simulationYears) || 15));

      const downPayment = Math.round(homePrice * (downPaymentPercent / 100));
      const closingCosts = Math.round(homePrice * 0.03); // ~3% buyer closing costs
      const initialCapital = downPayment + closingCosts;
      const loanAmount = Math.max(0, homePrice - downPayment);

      // Monthly Principal & Interest payment formula
      const monthlyRate = (mortgageRate / 100) / 12;
      const totalPayments = loanTermYears * 12;
      const monthlyMortgagePI = loanAmount > 0 
        ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1))
        : 0;

      let homeValue = homePrice;
      let remainingLoanBalance = loanAmount;

      let renterPortfolio = initialCapital; // Renter invests down payment + closing costs
      let currentRent = initialMonthlyRent;

      const yearlySchedule = [];
      let crossoverYear = null;

      for (let yr = 1; yr <= simulationYears; yr++) {
        // Update Homeowner State
        homeValue *= (1 + homeAppreciationRate / 100);

        // Amortize 12 months of mortgage
        for (let m = 1; m <= 12; m++) {
          if (remainingLoanBalance > 0) {
            const interest = remainingLoanBalance * monthlyRate;
            const principal = Math.min(remainingLoanBalance, monthlyMortgagePI - interest);
            remainingLoanBalance -= principal;
          }
        }

        // Annual Out-of-pocket ownership costs
        const annualPropTax = homeValue * (propertyTaxRate / 100);
        const annualMaint = homeValue * (maintenanceRate / 100);
        const totalAnnualBuyCost = (monthlyMortgagePI * 12) + annualPropTax + annualMaint + annualInsurance;
        const monthlyBuyCost = Math.round(totalAnnualBuyCost / 12);

        // Renter annual out-of-pocket costs
        const annualRentCost = currentRent * 12;
        const monthlyRentCost = Math.round(currentRent);

        // Cash flow difference (if buying is more expensive, renter invests the monthly difference)
        const monthlyDiff = monthlyBuyCost - monthlyRentCost;
        if (monthlyDiff > 0) {
          // Renter invests extra monthly savings
          for (let m = 1; m <= 12; m++) {
            renterPortfolio += monthlyDiff;
            renterPortfolio *= (1 + (stockMarketReturn / 100) / 12);
          }
        } else {
          // Growth on existing portfolio
          renterPortfolio *= (1 + stockMarketReturn / 100);
        }

        // Inflate rent for next year
        currentRent *= (1 + rentInflationRate / 100);

        // Net Equity Homeowner (Home value - loan balance - estimated 6% selling costs)
        const buyerNetWorth = Math.round(homeValue - remainingLoanBalance - (homeValue * 0.06));
        const renterNetWorth = Math.round(renterPortfolio);

        if (buyerNetWorth > renterNetWorth && crossoverYear === null) {
          crossoverYear = yr;
        }

        yearlySchedule.push({
          year: yr,
          homeValue: Math.round(homeValue),
          loanBalance: Math.round(remainingLoanBalance),
          buyerNetWorth,
          renterNetWorth,
          monthlyBuyCost,
          monthlyRentCost
        });
      }

      const finalBuyerNW = yearlySchedule[yearlySchedule.length - 1].buyerNetWorth;
      const finalRenterNW = yearlySchedule[yearlySchedule.length - 1].renterNetWorth;

      return {
        initialCapital,
        downPayment,
        monthlyMortgagePI,
        crossoverYear,
        finalBuyerNW,
        finalRenterNW,
        winner: finalBuyerNW >= finalRenterNW ? 'Buying' : 'Renting & Investing',
        difference: Math.abs(finalBuyerNW - finalRenterNW),
        yearlySchedule
      };
    }
  };

  global.RentVsBuyEngine = RentVsBuyEngine;
})(typeof window !== 'undefined' ? window : this);
