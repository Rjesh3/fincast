/**
 * Unit Test Runner for New Financial Simulators
 */
const fs = require('fs');
const path = require('path');

// Load engines into simulated global scope
global.window = global;

require('../js/engine/fire-engine.js');
require('../js/engine/emergency-fund-engine.js');
require('../js/engine/side-hustle-engine.js');
require('../js/engine/rent-vs-buy-engine.js');
require('../js/engine/college-savings-engine.js');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('--- TEST SUITE 1: FIRE Engine ---');
const fireRes = global.FIREEngine.calculateFIRE({
  currentAge: 30,
  currentNetWorth: 50000,
  annualRetirementExpenses: 60000,
  monthlySavings: 2500,
  annualReturnRate: 8.0,
  inflationRate: 2.5,
  swrRate: 4.0
});
assert(fireRes.fireTarget === 1500000, `FIRE Target should be $1,500,000 (got ${fireRes.fireTarget})`);
assert(fireRes.fireReachedAge === 52, `FIRE Age should be 52 (got ${fireRes.fireReachedAge})`);

console.log('--- TEST SUITE 2: Emergency Fund Engine ---');
const efRes = global.EmergencyFundEngine.calculateBuffer({
  housing: 1500,
  food: 500,
  utilities: 200,
  debtPayments: 300,
  insurance: 300,
  transport: 200,
  currentSavings: 9000,
  targetMonths: 6,
  monthlyContribution: 400
});
assert(efRes.monthlyEssentialExpenses === 3000, `Monthly essential spend should be $3,000 (got ${efRes.monthlyEssentialExpenses})`);
assert(efRes.targetAmount === 18000, `6-month target should be $18,000 (got ${efRes.targetAmount})`);
assert(efRes.currentRunwayMonths === 3, `Runway months should be 3.0 (got ${efRes.currentRunwayMonths})`);

console.log('--- TEST SUITE 3: Side Hustle Tax Engine ---');
const shRes = global.SideHustleEngine.calculateTaxes({
  grossIncome: 20000,
  businessExpenses: 3000,
  hoursWorkedPerWeek: 10,
  w2OtherIncome: 60000,
  stateTaxRate: 5.0
});
assert(shRes.netProfit === 17000, `Net Schedule C profit should be $17,000 (got ${shRes.netProfit})`);
assert(shRes.seTax > 2000, `SE Tax should be > $2,000 (got ${shRes.seTax})`);

console.log('--- TEST SUITE 4: Rent vs Buy Engine ---');
const rvbRes = global.RentVsBuyEngine.compareRentVsBuy({
  homePrice: 400000,
  downPaymentPercent: 20,
  mortgageRate: 6.5,
  homeAppreciationRate: 3.5,
  monthlyRent: 2200,
  rentInflationRate: 3.0,
  stockMarketReturn: 8.0,
  simulationYears: 15
});
assert(rvbRes.downPayment === 80000, `Down payment should be $80,000 (got ${rvbRes.downPayment})`);
assert(rvbRes.yearlySchedule.length === 15, `Schedule length should be 15 years`);

console.log('--- TEST SUITE 5: College Savings Engine ---');
const csRes = global.CollegeSavingsEngine.calculateCollege({
  childAge: 3,
  collegeType: 'public-in-state',
  currentSavings: 10000,
  monthlyContribution: 300,
  tuitionInflation: 5.0,
  investmentReturn: 7.0
});
assert(csRes.yearsUntilCollege === 15, `Years until college should be 15 (got ${csRes.yearsUntilCollege})`);
assert(csRes.total4YrCost > 150000, `Projected 4-Yr tuition should exceed $150,000 (got ${csRes.total4YrCost})`);

console.log('\n========================================');
console.log(`NEW ENGINES TEST RESULT: ${passedTests}/${totalTests} Passed`);
console.log('========================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
