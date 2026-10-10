/**
 * FinCast Financial Engine - Financial Health Score Model
 * Transparent 6-pillar composite wellness algorithm & prioritized next-step action generator.
 */

(function (global) {
  'use strict';

  const HealthScoreEngine = {
    /**
     * Evaluates full financial health profile
     * @param {Object} data - User financial inputs
     */
    evaluateHealth: function (data) {
      const age = Math.max(18, Math.min(100, Number(data.age) || 30));
      const annualIncome = Math.max(1, Number(data.annualIncome) || 75000);
      const monthlyIncome = annualIncome / 12;
      const monthlyExpenses = Math.max(0, Number(data.monthlyExpenses) || 3500);
      const emergencyFund = Math.max(0, Number(data.emergencyFund) || 10000);
      const totalDebt = Math.max(0, Number(data.debt) || 15000);
      const creditUtilization = Math.max(0, Math.min(100, Number(data.creditUtilization) || 25));
      const monthlyDebtPayments = Math.max(0, Number(data.monthlyDebtPayments) || 500);
      const monthlyRetirementContributions = Math.max(0, Number(data.retirementContributions) || 500);
      const totalSavingsBalance = Math.max(0, Number(data.savings) || 25000);

      // --- Pillar 1: Emergency Fund Coverage (Weight: 20%) ---
      // Benchmark: 3 to 6 months of basic living expenses
      const expenseCoverageMonths = monthlyExpenses > 0 ? (emergencyFund / monthlyExpenses) : 6;
      let emergencyScore = 0;
      let emergencyStatus = 'critical';
      let emergencyFeedback = '';

      if (expenseCoverageMonths >= 6) {
        emergencyScore = 100;
        emergencyStatus = 'good';
        emergencyFeedback = `Excellent: ${expenseCoverageMonths.toFixed(1)} months of emergency runway.`;
      } else if (expenseCoverageMonths >= 3) {
        emergencyScore = 75 + ((expenseCoverageMonths - 3) / 3) * 25;
        emergencyStatus = 'good';
        emergencyFeedback = `Healthy: ${expenseCoverageMonths.toFixed(1)} months of expenses saved.`;
      } else if (expenseCoverageMonths >= 1) {
        emergencyScore = 40 + ((expenseCoverageMonths - 1) / 2) * 35;
        emergencyStatus = 'attention';
        emergencyFeedback = `Moderate: ${expenseCoverageMonths.toFixed(1)} months cushion. Target 3-6 months.`;
      } else {
        emergencyScore = Math.max(10, expenseCoverageMonths * 40);
        emergencyStatus = 'critical';
        emergencyFeedback = `Vulnerable: Under 1 month cushion. Build a $1,000 starter buffer first.`;
      }

      // --- Pillar 2: Debt-to-Income (DTI) Burden (Weight: 20%) ---
      // Benchmark: Monthly debt payments / Monthly gross income
      const dtiRatio = (monthlyDebtPayments / monthlyIncome) * 100;
      let debtScore = 0;
      let debtStatus = 'critical';
      let debtFeedback = '';

      if (dtiRatio <= 15) {
        debtScore = 100 - (dtiRatio / 15) * 15;
        debtStatus = 'good';
        debtFeedback = `Great: Debt payments are only ${dtiRatio.toFixed(0)}% of income (Under 15%).`;
      } else if (dtiRatio <= 30) {
        debtScore = 85 - ((dtiRatio - 15) / 15) * 25;
        debtStatus = 'good';
        debtFeedback = `Manageable: Debt load is ${dtiRatio.toFixed(0)}% of income.`;
      } else if (dtiRatio <= 45) {
        debtScore = 60 - ((dtiRatio - 30) / 15) * 30;
        debtStatus = 'attention';
        debtFeedback = `Elevated: ${dtiRatio.toFixed(0)}% of monthly cash flow goes to debt payments.`;
      } else {
        debtScore = Math.max(10, 30 - ((dtiRatio - 45) / 20) * 20);
        debtStatus = 'critical';
        debtFeedback = `Heavy Burden: ${dtiRatio.toFixed(0)}% DTI ratio restricts wealth building.`;
      }

      // --- Pillar 3: Cash Flow Margin (Weight: 15%) ---
      // Net cash flow = Monthly Income - Monthly Expenses - Monthly Debt Payments
      const freeMonthlyCash = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
      const cashFlowMargin = (freeMonthlyCash / monthlyIncome) * 100;
      let cashFlowScore = 0;
      let cashFlowStatus = 'critical';
      let cashFlowFeedback = '';

      if (cashFlowMargin >= 20) {
        cashFlowScore = 100;
        cashFlowStatus = 'good';
        cashFlowFeedback = `Strong surplus: Saving ${cashFlowMargin.toFixed(0)}% of monthly income.`;
      } else if (cashFlowMargin >= 10) {
        cashFlowScore = 80;
        cashFlowStatus = 'good';
        cashFlowFeedback = `Positive cash flow: ${cashFlowMargin.toFixed(0)}% buffer remaining.`;
      } else if (cashFlowMargin > 0) {
        cashFlowScore = 55;
        cashFlowStatus = 'attention';
        cashFlowFeedback = `Tight margin: Only $${Math.round(freeMonthlyCash)} leftover monthly.`;
      } else {
        cashFlowScore = 20;
        cashFlowStatus = 'critical';
        cashFlowFeedback = `Negative cash flow: Expenses exceed income by $${Math.abs(Math.round(freeMonthlyCash))}/mo.`;
      }

      // --- Pillar 4: Savings & Investment Rate (Weight: 15%) ---
      const totalMonthlySavings = monthlyRetirementContributions + Math.max(0, freeMonthlyCash * 0.5);
      const savingsRate = (totalMonthlySavings / monthlyIncome) * 100;
      let savingsScore = 0;
      let savingsStatus = 'critical';
      let savingsFeedback = '';

      if (savingsRate >= 20) {
        savingsScore = 100;
        savingsStatus = 'good';
        savingsFeedback = `Exceptional: Saving & investing ${savingsRate.toFixed(0)}% of income.`;
      } else if (savingsRate >= 15) {
        savingsScore = 85;
        savingsStatus = 'good';
        savingsFeedback = `Solid: Meeting standard 15% retirement & savings targets.`;
      } else if (savingsRate >= 8) {
        savingsScore = 65;
        savingsStatus = 'attention';
        savingsFeedback = `Moderate: Saving ${savingsRate.toFixed(0)}%. Strive to bump by 1-2% annually.`;
      } else {
        savingsScore = Math.max(15, savingsRate * 6);
        savingsStatus = 'critical';
        savingsFeedback = `Low: Under 8% savings rate limits long-term compounding.`;
      }

      // --- Pillar 5: Retirement Readiness (Weight: 15%) ---
      // Benchmark based on Fidelity/SEC guidelines: Age 30: 1x salary, Age 40: 3x, Age 50: 6x, Age 60: 8x
      let expectedMultiple = 1.0;
      if (age < 30) expectedMultiple = 0.5;
      else if (age <= 35) expectedMultiple = 1.5;
      else if (age <= 45) expectedMultiple = 3.5;
      else if (age <= 55) expectedMultiple = 6.0;
      else expectedMultiple = 8.0;

      const targetRetirementBalance = annualIncome * expectedMultiple;
      const retirementRatio = targetRetirementBalance > 0 ? (totalSavingsBalance / targetRetirementBalance) : 1;
      let retirementScore = 0;
      let retirementStatus = 'critical';
      let retirementFeedback = '';

      if (retirementRatio >= 1.0) {
        retirementScore = 100;
        retirementStatus = 'good';
        retirementFeedback = `On Track: Nest egg meets or exceeds the ${expectedMultiple}x salary benchmark for age ${age}.`;
      } else if (retirementRatio >= 0.65) {
        retirementScore = 75;
        retirementStatus = 'good';
        retirementFeedback = `Moderate Progress: ${(retirementRatio * 100).toFixed(0)}% toward target balance.`;
      } else if (retirementRatio >= 0.35) {
        retirementScore = 50;
        retirementStatus = 'attention';
        retirementFeedback = `Behind Benchmark: Aim to capture 401(k) company match and automate contributions.`;
      } else {
        retirementScore = Math.max(15, retirementRatio * 100);
        retirementStatus = 'critical';
        retirementFeedback = `Underfunded: Significantly below benchmark for age ${age}.`;
      }

      // --- Pillar 6: Credit Utilization (Weight: 15%) ---
      // Benchmark: <10% best, 10-30% good, >30% hurts credit score
      let creditScore = 0;
      let creditStatus = 'critical';
      let creditFeedback = '';

      if (creditUtilization <= 10) {
        creditScore = 100;
        creditStatus = 'good';
        creditFeedback = `Optimal: ${creditUtilization}% utilization boosts FICO score.`;
      } else if (creditUtilization <= 30) {
        creditScore = 80;
        creditStatus = 'good';
        creditFeedback = `Acceptable: ${creditUtilization}% utilization stays within the recommended 30% ceiling.`;
      } else if (creditUtilization <= 50) {
        creditScore = 50;
        creditStatus = 'attention';
        creditFeedback = `Elevated: ${creditUtilization}% utilization may suppress credit scores.`;
      } else {
        creditScore = 25;
        creditStatus = 'critical';
        creditFeedback = `Critical: ${creditUtilization}% utilization heavily penalizes credit profile.`;
      }

      // --- Composite Weighted Score (0 to 100) ---
      const compositeScore = Math.round(
        (emergencyScore * 0.20) +
        (debtScore * 0.20) +
        (cashFlowScore * 0.15) +
        (savingsScore * 0.15) +
        (retirementScore * 0.15) +
        (creditScore * 0.15)
      );

      let overallStatus = 'critical';
      let overallLabel = 'Needs Urgent Action';
      let overallColor = '#EF4444';

      if (compositeScore >= 80) {
        overallStatus = 'good';
        overallLabel = 'Excellent Financial Standing';
        overallColor = '#10B981';
      } else if (compositeScore >= 60) {
        overallStatus = 'attention';
        overallLabel = 'Solid with Growth Opportunities';
        overallColor = '#F59E0B';
      } else {
        overallStatus = 'critical';
        overallLabel = 'High Priority Action Needed';
        overallColor = '#EF4444';
      }

      // --- Actionable Top 3 Next Steps Generator ---
      const pillars = [
        { name: 'Emergency Fund', score: emergencyScore, status: emergencyStatus, pillar: 'emergency' },
        { name: 'Debt Burden', score: debtScore, status: debtStatus, pillar: 'debt' },
        { name: 'Cash Flow', score: cashFlowScore, status: cashFlowStatus, pillar: 'cashFlow' },
        { name: 'Savings Rate', score: savingsScore, status: savingsStatus, pillar: 'savings' },
        { name: 'Retirement Readiness', score: retirementScore, status: retirementStatus, pillar: 'retirement' },
        { name: 'Credit Utilization', score: creditScore, status: creditStatus, pillar: 'credit' }
      ];

      // Sort by lowest score to prioritize urgent actions
      pillars.sort((a, b) => a.score - b.score);

      const actionLibrary = {
        emergency: {
          title: 'Establish a 3-6 Month High-Yield Cash Reserve',
          description: `You currently have ${expenseCoverageMonths.toFixed(1)} months of coverage. Automate direct deposits into a high-yield savings account (HYSA) to reach at least $${Math.round(monthlyExpenses * 3).toLocaleString()} before aggressive investing.`
        },
        debt: {
          title: 'Deploy an Accelerated Debt Payoff Strategy',
          description: `With a ${dtiRatio.toFixed(0)}% DTI ratio, test our Debt Freedom Simulator to see how an extra $100-$200/month accelerates payoff using the Debt Avalanche method.`
        },
        cashFlow: {
          title: 'Audit Recurring Subscriptions & Fixed Overhead',
          description: `Your monthly cash margin is ${cashFlowMargin.toFixed(0)}%. Identify 2-3 discretionary recurring expenses to free up an immediate $150/month in free cash flow.`
        },
        savings: {
          title: 'Step Up Monthly Savings by 1% Every Quarter',
          description: `Gradually escalate your savings rate from ${savingsRate.toFixed(0)}% toward 20% by redirecting future raises or tax refunds automatically.`
        },
        retirement: {
          title: 'Maximize Employer 401(k) Match & Open a Roth IRA',
          description: `Bridge your retirement gap by ensuring you capture 100% of any employer matching funds, then set up automatic monthly index fund investments.`
        },
        credit: {
          title: 'Lower Revolving Balances Below 10-30%',
          description: `Your credit utilization is ${creditUtilization}%. Make bi-weekly payments before statement closing dates or request a credit limit increase to lower utilization.`
        }
      };

      const top3Steps = pillars.slice(0, 3).map(p => actionLibrary[p.pillar]);

      return {
        score: compositeScore,
        status: overallStatus,
        statusLabel: overallLabel,
        statusColor: overallColor,
        pillars: {
          emergency: { name: 'Emergency Fund', score: Math.round(emergencyScore), status: emergencyStatus, feedback: emergencyFeedback },
          debt: { name: 'Debt Burden', score: Math.round(debtScore), status: debtStatus, feedback: debtFeedback },
          cashFlow: { name: 'Cash Flow', score: Math.round(cashFlowScore), status: cashFlowStatus, feedback: cashFlowFeedback },
          savings: { name: 'Savings Rate', score: Math.round(savingsScore), status: savingsStatus, feedback: savingsFeedback },
          retirement: { name: 'Retirement', score: Math.round(retirementScore), status: retirementStatus, feedback: retirementFeedback },
          credit: { name: 'Credit Utilization', score: Math.round(creditScore), status: creditStatus, feedback: creditFeedback }
        },
        top3Steps: top3Steps
      };
    }
  };

  global.HealthScoreEngine = HealthScoreEngine;
})(typeof window !== 'undefined' ? window : this);
