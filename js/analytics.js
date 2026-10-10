/**
 * FinCast Analytics & Privacy-First Event Bus
 * Dispatches key user engagement events without transmitting any sensitive personal financial figures.
 */

(function (global) {
  'use strict';

  global.FinCastFirebaseQueue = global.FinCastFirebaseQueue || [];
  global.FinCastFirebaseStatus = 'loading';

  import('./firebase-analytics.js')
    .then(({ connectFirebaseAnalytics }) => connectFirebaseAnalytics(global))
    .catch((error) => {
      global.FinCastFirebaseStatus = 'error';
      global.FinCastFirebaseQueue.length = 0;
      console.error('[FinCast Analytics] Firebase Analytics could not be loaded.', error);
    });

  const allowedMetadataKeys = new Set(['toolId', 'scenario', 'variable', 'from', 'to', 'channel']);

  function getSafeMetadata(metadata) {
    return Object.entries(metadata).reduce((safeMetadata, [key, value]) => {
      if (allowedMetadataKeys.has(key) && typeof value === 'string') {
        safeMetadata[key] = value.slice(0, 80);
      }
      return safeMetadata;
    }, {});
  }

  const Analytics = {
    /**
     * Dispatches custom event
     * @param {string} eventName - Name of engagement event
     * @param {Object} metadata - Non-sensitive context
     */
    track: function (eventName, metadata = {}) {
      const safeMetadata = getSafeMetadata(metadata);

      // 1. Log to console in development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`[FinCast Analytics] ${eventName}:`, safeMetadata);
      }

      const event = {
        event: eventName,
        ...safeMetadata
      };
      if (global.FinCastFirebaseStatus === 'loading') {
        global.FinCastFirebaseQueue.push(event);
      }
      global.dispatchEvent(new CustomEvent('fincast:event', { detail: event }));
    },

    // Standardized event helpers
    trackToolOpened: function (toolId) {
      this.track('tool_opened', { toolId: toolId });
    },

    trackCalculationStarted: function (toolId) {
      this.track('calculator_started', { toolId: toolId });
    },

    trackCalculationCompleted: function (toolId, scenarioType) {
      this.track('calculator_completed', { toolId: toolId, scenario: scenarioType });
    },

    trackScenarioChanged: function (toolId, variableChanged) {
      this.track('scenario_changed', { toolId: toolId, variable: variableChanged });
    },

    trackShareClicked: function (toolId, channel) {
      this.track('share_clicked', { toolId: toolId, channel: channel });
    },

    trackRelatedToolClicked: function (fromToolId, toToolId) {
      this.track('related_tool_clicked', { from: fromToolId, to: toToolId });
    }
  };

  global.FinCastAnalytics = Analytics;
})(typeof window !== 'undefined' ? window : this);
