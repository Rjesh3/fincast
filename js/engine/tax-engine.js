/**
 * FinCast Financial Engine - US Tax & Take-Home Pay Simulator
 * 2026/2027 Federal tax brackets, standard deductions, FICA, pre-tax 401(k)/HSA deductions & state tax models.
 */

(function (global) {
  'use strict';

  const TaxEngine = {
    // 2026 Federal Tax Brackets (Standard Progressive Model)
    brackets2026: {
      single: [
        { upTo: 11925, rate: 0.10 },
        { upTo: 48475, rate: 0.12 },
        { upTo: 103350, rate: 0.22 },
        { upTo: 197300, rate: 0.24 },
        { upTo: 250525, rate: 0.32 },
        { upTo: 626350, rate: 0.35 },
        { upTo: Infinity, rate: 0.37 }
      ],
      married: [
        { upTo: 23850, rate: 0.10 },
        { upTo: 96950, rate: 0.12 },
        { upTo: 206700, rate: 0.22 },
        { upTo: 394600, rate: 0.24 },
        { upTo: 501050, rate: 0.32 },
        { upTo: 751600, rate: 0.35 },
        { upTo: Infinity, rate: 0.37 }
      ]
    },

    standardDeductions2026: {
      single: 15000,
      married: 30000
    },

    ficaRates: {
      socialSecurityRate: 0.062,
      socialSecurityWageCap2026: 176100,
      medicareRate: 0.0145,
      additionalMedicareThreshold: 200000,
      additionalMedicareRate: 0.009
    },

    /**
     * Calculates complete federal, FICA, state, and take-home pay
     * @param {Object} options
     * @param {number} options.grossAnnualIncome - Gross salary ($)
     * @param {string} options.filingStatus - 'single' | 'married'
     * @param {number} options.preTax401k - Annual 401(k) pre-tax contribution ($)
     * @param {number} options.preTaxHsaFsa - Annual HSA/FSA pre-tax contribution ($)
     * @param {number} options.stateTaxRatePercent - Estimated state tax rate (%)
     */
    calculateTakeHomePay: function (options) {
      const grossIncome = Math.max(0, Number(options.grossAnnualIncome) || 85000);
      const status = options.filingStatus === 'married' ? 'married' : 'single';
      const preTax401k = Math.max(0, Math.min(23500, Number(options.preTax401k) || 0));
      const preTaxHsaFsa = Math.max(0, Math.min(8300, Number(options.preTaxHsaFsa) || 0));
      const stateTaxPercent = Math.max(0, Math.min(15, Number(options.stateTaxRatePercent) || 4.5));

      const totalPreTaxDeductions = preTax401k + preTaxHsaFsa;
      const adjustedGrossIncome = Math.max(0, grossIncome - totalPreTaxDeductions);
      const standardDeduction = this.standardDeductions2026[status];
      const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

      // 1. Calculate Federal Income Tax
      let federalTaxOwed = 0;
      let prevLimit = 0;
      const brackets = this.brackets2026[status];

      for (let bracket of brackets) {
        if (taxableIncome > prevLimit) {
          const taxableInBracket = Math.min(taxableIncome, bracket.upTo) - prevLimit;
          federalTaxOwed += taxableInBracket * bracket.rate;
          prevLimit = bracket.upTo;
        } else {
          break;
        }
      }

      // 2. Calculate FICA (Social Security & Medicare)
      const ssTaxableWages = Math.min(grossIncome, this.ficaRates.socialSecurityWageCap2026);
      const socialSecurityTax = ssTaxableWages * this.ficaRates.socialSecurityRate;
      let medicareTax = grossIncome * this.ficaRates.medicareRate;

      if (grossIncome > this.ficaRates.additionalMedicareThreshold) {
        medicareTax += (grossIncome - this.ficaRates.additionalMedicareThreshold) * this.ficaRates.additionalMedicareRate;
      }
      const totalFicaTax = socialSecurityTax + medicareTax;

      // 3. State Income Tax
      const stateTaxOwed = adjustedGrossIncome * (stateTaxPercent / 100);

      // 4. Net Take-Home Pay
      const totalTaxBurden = federalTaxOwed + totalFicaTax + stateTaxOwed;
      const netAnnualTakeHome = Math.max(0, grossIncome - totalTaxBurden - totalPreTaxDeductions);
      const effectiveTaxRate = grossIncome > 0 ? ((totalTaxBurden / grossIncome) * 100).toFixed(1) : 0;

      return {
        grossAnnualIncome: Math.round(grossIncome),
        federalTax: Math.round(federalTaxOwed),
        socialSecurityTax: Math.round(socialSecurityTax),
        medicareTax: Math.round(medicareTax),
        totalFicaTax: Math.round(totalFicaTax),
        stateTax: Math.round(stateTaxOwed),
        preTaxDeductions: Math.round(totalPreTaxDeductions),
        totalTaxBurden: Math.round(totalTaxBurden),
        netAnnualTakeHome: Math.round(netAnnualTakeHome),
        monthlyTakeHome: Math.round(netAnnualTakeHome / 12),
        biWeeklyTakeHome: Math.round(netAnnualTakeHome / 26),
        weeklyTakeHome: Math.round(netAnnualTakeHome / 52),
        effectiveTaxRate: effectiveTaxRate
      };
    }
  };

  global.TaxEngine = TaxEngine;
})(typeof window !== 'undefined' ? window : this);
