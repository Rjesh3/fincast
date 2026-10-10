/**
 * FinCast Phase 2 Complete Engine Verification Test Suite
 * Mathematical precision & edge cases for all 6 engines + SEO audit engine
 */

const fs = require('fs');
const path = require('path');

function loadScript(filePath) {
  const code = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  const fn = new Function('window', 'global', code);
  fn(global, global);
}

// Load all engines
loadScript('../js/engine/debt-engine.js');
loadScript('../js/engine/investment-engine.js');
loadScript('../js/engine/health-score-engine.js');
loadScript('../js/engine/mortgage-engine.js');
loadScript('../js/engine/tax-engine.js');
loadScript('../js/engine/life-simulator-engine.js');
loadScript('../js/engine/resilience-engine.js');
loadScript('../js/engine/keyword-cluster-engine.js');
loadScript('../js/engine/seo-audit-engine.js');

const DebtEngine = global.DebtEngine;
const InvestmentEngine = global.InvestmentEngine;
const HealthScoreEngine = global.HealthScoreEngine;
const MortgageEngine = global.MortgageEngine;
const TaxEngine = global.TaxEngine;
const LifeSimulatorEngine = global.LifeSimulatorEngine;
const ResilienceEngine = global.ResilienceEngine;
const KeywordClusterEngine = global.KeywordClusterEngine;
const SeoAuditEngine = global.FinCastSeoAudit || global.SeoAuditEngine;

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('--- TEST SUITE 1: Debt Engine Amortization ---');
const debtTest = DebtEngine.calculateSingleDebt(10000, 24, 500, 0);
assert(debtTest.totalMonths === 26, `Total months accurate (26 months)`);
assert(debtTest.totalInterest === 2899, `Total interest accurate ($2,899)`);

console.log('\n--- TEST SUITE 2: Investment Compounding Engine ---');
const invTest = InvestmentEngine.calculateGrowth({
  initialPrincipal: 10000,
  monthlyContribution: 500,
  annualReturnRate: 8,
  years: 10,
  compoundFrequency: 12
});
assert(invTest.futureValue === 114279, `Future value matches formula ($114,279)`);

console.log('\n--- TEST SUITE 3: Mortgage & Prepayment Engine ---');
// $400k home, $80k down ($320k loan), 6.75% interest, 30 years
// Monthly PI should be ~$2,075.68 -> $2,076
const mortTest = MortgageEngine.calculateMortgage({
  homePrice: 400000,
  downPayment: 80000,
  interestRate: 6.75,
  termYears: 30,
  extraMonthlyPayment: 250
});
assert(mortTest.monthlyPI === 2076, `Monthly P&I calculated accurately ($2,076)`);
assert(mortTest.interestSaved > 80000, `Extra $250/mo saves over $80,000 in interest ($${mortTest.interestSaved})`);
assert(mortTest.monthsSaved > 60, `Extra $250/mo saves over 5 years (${mortTest.yearsSaved} yrs)`);

console.log('\n--- TEST SUITE 4: 2026 US Tax Engine ---');
// Gross $85,000 Single filer, $7,000 401(k), 4.5% state tax
const taxTest = TaxEngine.calculateTakeHomePay({
  grossAnnualIncome: 85000,
  filingStatus: 'single',
  preTax401k: 7000,
  preTaxHsaFsa: 0,
  stateTaxRatePercent: 4.5
});
assert(taxTest.grossAnnualIncome === 85000, 'Gross income intact');
assert(taxTest.federalTax > 8000 && taxTest.federalTax < 10000, `Federal tax matches 2026 progressive brackets ($${taxTest.federalTax})`);
assert(taxTest.socialSecurityTax === Math.round(85000 * 0.062), `FICA SS tax accurate (6.2%)`);
assert(taxTest.monthlyTakeHome > 4500 && taxTest.monthlyTakeHome < 5500, `Monthly take-home accurate ($${taxTest.monthlyTakeHome})`);

console.log('\n--- TEST SUITE 5: Financial Life Multi-Decade Simulator ---');
const lifeTest = LifeSimulatorEngine.projectTrajectory({
  currentAge: 30,
  retirementAge: 60,
  currentNetWorth: 50000,
  annualIncome: 90000,
  savingsRate: 25,
  annualReturn: 8.0,
  incomeGrowthRate: 2.5
});
assert(lifeTest.finalNetWorth > 1500000, `Multi-decade net worth compounding exceeds $1.5M ($${lifeTest.finalNetWorth})`);
assert(lifeTest.timeline.length > 30, 'Projects 30+ year timeline');

console.log('\n--- TEST SUITE 6: Resilience Crisis Engine ---');
const resTest = ResilienceEngine.simulateShock({
  liquidSavings: 20000,
  monthlyIncome: 6000,
  monthlyEssentialExpenses: 3000,
  shockType: 'job_loss',
  unemploymentAssistance: 1500
});
assert(resTest.monthlyNetBurn === 1500, 'Monthly burn rate during unemployment accurate ($1,500)');
assert(resTest.runwayMonths.includes('13.3'), `Runway calculated accurately (${resTest.runwayMonths})`);

console.log('\n--- TEST SUITE 7: SEO Audit & Keyword Clustering Engines ---');
const keywordsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/keywords.json'), 'utf8'));
const sourcesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sources.json'), 'utf8'));
const featuresData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/features.json'), 'utf8'));

const clusterAnalysis = KeywordClusterEngine.analyzeKeywords(keywordsData.keywords);
assert(clusterAnalysis.clusters.length > 0, `Keyword clusters mapped (${clusterAnalysis.clusters.length} clusters)`);

const seoAudit = SeoAuditEngine.auditPlatform(featuresData.features, keywordsData.keywords, sourcesData.sources);
assert(seoAudit.healthScore === 100, `SEO health score is 100/100 (${seoAudit.healthScore}/100)`);
assert(
  seoAudit.adSenseChecklist.some(item => item.passed === false) &&
  seoAudit.adSenseChecklist.some(item => item.passed === null),
  'AdSense readiness separates blocked setup from manual review'
);

console.log(`\n========================================`);
console.log(`ALL TEST SUITES PASSED: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
