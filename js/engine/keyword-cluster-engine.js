/**
 * FinCast Keyword Intelligence & Clustering Engine
 * Classifies search intents, maps query clusters to canonical pages, and flags cannibalization.
 */

(function (global) {
  'use strict';

  const KeywordClusterEngine = {
    /**
     * Groups a list of keywords into distinct topic clusters and checks for cannibalization
     */
    analyzeKeywords: function (keywordList) {
      if (!keywordList || !Array.isArray(keywordList)) return { clusters: {}, summary: {} };

      const clusters = {};
      const pageToKeywords = {};
      let totalCommercial = 0;
      let totalCalculator = 0;

      keywordList.forEach(k => {
        const clusterName = k.cluster || 'General Personal Finance';
        if (!clusters[clusterName]) {
          clusters[clusterName] = { name: clusterName, count: 0, items: [] };
        }
        clusters[clusterName].count++;
        clusters[clusterName].items.push(k);

        // Map target pages
        const page = k.targetPage || 'unassigned';
        if (!pageToKeywords[page]) {
          pageToKeywords[page] = [];
        }
        pageToKeywords[page].push(k);

        if (k.commercialIntent === 'High') totalCommercial++;
        if (k.searchIntent === 'Calculator') totalCalculator++;
      });

      // Detect potential cannibalization (multiple different primary URLs competing for same cluster)
      const cannibalizationAlerts = [];
      Object.keys(clusters).forEach(clusterKey => {
        const items = clusters[clusterKey].items;
        const distinctPages = new Set(items.map(i => i.targetPage));
        if (distinctPages.size > 2) {
          cannibalizationAlerts.push({
            cluster: clusterKey,
            distinctPagesCount: distinctPages.size,
            recommendation: 'Review topic mapping: Consider consolidating into one pillar page with sub-anchors.'
          });
        }
      });

      return {
        clusters: Object.values(clusters),
        totalCount: keywordList.length,
        commercialRatio: ((totalCommercial / (keywordList.length || 1)) * 100).toFixed(0),
        calculatorRatio: ((totalCalculator / (keywordList.length || 1)) * 100).toFixed(0),
        cannibalizationAlerts: cannibalizationAlerts
      };
    }
  };

  global.KeywordClusterEngine = KeywordClusterEngine;
})(typeof window !== 'undefined' ? window : this);
