/**
 * FinCast Homepage & Global Application Orchestrator
 * Controls interactive Hero "What If" simulation demo, mobile navigation, and FAQ accordions.
 */

(function (global) {
  'use strict';

  const App = {
    init: function () {
      this.initTheme();
      this.initMobileNav();
      this.initFaqAccordions();
      this.initHeroDemo();

      if (global.FinCastAnalytics) {
        global.FinCastAnalytics.track('homepage_viewed');
      }
    },

    initTheme: function () {
      const themeBtn = document.getElementById('theme-toggle-btn');
      const savedTheme = localStorage.getItem('fincast_theme') || 'dark';

      if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeBtn) themeBtn.textContent = '☀️';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeBtn) themeBtn.textContent = '🌙';
      }

      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme');
          const next = current === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('fincast_theme', next);
          themeBtn.textContent = next === 'light' ? '☀️' : '🌙';
        });
      }
    },

    initMobileNav: function () {
      const toggleBtn = document.querySelector('.mobile-nav-toggle');
      const navLinks = document.querySelector('.nav-links');

      if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
          navLinks.classList.toggle('open');
          const isOpen = navLinks.classList.contains('open');
          toggleBtn.setAttribute('aria-expanded', isOpen);
          toggleBtn.innerHTML = isOpen ? '✕' : '☰';
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            toggleBtn.innerHTML = '☰';
          });
        });
      }
    },

    initFaqAccordions: function () {
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
          questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all others
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
              item.classList.add('active');
            }
          });
        }
      });
    },

    initHeroDemo: function () {
      const heroSlider = document.getElementById('hero-extra-slider');
      const heroValueDisplay = document.getElementById('hero-slider-val');
      const heroInterestSaved = document.getElementById('hero-interest-saved');
      const heroMonthsSaved = document.getElementById('hero-months-saved');
      const heroTimelineText = document.getElementById('hero-timeline-text');

      if (!heroSlider || !global.DebtEngine) return;

      const baseDebt = 8000;
      const baseApr = 22.9;
      const baseMinPay = 200;

      const updateHeroDemo = () => {
        const extraVal = Number(heroSlider.value) || 0;
        if (heroValueDisplay) heroValueDisplay.textContent = `+$${extraVal}/mo`;

        const comparison = global.DebtEngine.compareWhatIf(baseDebt, baseApr, baseMinPay, extraVal);

        if (heroInterestSaved) heroInterestSaved.textContent = `$${comparison.interestSaved.toLocaleString()}`;
        if (heroMonthsSaved) heroMonthsSaved.textContent = `${comparison.monthsSaved} Months Faster`;
        if (heroTimelineText) {
          if (extraVal > 0) {
            heroTimelineText.innerHTML = `You become completely debt-free by <strong>${comparison.acceleratedPlan.debtFreeDate}</strong> instead of ${comparison.currentPlan.debtFreeDate}.`;
          } else {
            heroTimelineText.textContent = `Drag the slider to see how an extra $50, $150, or $300 crushes debt faster.`;
          }
        }
      };

      heroSlider.addEventListener('input', updateHeroDemo);
      updateHeroDemo(); // Initial run
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  }

  global.FinCastApp = App;
})(typeof window !== 'undefined' ? window : this);
