/**
 * FinCast Financial Engine - Financial Resilience & Crisis Stress-Test Simulator
 * Simulates survival runways against job loss, medical emergencies, inflation spikes, and income drops.
 */

(function (global) {
  'use strict';

  const ResilienceEngine = {
    /**
     * Simulates financial shock
     * @param {Object} data
     */
    simulateShock: function (data) {
      const liquidSavings = Math.max(0, Number(data.liquidSavings) || 12000);
      const monthlyIncome = Math.max(1, Number(data.monthlyIncome) || 5500);
      const monthlyEssentialExpenses = Math.max(1, Number(data.monthlyEssentialExpenses) || 3200);
      const monthlyDiscretionary = Math.max(0, Number(data.monthlyDiscretionary) || 1000);
      const shockType = data.shockType || 'job_loss'; // 'job_loss' | 'medical_emergency' | 'income_drop' | 'inflation_spike'
      const unemploymentAssistance = Math.max(0, Number(data.unemploymentAssistance) || 1600);

      let adjustedSavings = liquidSavings;
      let adjustedMonthlyIncome = monthlyIncome;
      let adjustedExpenses = monthlyEssentialExpenses; // In crisis, discretionary is immediately trimmed

      let shockTitle = '';
      let shockDescription = '';

      switch (shockType) {
        case 'job_loss':
          shockTitle = 'Complete Job Loss / Unemployment';
          adjustedMonthlyIncome = unemploymentAssistance;
          shockDescription = `Income drops to $${unemploymentAssistance.toLocaleString()}/mo state unemployment. Discretionary spending cut to $0.`;
          break;
        case 'medical_emergency':
          shockTitle = '$6,000 Unexpected Medical Emergency';
          adjustedSavings = Math.max(0, liquidSavings - 6000);
          shockDescription = `Immediate $6,000 deduction from liquid emergency fund. Income remains steady.`;
          break;
        case 'income_drop':
          shockTitle = '25% Pay Cut / Reduced Hours';
          adjustedMonthlyIncome = monthlyIncome * 0.75;
          shockDescription = `Gross monthly income drops by 25% ($${Math.round(monthlyIncome * 0.25).toLocaleString()}/mo reduction).`;
          break;
        case 'inflation_spike':
          shockTitle = '+15% Core Expense Inflation Surge';
          adjustedExpenses = monthlyEssentialExpenses * 1.15;
          shockDescription = `Essential grocery, utility, and insurance costs escalate by 15% ($${Math.round(monthlyEssentialExpenses * 0.15).toLocaleString()}/mo increase).`;
          break;
      }

      const monthlyNetBurn = adjustedExpenses - adjustedMonthlyIncome;
      let runwayMonths = 0;

      if (monthlyNetBurn <= 0) {
        runwayMonths = 999; // Surplus persists even after shock
      } else {
        runwayMonths = (adjustedSavings / monthlyNetBurn).toFixed(1);
      }

      let grade = 'vulnerable';
      let gradeLabel = 'High Vulnerability';
      let gradeColor = '#EF4444';

      if (runwayMonths >= 12 || runwayMonths === 999) {
        grade = 'bulletproof';
        gradeLabel = 'Bulletproof Resilience (12+ Months)';
        gradeColor = '#10B981';
      } else if (runwayMonths >= 6) {
        grade = 'sturdy';
        gradeLabel = 'Strong Buffer (6-12 Months)';
        gradeColor = '#38BDF8';
      } else if (runwayMonths >= 3) {
        grade = 'moderate';
        gradeLabel = 'Moderate Buffer (3-6 Months)';
        gradeColor = '#F59E0B';
      } else {
        grade = 'vulnerable';
        gradeLabel = 'Immediate Risk (<3 Months)';
        gradeColor = '#EF4444';
      }

      return {
        shockType: shockType,
        shockTitle: shockTitle,
        shockDescription: shockDescription,
        adjustedSavings: Math.round(adjustedSavings),
        monthlyNetBurn: Math.max(0, Math.round(monthlyNetBurn)),
        runwayMonths: runwayMonths === 999 ? 'Indefinite (Positive Cashflow)' : `${runwayMonths} Months`,
        grade: grade,
        gradeLabel: gradeLabel,
        gradeColor: gradeColor,
        target6MonthBuffer: Math.round(monthlyEssentialExpenses * 6)
      };
    }
  };

  global.ResilienceEngine = ResilienceEngine;
})(typeof window !== 'undefined' ? window : this);
