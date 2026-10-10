/**
 * FinCast Investment & Savings "What If" Simulator Controller
 * Connects compounding inputs, step-up sliders, inflation toggles, Plan A vs Plan B and SVG Bar Charts.
 */

(function (global) {
  'use strict';

  let currentInputs = {
    initialPrincipal: 5000,
    monthlyContribution: 400,
    annualReturnRate: 8.5,
    years: 20,
    annualIncreaseRate: 3,
    compoundFrequency: 12,
    adjustForInflation: false,
    inflationRate: 2.8,
    // Comparison scenario (Plan B)
    planBMonthly: 650
  };

  let activeResult = null;

  const InvestmentTool = {
    init: function () {
      this.bindElements();
      this.calculate();

      if (global.FinCastAnalytics) {
        global.FinCastAnalytics.trackToolOpened('investment-simulator');
      }

      if (global.FinCastRelatedTools) {
        global.FinCastRelatedTools.render('related-tools-mount', 'investment-simulator');
      }
    },

    bindElements: function () {
      const initPrincipalInput = document.getElementById('inv-initial');
      const monthlyInput = document.getElementById('inv-monthly');
      const monthlySlider = document.getElementById('inv-monthly-slider');
      const returnInput = document.getElementById('inv-return');
      const returnSlider = document.getElementById('inv-return-slider');
      const yearsInput = document.getElementById('inv-years');
      const yearsSlider = document.getElementById('inv-years-slider');
      const stepUpInput = document.getElementById('inv-stepup');
      const compoundFreqSelect = document.getElementById('inv-compound-freq');
      const inflationToggle = document.getElementById('inv-inflation-toggle');

      // Plan B comparison input
      const planBMonthlyInput = document.getElementById('inv-plan-b-monthly');

      const shareBtn = document.getElementById('btn-share-inv-calc');

      // Sync Monthly slider & input
      if (monthlyInput && monthlySlider) {
        monthlySlider.addEventListener('input', (e) => {
          monthlyInput.value = e.target.value;
          currentInputs.monthlyContribution = Number(e.target.value) || 0;
          this.calculate();
          if (global.FinCastAnalytics) global.FinCastAnalytics.trackScenarioChanged('investment-simulator', 'monthly_slider');
        });
        monthlyInput.addEventListener('input', (e) => {
          monthlySlider.value = e.target.value;
          currentInputs.monthlyContribution = Math.max(0, Number(e.target.value) || 0);
          this.calculate();
        });
      }

      // Sync Return slider & input
      if (returnInput && returnSlider) {
        returnSlider.addEventListener('input', (e) => {
          returnInput.value = e.target.value;
          currentInputs.annualReturnRate = Number(e.target.value) || 0;
          this.calculate();
        });
        returnInput.addEventListener('input', (e) => {
          returnSlider.value = e.target.value;
          currentInputs.annualReturnRate = Math.max(0, Math.min(30, Number(e.target.value) || 0));
          this.calculate();
        });
      }

      // Sync Years slider & input
      if (yearsInput && yearsSlider) {
        yearsSlider.addEventListener('input', (e) => {
          yearsInput.value = e.target.value;
          currentInputs.years = Number(e.target.value) || 1;
          this.calculate();
        });
        yearsInput.addEventListener('input', (e) => {
          yearsSlider.value = e.target.value;
          currentInputs.years = Math.max(1, Math.min(50, Number(e.target.value) || 1));
          this.calculate();
        });
      }

      if (initPrincipalInput) {
        initPrincipalInput.addEventListener('input', (e) => {
          currentInputs.initialPrincipal = Math.max(0, Number(e.target.value) || 0);
          this.calculate();
        });
      }

      if (stepUpInput) {
        stepUpInput.addEventListener('input', (e) => {
          currentInputs.annualIncreaseRate = Math.max(0, Math.min(25, Number(e.target.value) || 0));
          this.calculate();
        });
      }

      if (compoundFreqSelect) {
        compoundFreqSelect.addEventListener('change', (e) => {
          currentInputs.compoundFrequency = Number(e.target.value) || 12;
          this.calculate();
        });
      }

      if (inflationToggle) {
        inflationToggle.addEventListener('change', (e) => {
          currentInputs.adjustForInflation = e.target.checked;
          this.calculate();
        });
      }

      if (planBMonthlyInput) {
        planBMonthlyInput.addEventListener('input', (e) => {
          currentInputs.planBMonthly = Math.max(0, Number(e.target.value) || 0);
          this.calculate();
        });
      }

      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          if (!activeResult) return;
          const { futureValue, years, totalGrowth } = activeResult.planA;
          const summary = `📈 By investing $${currentInputs.monthlyContribution}/mo for ${years} years on FinCast, my portfolio could reach $${futureValue.toLocaleString()} ($${totalGrowth.toLocaleString()} from compound interest)!`;
          if (global.FinCastShare) {
            global.FinCastShare.open(summary);
          }
        });
      }
    },

    calculate: function () {
      if (!global.InvestmentEngine) return;

      const planAOptions = {
        initialPrincipal: currentInputs.initialPrincipal,
        monthlyContribution: currentInputs.monthlyContribution,
        annualReturnRate: currentInputs.annualReturnRate,
        years: currentInputs.years,
        annualIncreaseRate: currentInputs.annualIncreaseRate,
        compoundFrequency: currentInputs.compoundFrequency,
        adjustForInflation: currentInputs.adjustForInflation,
        inflationRate: currentInputs.inflationRate
      };

      const planBOptions = {
        ...planAOptions,
        monthlyContribution: currentInputs.planBMonthly || (currentInputs.monthlyContribution + 200)
      };

      const comparison = global.InvestmentEngine.comparePlans(planAOptions, planBOptions);
      activeResult = comparison;

      this.renderResults(comparison);
    },

    renderResults: function (comparison) {
      const { planA, planB, additionalContribution, additionalFutureValue, wealthMultiplier } = comparison;

      // 1. Primary Highlight Metric Card
      const displayValue = currentInputs.adjustForInflation ? planA.realFutureValue : planA.futureValue;
      const totalFutureEl = document.getElementById('inv-total-future-val');
      const totalGrowthEl = document.getElementById('inv-total-growth');
      const totalDepositsEl = document.getElementById('inv-total-deposits');
      const inflationLabelEl = document.getElementById('inv-inflation-label');

      if (totalFutureEl) totalFutureEl.textContent = `$${displayValue.toLocaleString()}`;
      if (totalGrowthEl) totalGrowthEl.textContent = `$${planA.totalGrowth.toLocaleString()}`;
      if (totalDepositsEl) totalDepositsEl.textContent = `$${planA.totalContributions.toLocaleString()}`;
      if (inflationLabelEl) {
        inflationLabelEl.style.display = currentInputs.adjustForInflation ? 'inline-block' : 'none';
      }

      // 2. Plan A vs Plan B Comparison Card
      const planAContribEl = document.getElementById('plan-a-contrib');
      const planAFutureEl = document.getElementById('plan-a-future');
      const planBContribEl = document.getElementById('plan-b-contrib');
      const planBFutureEl = document.getElementById('plan-b-future');
      const deltaInvestFutureEl = document.getElementById('delta-invest-future');
      const deltaInvestContribEl = document.getElementById('delta-invest-contrib');
      const wealthMultiplierEl = document.getElementById('wealth-multiplier-val');

      if (planAContribEl) planAContribEl.textContent = `$${planA.totalContributions.toLocaleString()}`;
      if (planAFutureEl) planAFutureEl.textContent = `$${planA.futureValue.toLocaleString()}`;
      if (planBContribEl) planBContribEl.textContent = `$${planB.totalContributions.toLocaleString()}`;
      if (planBFutureEl) planBFutureEl.textContent = `$${planB.futureValue.toLocaleString()}`;

      if (deltaInvestFutureEl) deltaInvestFutureEl.textContent = `+$${additionalFutureValue.toLocaleString()}`;
      if (deltaInvestContribEl) deltaInvestContribEl.textContent = `$${additionalContribution.toLocaleString()}`;
      if (wealthMultiplierEl) wealthMultiplierEl.textContent = `${wealthMultiplier}x`;

      // 3. Render Stacked Growth Bar Chart
      const chartMount = document.getElementById('investment-chart-mount');
      if (chartMount && global.FinCastCharts) {
        global.FinCastCharts.renderStackedBarChart(chartMount, {
          yearlyData: planA.yearlySchedule
        });
      }

      // 4. Render Breakdown Table
      const tableBody = document.getElementById('investment-table-body');
      if (tableBody && planA.yearlySchedule) {
        tableBody.innerHTML = planA.yearlySchedule.map(row => `
          <tr>
            <td>Year ${row.year}</td>
            <td>$${row.nominalBalance.toLocaleString()}</td>
            <td>$${row.totalContributions.toLocaleString()}</td>
            <td style="color: var(--brand-primary); font-weight: 600;">$${row.totalInterest.toLocaleString()}</td>
            ${currentInputs.adjustForInflation ? `<td>$${row.realBalance.toLocaleString()}</td>` : ''}
          </tr>
        `).join('');
      }
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => InvestmentTool.init());
  }

  global.FinCastInvestmentTool = InvestmentTool;
})(typeof window !== 'undefined' ? window : this);
