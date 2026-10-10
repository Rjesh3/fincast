/**
 * FinCast SVG Chart Engine - Zero Dependency, Crisp, Ultra-Lightweight Vector Visualizations
 */

(function (global) {
  'use strict';

  const SvgCharts = {
    /**
     * Renders a responsive Line Chart comparing two balance trajectories (e.g. Current Plan vs Accelerated)
     */
    renderLineChart: function (containerEl, options) {
      if (!containerEl) return;

      const { dataA, dataB, labelA = 'Current Plan', labelB = 'Accelerated Plan' } = options;
      if (!dataA || dataA.length === 0) {
        containerEl.innerHTML = '<div class="chart-empty">No trajectory data available</div>';
        return;
      }

      const width = 500;
      const height = 200;
      const padding = { top: 20, right: 20, bottom: 30, left: 50 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Find max values
      const maxVal = Math.max(
        ...dataA.map(d => d.value),
        ...(dataB ? dataB.map(d => d.value) : [0]),
        100
      );
      const maxLen = Math.max(dataA.length, dataB ? dataB.length : 0);

      const getX = (index) => padding.left + (index / (maxLen - 1 || 1)) * chartWidth;
      const getY = (val) => padding.top + chartHeight - (val / maxVal) * chartHeight;

      // Build path strings
      const buildPath = (data) => {
        return data.reduce((path, pt, idx) => {
          const x = getX(idx);
          const y = getY(pt.value);
          return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
        }, '');
      };

      const pathA = buildPath(dataA);
      const pathB = dataB && dataB.length > 0 ? buildPath(dataB) : '';

      // Grid lines (3 horizontal)
      const gridLines = [0, 0.5, 1].map(ratio => {
        const y = padding.top + chartHeight * (1 - ratio);
        const valText = new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(maxVal * ratio);
        return `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#1F2937" stroke-dasharray="3,3" />
          <text x="${padding.left - 8}" y="${y + 4}" fill="#6B7280" font-size="10" text-anchor="end" font-family="monospace">${valText}</text>
        `;
      }).join('');

      containerEl.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; display: block;" role="img" aria-label="Debt payoff projection graph">
          ${gridLines}
          ${pathA ? `<path d="${pathA}" fill="none" stroke="#64748B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
          ${pathB ? `<path d="${pathB}" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        </svg>
      `;
    },

    /**
     * Renders a Stacked Bar Chart for Investment Growth (Principal vs Compounded Returns)
     */
    renderStackedBarChart: function (containerEl, options) {
      if (!containerEl) return;

      const { yearlyData } = options;
      if (!yearlyData || yearlyData.length === 0) {
        containerEl.innerHTML = '<div class="chart-empty">No growth data available</div>';
        return;
      }

      // Sample down data points if duration is long (keep at most 10-15 bars for readability)
      let displayData = yearlyData;
      if (yearlyData.length > 12) {
        const step = Math.ceil(yearlyData.length / 10);
        displayData = yearlyData.filter((_, idx) => (idx + 1) % step === 0 || idx === yearlyData.length - 1);
      }

      const width = 500;
      const height = 200;
      const padding = { top: 20, right: 15, bottom: 30, left: 55 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const maxVal = Math.max(...displayData.map(d => d.nominalBalance), 1000);
      const barCount = displayData.length;
      const barWidth = Math.max(8, Math.min(28, (chartWidth / barCount) * 0.65));
      const barGap = chartWidth / barCount;

      const bars = displayData.map((d, idx) => {
        const x = padding.left + (idx * barGap) + (barGap - barWidth) / 2;
        const totalHeight = (d.nominalBalance / maxVal) * chartHeight;
        const contribHeight = (d.totalContributions / maxVal) * chartHeight;
        const growthHeight = Math.max(0, totalHeight - contribHeight);

        const yContrib = padding.top + chartHeight - contribHeight;
        const yGrowth = padding.top + chartHeight - totalHeight;

        return `
          <g class="chart-bar-group">
            <!-- Principal / Contribution bar -->
            <rect x="${x}" y="${yContrib}" width="${barWidth}" height="${contribHeight}" fill="#3B82F6" rx="2" />
            <!-- Interest / Growth bar -->
            <rect x="${x}" y="${yGrowth}" width="${barWidth}" height="${growthHeight}" fill="#10B981" rx="2" />
            <!-- Year Label -->
            <text x="${x + barWidth / 2}" y="${height - 10}" fill="#9CA3AF" font-size="10" text-anchor="middle" font-family="sans-serif">Yr ${d.year}</text>
          </g>
        `;
      }).join('');

      // Grid lines
      const gridLines = [0, 0.5, 1].map(ratio => {
        const y = padding.top + chartHeight * (1 - ratio);
        const valText = new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(maxVal * ratio);
        return `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#1F2937" stroke-dasharray="3,3" />
          <text x="${padding.left - 8}" y="${y + 4}" fill="#6B7280" font-size="10" text-anchor="end" font-family="monospace">${valText}</text>
        `;
      }).join('');

      containerEl.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; display: block;" role="img" aria-label="Investment growth stacked bar graph">
          ${gridLines}
          ${bars}
        </svg>
      `;
    },

    /**
     * Renders a Smooth Circular Health Gauge Dial (0-100)
     */
    renderHealthGauge: function (containerEl, score, color = '#10B981') {
      if (!containerEl) return;

      const validScore = Math.max(0, Math.min(100, Math.round(score)));
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      // Semi-circle / 240-degree arc
      const strokeDashoffset = circumference - (validScore / 100) * (circumference * 0.75);

      containerEl.innerHTML = `
        <svg class="score-dial-svg" viewBox="0 0 160 160" role="img" aria-label="Financial Health Score Gauge: ${validScore} out of 100">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#1F2937" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circumference * 0.75} ${circumference}" transform="rotate(135 80 80)" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circumference * 0.75} ${circumference}" stroke-dashoffset="${strokeDashoffset}" transform="rotate(135 80 80)" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);" />
          <text x="80" y="76" text-anchor="middle" font-size="34" font-weight="800" fill="#F9FAFB" font-family="-apple-system, sans-serif">${validScore}</text>
          <text x="80" y="98" text-anchor="middle" font-size="12" font-weight="600" fill="#9CA3AF" text-transform="uppercase" letter-spacing="1">out of 100</text>
        </svg>
      `;
    }
  };

  global.FinCastCharts = SvgCharts;
})(typeof window !== 'undefined' ? window : this);
