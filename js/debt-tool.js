/**
 * FinCast Debt Freedom Simulator Controller
 * Connects UI inputs, live sliders, multi-debt lists, strategy comparisons, and SVG charts.
 */

(function (global) {
  'use strict';

  let currentDebts = [
    { id: 1, name: 'Credit Card (Chase Sapphire)', balance: 6500, apr: 24.99, minPayment: 180 },
    { id: 2, name: 'Personal Loan', balance: 3500, apr: 11.5, minPayment: 120 }
  ];

  let currentStrategy = 'avalanche'; // 'avalanche' | 'snowball'
  let currentExtraPayment = 150;
  let activeCalculationResult = null;

  const DebtTool = {
    init: function () {
      this.bindElements();
      this.renderDebtList();
      this.calculate();

      if (global.FinCastAnalytics) {
        global.FinCastAnalytics.trackToolOpened('debt-freedom-simulator');
      }

      if (global.FinCastRelatedTools) {
        global.FinCastRelatedTools.render('related-tools-mount', 'debt-freedom-simulator');
      }
    },

    bindElements: function () {
      const extraSlider = document.getElementById('debt-extra-slider');
      const extraInput = document.getElementById('debt-extra-input');
      const addDebtBtn = document.getElementById('btn-add-debt');
      const strategyBtns = document.querySelectorAll('[data-debt-strategy]');
      const shareBtn = document.getElementById('btn-share-debt-calc');
      const toggleScheduleBtn = document.getElementById('btn-toggle-schedule');

      if (extraSlider && extraInput) {
        extraSlider.addEventListener('input', (e) => {
          const val = Number(e.target.value) || 0;
          extraInput.value = val;
          currentExtraPayment = val;
          this.calculate();
          if (global.FinCastAnalytics) global.FinCastAnalytics.trackScenarioChanged('debt-freedom-simulator', 'extra_payment_slider');
        });

        extraInput.addEventListener('input', (e) => {
          const val = Math.max(0, Math.min(5000, Number(e.target.value) || 0));
          extraSlider.value = val;
          currentExtraPayment = val;
          this.calculate();
        });
      }

      if (addDebtBtn) {
        addDebtBtn.addEventListener('click', () => {
          const newId = Date.now();
          currentDebts.push({
            id: newId,
            name: `Debt ${currentDebts.length + 1}`,
            balance: 2000,
            apr: 19.99,
            minPayment: 60
          });
          this.renderDebtList();
          this.calculate();
        });
      }

      strategyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          strategyBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentStrategy = btn.getAttribute('data-debt-strategy');
          this.calculate();
          if (global.FinCastAnalytics) global.FinCastAnalytics.trackScenarioChanged('debt-freedom-simulator', `strategy_${currentStrategy}`);
        });
      });

      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          if (!activeCalculationResult) return;
          const { interestSaved, monthsSaved, acceleratedPlan } = activeCalculationResult;
          const summary = `🎯 By paying $${currentExtraPayment}/mo extra on FinCast, I'm on track to save $${interestSaved.toLocaleString()} in interest and become debt-free in ${acceleratedPlan.debtFreeDate} (${monthsSaved} months earlier)!`;
          if (global.FinCastShare) {
            global.FinCastShare.open(summary);
          }
        });
      }

      if (toggleScheduleBtn) {
        toggleScheduleBtn.addEventListener('click', () => {
          const tableContainer = document.getElementById('schedule-table-container');
          if (tableContainer) {
            const isHidden = tableContainer.style.display === 'none';
            tableContainer.style.display = isHidden ? 'block' : 'none';
            toggleScheduleBtn.innerHTML = isHidden 
              ? '<span>▲</span> Hide Detailed Amortization Table' 
              : '<span>▼</span> View Full Amortization Schedule';
          }
        });
      }
    },

    renderDebtList: function () {
      const container = document.getElementById('debts-list-container');
      if (!container) return;

      if (currentDebts.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 1.5rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); color: var(--text-muted);">
            <p>No debts entered yet.</p>
            <button class="btn btn-sm btn-outline" style="margin-top: 0.5rem;" onclick="document.getElementById('btn-add-debt').click()">+ Add a Debt</button>
          </div>
        `;
        return;
      }

      container.innerHTML = currentDebts.map((d, index) => `
        <div class="debt-card-item" data-debt-id="${d.id}">
          <div class="debt-card-header">
            <input type="text" class="form-control form-control-sm debt-name-input" value="${this.escapeHtml(d.name)}" placeholder="Debt Name (e.g. Card, Auto Loan)" style="font-weight: 700; max-width: 220px; font-size: 0.85rem; padding: 0.35rem 0.65rem;" />
            ${currentDebts.length > 1 ? `<button class="btn-remove-debt" data-remove-id="${d.id}" title="Remove debt" aria-label="Remove debt">&times;</button>` : ''}
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Balance ($)</label>
              <input type="number" min="0" step="50" class="form-control form-control-sm debt-balance-input" value="${d.balance}" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">APR (%)</label>
              <input type="number" min="0" max="99.9" step="0.1" class="form-control form-control-sm debt-apr-input" value="${d.apr}" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Min Pay ($)</label>
              <input type="number" min="0" step="5" class="form-control form-control-sm debt-minpay-input" value="${d.minPayment}" />
            </div>
          </div>
        </div>
      `).join('');

      // Bind dynamic item inputs
      container.querySelectorAll('.debt-card-item').forEach(card => {
        const id = Number(card.getAttribute('data-debt-id'));
        const nameInput = card.querySelector('.debt-name-input');
        const balanceInput = card.querySelector('.debt-balance-input');
        const aprInput = card.querySelector('.debt-apr-input');
        const minPayInput = card.querySelector('.debt-minpay-input');
        const removeBtn = card.querySelector('.btn-remove-debt');

        const updateItem = () => {
          const item = currentDebts.find(d => d.id === id);
          if (item) {
            item.name = nameInput.value;
            item.balance = Math.max(0, Number(balanceInput.value) || 0);
            item.apr = Math.max(0, Math.min(99.9, Number(aprInput.value) || 0));
            item.minPayment = Math.max(0, Number(minPayInput.value) || 0);
            this.calculate();
          }
        };

        nameInput.addEventListener('input', updateItem);
        balanceInput.addEventListener('input', updateItem);
        aprInput.addEventListener('input', updateItem);
        minPayInput.addEventListener('input', updateItem);

        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            currentDebts = currentDebts.filter(d => d.id !== id);
            this.renderDebtList();
            this.calculate();
          });
        }
      });
    },

    calculate: function () {
      if (!global.DebtEngine) return;

      const totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
      const totalMinPayment = currentDebts.reduce((sum, d) => sum + d.minPayment, 0);

      // Weighted average APR for baseline comparison
      let weightedApr = 0;
      if (totalBalance > 0) {
        weightedApr = currentDebts.reduce((sum, d) => sum + (d.balance * d.apr), 0) / totalBalance;
      }

      // Baseline Calculation (Without extra payment)
      const baselineMulti = global.DebtEngine.simulateMultipleDebts(currentDebts, 0, currentStrategy);

      // Accelerated Calculation (With extra payment & selected strategy)
      const acceleratedMulti = global.DebtEngine.simulateMultipleDebts(currentDebts, currentExtraPayment, currentStrategy);

      const interestSaved = Math.max(0, baselineMulti.totalInterest - acceleratedMulti.totalInterest);
      const monthsSaved = Math.max(0, baselineMulti.totalMonths - acceleratedMulti.totalMonths);

      activeCalculationResult = {
        currentPlan: baselineMulti,
        acceleratedPlan: acceleratedMulti,
        interestSaved: interestSaved,
        monthsSaved: monthsSaved
      };

      this.renderResults(baselineMulti, acceleratedMulti, interestSaved, monthsSaved, totalBalance, totalMinPayment);
    },

    renderResults: function (baseline, accelerated, interestSaved, monthsSaved, totalBalance, totalMinPayment) {
      // 1. Update Delta Callout Banner
      const deltaInterestEl = document.getElementById('delta-interest-saved');
      const deltaMonthsEl = document.getElementById('delta-months-saved');
      const deltaTaglineEl = document.getElementById('delta-tagline');

      if (deltaInterestEl) deltaInterestEl.textContent = `$${interestSaved.toLocaleString()}`;
      if (deltaMonthsEl) deltaMonthsEl.textContent = `${monthsSaved} Months Earlier`;
      if (deltaTaglineEl) {
        if (currentExtraPayment > 0 && monthsSaved > 0) {
          deltaTaglineEl.textContent = `By adding $${currentExtraPayment}/mo, you erase debt by ${accelerated.debtFreeDate} and keep $${interestSaved.toLocaleString()} in your pocket.`;
        } else {
          deltaTaglineEl.textContent = `Slide the extra payment bar above to see how quickly you can become debt-free.`;
        }
      }

      // 2. Update Side-by-Side Plan Columns
      const currentDebtFreeEl = document.getElementById('current-plan-date');
      const currentInterestEl = document.getElementById('current-plan-interest');
      const currentTotalPaidEl = document.getElementById('current-plan-total');

      const accelDebtFreeEl = document.getElementById('accel-plan-date');
      const accelInterestEl = document.getElementById('accel-plan-interest');
      const accelTotalPaidEl = document.getElementById('accel-plan-total');

      if (currentDebtFreeEl) currentDebtFreeEl.textContent = baseline.debtFreeDate;
      if (currentInterestEl) currentInterestEl.textContent = `$${baseline.totalInterest.toLocaleString()}`;
      if (currentTotalPaidEl) currentTotalPaidEl.textContent = `$${baseline.totalPaid.toLocaleString()}`;

      if (accelDebtFreeEl) accelDebtFreeEl.textContent = accelerated.debtFreeDate;
      if (accelInterestEl) accelInterestEl.textContent = `$${accelerated.totalInterest.toLocaleString()}`;
      if (accelTotalPaidEl) accelTotalPaidEl.textContent = `$${accelerated.totalPaid.toLocaleString()}`;

      // 3. Render Trajectory Chart
      const chartMount = document.getElementById('debt-chart-mount');
      if (chartMount && global.FinCastCharts) {
        // Build data points from yearly progress
        const dataA = (baseline.yearlyProgress || []).map(p => ({ value: p.totalRemaining }));
        const dataB = (accelerated.yearlyProgress || []).map(p => ({ value: p.totalRemaining }));

        // Ensure start point is initial balance
        if (dataA.length > 0) dataA.unshift({ value: totalBalance });
        if (dataB.length > 0) dataB.unshift({ value: totalBalance });

        global.FinCastCharts.renderLineChart(chartMount, {
          dataA: dataA,
          dataB: dataB,
          labelA: 'Current Plan',
          labelB: 'Accelerated Plan'
        });
      }

      // 4. Render Amortization Schedule Table
      this.renderAmortizationTable(accelerated.yearlyProgress || []);
    },

    renderAmortizationTable: function (yearlyProgress) {
      const tbody = document.getElementById('schedule-table-body');
      if (!tbody) return;

      if (yearlyProgress.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No schedule generated</td></tr>';
        return;
      }

      tbody.innerHTML = yearlyProgress.map(row => `
        <tr>
          <td>Year ${row.year} (Month ${row.monthsCount})</td>
          <td>$${row.totalRemaining.toLocaleString()}</td>
          <td>$${row.totalInterestSoFar.toLocaleString()}</td>
          <td><span class="badge badge-emerald">On Track</span></td>
        </tr>
      `).join('');
    },

    escapeHtml: function (str) {
      return (str || '').replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => DebtTool.init());
  }

  global.FinCastDebtTool = DebtTool;
})(typeof window !== 'undefined' ? window : this);
