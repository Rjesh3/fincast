/**
 * FinCast Configuration & Global Registry
 * Centralized feature flags, SEO domain metadata, and Tool Directory Registry.
 */

(function (global) {
  'use strict';

  const Config = {
    siteName: 'FinCast',
    siteUrl: 'https://fincast.app', // Canonical production domain
    tagline: 'Don\'t just calculate it. See what happens.',
    version: '1.2.0',

    // Monetization Feature Flags
    monetization: {
      adsEnabled: false,
      adClient: 'ca-pub-XXXXXXXXXXXXXXXX',
      affiliateEnabled: false
    },

    // Privacy & Storage
    privacy: {
      localStoragePrefix: 'fincast_v1_',
      allowLocalStoragePersistence: true
    },

    // Complete Registry of Tools (Full Ecosystem)
    toolsRegistry: [
      {
        id: 'debt-freedom-simulator',
        name: 'Debt Freedom Simulator',
        category: 'Debt Payoff',
        url: 'pages/debt-freedom-simulator.html',
        description: 'Simulate debt payoff strategies (Avalanche vs. Snowball) and see how extra payments accelerate your debt-free date.',
        icon: '⚡',
        badge: 'Popular',
        isLive: true,
        keywords: ['debt payoff', 'credit card payoff', 'debt avalanche', 'debt snowball', 'extra payment', 'amortization schedule']
      },
      {
        id: 'investment-simulator',
        name: 'Investment "What If" Simulator',
        category: 'Investing & Wealth',
        url: 'pages/investment-simulator.html',
        description: 'Explore compounding scenarios, annual contribution step-ups, inflation adjustments, and side-by-side Plan A vs Plan B comparisons.',
        icon: '📈',
        badge: 'Essential',
        isLive: true,
        keywords: ['compound interest', 'investment calculator', 'future value', 'monthly deposit', 'inflation adjusted return', 's&p 500']
      },
      {
        id: 'financial-health-score',
        name: 'Financial Health Score Assessment',
        category: 'Wellness & Planning',
        url: 'pages/financial-health-score.html',
        description: 'Evaluate your 6 financial pillars (Emergency Fund, Debt, Cash Flow, Savings, Retirement, Credit) and get your Top 3 Next Steps.',
        icon: '🎯',
        badge: 'Interactive',
        isLive: true,
        keywords: ['financial health score', 'financial wellness test', 'emergency fund ratio', 'debt to income ratio', 'retirement readiness']
      },
      {
        id: 'fire-simulator',
        name: 'FIRE & Early Retirement Simulator',
        category: 'Investing & Wealth',
        url: 'pages/fire-simulator.html',
        description: 'Calculate your FIRE number, Lean/Fat FIRE targets, Safe Withdrawal Rate (SWR), Coast FIRE, and early retirement age.',
        icon: '🔥',
        badge: 'High Impact',
        isLive: true,
        keywords: ['fire calculator', 'financial independence', 'lean fire', 'fat fire', 'coast fire', 'safe withdrawal rate', '4% rule']
      },
      {
        id: 'emergency-fund-simulator',
        name: 'Emergency Fund & Runway Calculator',
        category: 'Wellness & Planning',
        url: 'pages/emergency-fund-simulator.html',
        description: 'Calculate 3, 6, or 9-month emergency cash buffer targets based on essential monthly expenses and HYSA APY earnings.',
        icon: '🛡️',
        badge: 'Essential',
        isLive: true,
        keywords: ['emergency fund calculator', 'financial runway', 'hysa interest', 'savings buffer', 'emergency savings goal']
      },
      {
        id: 'side-hustle-calculator',
        name: 'Side Hustle & Freelance Tax Calculator',
        category: 'Taxes & Income',
        url: 'pages/side-hustle-calculator.html',
        description: 'Calculate 15.3% Self-Employment Tax, federal/state tax brackets, Schedule C expense write-offs, and true net hourly rate.',
        icon: '💼',
        badge: 'Top Rated',
        isLive: true,
        keywords: ['side hustle tax', 'self employment tax', '1099 tax calculator', 'schedule c write offs', 'freelance net hourly pay']
      },
      {
        id: 'rent-vs-buy-simulator',
        name: 'Rent vs. Buy Home Decision Simulator',
        category: 'Real Estate & Mortgages',
        url: 'pages/rent-vs-buy-simulator.html',
        description: 'Compare long-term net worth trajectories between purchasing real estate vs renting and investing the difference in index funds.',
        icon: '🏙️',
        badge: 'High Impact',
        isLive: true,
        keywords: ['rent vs buy calculator', 'buying vs renting', 'real estate wealth', 'home appreciation vs stock market']
      },
      {
        id: 'college-savings-simulator',
        name: 'College Savings & 529 Plan Simulator',
        category: 'Investing & Wealth',
        url: 'pages/college-savings-simulator.html',
        description: 'Simulate future 4-year tuition with education inflation (5-7%), monthly 529 plan deposits, and state tax deduction benefits.',
        icon: '🎓',
        badge: 'Planning',
        isLive: true,
        keywords: ['529 plan calculator', 'college savings simulator', 'tuition inflation', 'education savings goal']
      },
      {
        id: 'mortgage-simulator',
        name: 'Mortgage & Early Payoff Simulator',
        category: 'Real Estate & Mortgages',
        url: 'pages/mortgage-simulator.html',
        description: 'Simulate 15 vs 30-year mortgages, extra principal prepayments, interest savings, and accelerated payoff dates.',
        icon: '🏠',
        badge: 'Popular',
        isLive: true,
        keywords: ['mortgage calculator', 'extra principal payment', 'amortization schedule', 'pmi removal', '15 vs 30 year mortgage']
      },
      {
        id: 'paycheck-tax-simulator',
        name: 'Paycheck & Take-Home Pay Simulator',
        category: 'Taxes & Income',
        url: 'pages/paycheck-tax-simulator.html',
        description: 'Simulate take-home pay after federal withholding, FICA taxes, state tax, 401(k) contributions, and HSA deductions.',
        icon: '💵',
        badge: 'Essential',
        isLive: true,
        keywords: ['paycheck calculator', 'take home pay', 'salary tax calculator', 'w4 withholding', '401k tax deduction']
      },
      {
        id: 'financial-resilience-simulator',
        name: 'Financial Resilience Simulator',
        category: 'Wellness & Planning',
        url: 'pages/financial-resilience-simulator.html',
        description: 'Stress-test your finances against job loss, unexpected medical expenses, or market downturns.',
        icon: '⚡',
        badge: 'Interactive',
        isLive: true,
        keywords: ['financial stress test', 'recession preparedness', 'cash flow cushion', 'resilience score']
      },
      {
        id: 'financial-life-simulator',
        name: 'Financial Life Journey Simulator',
        category: 'Wellness & Planning',
        url: 'pages/financial-life-simulator.html',
        description: 'Map out major life events (marriage, buying a home, career shift, retirement) across a multi-decade timeline.',
        icon: '🗺️',
        badge: 'Comprehensive',
        isLive: true,
        keywords: ['financial life plan', 'life goals simulator', 'multi decade net worth', 'wealth milestone tracker']
      }
    ]
  };

  global.FinCastConfig = Config;
})(typeof window !== 'undefined' ? window : this);
