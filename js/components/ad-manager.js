/**
 * FinCast Monetization & Ad Slot Manager
 * Architecturally prepares 5 non-intrusive display ad slots and affiliate recommendation hooks.
 * Defaults to disabled (hidden) until monetization feature flag is switched on in config.js.
 */

(function (global) {
  'use strict';

  const AdManager = {
    init: function () {
      const config = global.FinCastConfig && global.FinCastConfig.monetization;
      const isAdsEnabled = config && config.adsEnabled;

      const adContainers = document.querySelectorAll('.ad-slot-container');

      if (!isAdsEnabled) {
        // Keep all ad slots cleanly hidden
        adContainers.forEach(container => {
          container.style.display = 'none';
          container.classList.remove('ad-active');
        });
        return;
      }

      // If ads are activated in future:
      adContainers.forEach(container => {
        container.style.display = 'block';
        container.classList.add('ad-active');

        const slotType = container.getAttribute('data-ad-slot') || 'in-content';
        const client = config.adClient || 'ca-pub-test';

        // Render clean Google AdSense ins wrapper
        container.innerHTML = `
          <div class="ad-slot-card">
            <span style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 4px;">Advertisement</span>
            <ins class="adsbygoogle"
                 style="display:block; width:100%;"
                 data-ad-client="${client}"
                 data-ad-slot="${slotType}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
        `;

        try {
          if (typeof global.adsbygoogle !== 'undefined') {
            (global.adsbygoogle = global.adsbygoogle || []).push({});
          }
        } catch (e) {
          // Pass silently
        }
      });
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => AdManager.init());
  }

  global.FinCastAdManager = AdManager;
})(typeof window !== 'undefined' ? window : this);
