/**
 * FinCast Financial Health Score Assessment Controller
 * Coordinates the 6-pillar assessment inputs, live SVG score dial, pillar breakdowns, and Top 3 Next Steps.
 */

(function (global) {
  'use strict';

  let currentProfile = {
    age: 32,
    annualIncome: 85000,
    monthlyExpenses: 3800,
    emergencyFund: 12000,
    savings: 30000,
    debt: 12000,
    monthlyDebtPayments: 450,
    creditUtilization: 22,
    retirementContributions: 600
  };

  let activeScoreResult = null;

  const HealthTool = {
    init: function () {
      this.bindElements();
      this.calculate();

      if (global.FinCastAnalytics) {
        global.FinCastAnalytics.trackToolOpened('financial-health-score');
      }

      if (global.FinCastRelatedTools) {
        global.FinCastRelatedTools.render('related-tools-mount', 'financial-health-score');
      }
    },

    bindElements: function () {
      const inputs = [
        { id: 'fh-age', field: 'age' },
        { id: 'fh-income', field: 'annualIncome' },
        { id: 'fh-expenses', field: 'monthlyExpenses' },
        { id: 'fh-emergency', field: 'emergencyFund' },
        { id: 'fh-savings', field: 'savings' },
        { id: 'fh-debt', field: 'debt' },
        { id: 'fh-debt-payments', field: 'monthlyDebtPayments' },
        { id: 'fh-credit-util', field: 'creditUtilization' },
        { id: 'fh-retirement', field: 'retirementContributions' }
      ];

      inputs.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
          el.addEventListener('input', (e) => {
            currentProfile[item.field] = Number(e.target.value) || 0;
            this.calculate();
          });
        }
      });

      const utilSlider = document.getElementById('fh-credit-util-slider');
      const utilInput = document.getElementById('fh-credit-util');
      if (utilSlider && utilInput) {
        utilSlider.addEventListener('input', (e) => {
          utilInput.value = e.target.value;
          currentProfile.creditUtilization = Number(e.target.value) || 0;
          this.calculate();
        });
        utilInput.addEventListener('input', (e) => {
          utilSlider.value = e.target.value;
        });
      }

      const shareBtn = document.getElementById('btn-share-health-calc');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          if (!activeScoreResult) return;
          const { score, statusLabel } = activeScoreResult;
          const summary = `🎯 I just scored ${score}/100 (${statusLabel}) on the FinCast Financial Health Assessment! Check your score and get your Top 3 Next Steps for free:`;
          if (global.FinCastShare) {
            global.FinCastShare.open(summary);
          }
        });
      }
    },

    calculate: function () {
      if (!global.HealthScoreEngine) return;

      const result = global.HealthScoreEngine.evaluateHealth(currentProfile);
      activeScoreResult = result;

      this.renderResults(result);
    },

    renderResults: function (result) {
      const { score, status, statusLabel, statusColor, pillars, top3Steps } = result;

      // 1. Render Gauge Dial
      const dialMount = document.getElementById('health-gauge-mount');
      if (dialMount && global.FinCastCharts) {
        global.FinCastCharts.renderHealthGauge(dialMount, score, statusColor);
      }

      const statusBadge = document.getElementById('health-status-badge');
      if (statusBadge) {
        statusBadge.textContent = statusLabel;
        statusBadge.className = `score-status-pill status-${status}`;
      }

      // 2. Render 6 Pillar Cards
      const pillarsGrid = document.getElementById('health-pillars-mount');
      if (pillarsGrid && pillars) {
        const pillarList = Object.values(pillars);
        pillarsGrid.innerHTML = pillarList.map(p => {
          let badgeClass = 'badge-emerald';
          let barColor = '#10B981';
          if (p.status === 'attention') {
            badgeClass = 'badge-amber';
            barColor = '#F59E0B';
          } else if (p.status === 'critical') {
            badgeClass = 'badge-amber';
            barColor = '#EF4444';
          }

          return `
            <div class="pillar-card">
              <div class="pillar-card-header">
                <span class="pillar-name">${p.name}</span>
                <span class="pillar-score-badge ${badgeClass}">${p.score}/100</span>
              </div>
              <div class="pillar-bar-bg">
                <div class="pillar-bar-fill" style="width: ${p.score}%; background-color: ${barColor};"></div>
              </div>
              <p class="pillar-feedback">${p.feedback}</p>
            </div>
          `;
        }).join('');
      }

      // 3. Render Top 3 Next Steps
      const stepsContainer = document.getElementById('next-steps-mount');
      if (stepsContainer && top3Steps) {
        stepsContainer.innerHTML = top3Steps.map((step, idx) => `
          <div class="step-card">
            <div class="step-number">${idx + 1}</div>
            <div class="step-content">
              <h5>${step.title}</h5>
              <p>${step.description}</p>
            </div>
          </div>
        `).join('');
      }
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => HealthTool.init());
  }

  global.FinCastHealthTool = HealthTool;
})(typeof window !== 'undefined' ? window : this);
