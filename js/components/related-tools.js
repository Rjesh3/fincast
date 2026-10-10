/**
 * FinCast Related Tools Component
 * Generates contextual internal linking cards across tool pages to maximize SEO crawl depth & user session duration.
 */

(function (global) {
  'use strict';

  const RelatedTools = {
    render: function (containerId, currentToolId) {
      const container = document.getElementById(containerId);
      if (!container || !global.FinCastConfig) return;

      const tools = global.FinCastConfig.toolsRegistry || [];
      const related = tools.filter(t => t.id !== currentToolId).slice(0, 3);

      const isSubpage = window.location.pathname.includes('/pages/');
      const getRelativeUrl = (toolUrl) => {
        if (isSubpage) {
          return toolUrl.replace(/^pages\//, '');
        }
        return toolUrl;
      };

      container.innerHTML = `
        <div class="related-tools-section">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h3>Explore Related Decision Simulators</h3>
            <a href="${isSubpage ? 'tools-directory.html' : 'pages/tools-directory.html'}" class="btn-sm btn-outline">View All Tools &rarr;</a>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Combine multiple simulators to get a 360-degree picture of your debt, cash flow, and wealth trajectory.
          </p>

          <div class="related-tools-grid">
            ${related.map(tool => `
              <a href="${getRelativeUrl(tool.url)}" class="related-tool-card" onclick="if(window.FinCastAnalytics) FinCastAnalytics.trackRelatedToolClicked('${currentToolId}', '${tool.id}')">
                <div>
                  <div style="font-size: 1.75rem; margin-bottom: 0.75rem;">${tool.icon}</div>
                  <h4>${tool.name}</h4>
                  <p>${tool.description}</p>
                </div>
                <div class="link-arrow">
                  <span>Launch Simulator</span>
                  <span>&rarr;</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  };

  global.FinCastRelatedTools = RelatedTools;
})(typeof window !== 'undefined' ? window : this);
