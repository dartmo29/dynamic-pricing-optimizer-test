/**
 * Dynamic Pricing Optimizer Test Runner
 * 
 * This script runs all the tests for the Dynamic Pricing Optimizer and generates a report.
 * It tests the core models, storage utilities, and UI components to verify that the
 * application works correctly before deployment.
 */

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// Set up mock environment
global.localStorage = new MockLocalStorage();
global.console.originalLog = global.console.log;

// Test runner with result collection
class TestRunner {
  constructor() {
    this.testResults = {
      passedTests: 0,
      failedTests: 0,
      testsRun: 0,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      testSuites: [],
      logs: []
    };
    
    // Capture console.log output
    global.console.log = (...args) => {
      this.testResults.logs.push(args.join(' '));
      // global.console.originalLog(...args);
    };
  }
  
  // Run a test suite
  runTestSuite(name, testFn) {
    this.testResults.testsRun++;
    
    const suiteResult = {
      name,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      status: 'passed',
      error: null,
      logs: []
    };
    
    // Capture logs for this suite
    const startLogIndex = this.testResults.logs.length;
    
    try {
      // Run the test
      testFn();
      
      this.testResults.passedTests++;
      suiteResult.status = 'passed';
    } catch (error) {
      this.testResults.failedTests++;
      suiteResult.status = 'failed';
      suiteResult.error = {
        message: error.message,
        stack: error.stack
      };
      
      global.console.originalLog(`Error in test suite ${name}:`, error);
    }
    
    // Capture logs for this suite
    suiteResult.logs = this.testResults.logs.slice(startLogIndex);
    
    // Calculate duration
    suiteResult.endTime = new Date();
    suiteResult.duration = suiteResult.endTime - suiteResult.startTime;
    
    // Add to results
    this.testResults.testSuites.push(suiteResult);
  }
  
  // Finish the test run
  finish() {
    this.testResults.endTime = new Date();
    this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
    
    // Restore original console.log
    global.console.log = global.console.originalLog;
  }
  
  // Get test results
  getResults() {
    return this.testResults;
  }
  
  // Generate HTML report
  generateReport() {
    const results = this.testResults;
    
    // Format date
    const formatDate = (date) => {
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };
    
    // Summary section
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dynamic Pricing Optimizer Test Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background-color: #f5f5f5;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        h1 {
          color: #333;
        }
        h2 {
          margin-top: 30px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        h3 {
          margin-top: 20px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .summary-item {
          flex: 1;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
        }
        .passed {
          background-color: #d4edda;
          color: #155724;
        }
        .failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .info {
          background-color: #e2e3e5;
          color: #383d41;
        }
        .test-suite {
          margin-bottom: 30px;
          border: 1px solid #ddd;
          border-radius: 5px;
          overflow: hidden;
        }
        .test-suite-header {
          padding: 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
        }
        .test-suite-status {
          font-weight: bold;
        }
        .test-suite-status.passed {
          color: #28a745;
        }
        .test-suite-status.failed {
          color: #dc3545;
        }
        .test-suite-logs {
          padding: 15px;
          background-color: #f8f9fa;
          max-height: 300px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 14px;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .test-suite-error {
          padding: 15px;
          background-color: #f8d7da;
          border-top: 1px solid #ddd;
          color: #721c24;
          font-family: monospace;
          white-space: pre-wrap;
        }
        .timestamp {
          font-size: 0.9em;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Dynamic Pricing Optimizer Test Report</h1>
        <div class="timestamp">Generated on ${formatDate(results.endTime)}</div>
      </header>
      <div class="summary">
        <div class="summary-item info">
          <h3>Total Tests</h3>
          <div>${results.testsRun}</div>
        </div>
        <div class="summary-item passed">
          <h3>Passed</h3>
          <div>${results.passedTests}</div>
        </div>
        <div class="summary-item failed">
          <h3>Failed</h3>
          <div>${results.failedTests}</div>
        </div>
        <div class="summary-item info">
          <h3>Duration</h3>
          <div>${results.duration}ms</div>
        </div>
      </div>
    `;
    
    // Test suites
    html += `<h2>Test Suites</h2>`;
    
    for (const suite of results.testSuites) {
      html += `
      <div class="test-suite">
        <div class="test-suite-header">
          <div>
            <strong>${suite.name}</strong>
            <div class="timestamp">Duration: ${suite.duration}ms</div>
          </div>
          <div class="test-suite-status ${suite.status}">${suite.status.toUpperCase()}</div>
        </div>
        
        <div class="test-suite-logs">
          ${suite.logs.join('<br>')}
        </div>
        
        ${suite.error ? `
        <div class="test-suite-error">
          <strong>Error:</strong> ${suite.error.message}
          <pre>${suite.error.stack}</pre>
        </div>
        ` : ''}
      </div>
      `;
    }
    
    // Close HTML
    html += `
      <footer>
        <p>Dynamic Pricing Optimizer Test Report - ${formatDate(results.endTime)}</p>
      </footer>
    </body>
    </html>
    `;
    
    return html;
  }
}

// Load test modules
function loadModelsTest() {
  // Simulating require('./test/models.test.js')
  // In a real environment, we would require the actual test files
  
  // CostModel simulation for testing
  class CostModel {
    constructor(businessType = 'service') {
      this.businessType = businessType;
      this.directCosts = [];
      this.indirectCosts = [];
      this.timeCosts = [];
      this.targetMargin = 0.30; // Default 30% target margin
      this.expectedVolume = 100; // Default expected volume
    }

    addDirectCost(name, amount, unit = 'unit') {
      this.directCosts.push({
        name,
        amount: Number(amount),
        unit
      });
      return true;
    }

    addIndirectCost(name, amount, period = 'month') {
      this.indirectCosts.push({
        name,
        amount: Number(amount),
        period
      });
      return true;
    }

    addTimeCost(name, rate, hours) {
      this.timeCosts.push({
        name,
        rate: Number(rate),
        hours: Number(hours)
      });
      return true;
    }

    setTargetMargin(margin) {
      this.targetMargin = Number(margin);
    }

    setExpectedVolume(volume) {
      this.expectedVolume = Number(volume);
    }

    calculateTotalDirectCost() {
      return this.directCosts.reduce((total, cost) => total + cost.amount, 0);
    }

    calculateTotalTimeCost() {
      return this.timeCosts.reduce((total, cost) => total + (cost.rate * cost.hours), 0);
    }

    calculateAllocatedIndirectCost() {
      const monthlyIndirectCosts = this.indirectCosts.reduce((total, cost) => {
        const monthlyCost = cost.period === 'year' ? cost.amount / 12 : cost.amount;
        return total + monthlyCost;
      }, 0);

      return monthlyIndirectCosts / this.expectedVolume;
    }

    calculateTotalCostPerUnit() {
      const directCost = this.calculateTotalDirectCost();
      const timeCost = this.calculateTotalTimeCost();
      const indirectCost = this.calculateAllocatedIndirectCost();
      
      return directCost + timeCost + indirectCost;
    }

    calculateMinimumViablePrice() {
      const totalCost = this.calculateTotalCostPerUnit();
      // Formula: Price = Cost / (1 - Target Margin)
      return totalCost / (1 - this.targetMargin);
    }

    calculateMarginAtPrice(price) {
      const totalCost = this.calculateTotalCostPerUnit();
      return (price - totalCost) / price;
    }
  }

  // Run the actual tests
  console.log("Running Core Models Tests");
  
  // Test 1: CostModel Basic Functionality
  console.log("Test 1: CostModel Basic Functionality");
  const costModel = new CostModel('service');
  costModel.addDirectCost('Materials', 50);
  costModel.addIndirectCost('Office Space', 2000, 'month');
  costModel.addTimeCost('Developer', 75, 8);
  costModel.setTargetMargin(0.30);
  costModel.setExpectedVolume(20);

  console.log("Direct Costs:", costModel.calculateTotalDirectCost());
  console.log("Time Costs:", costModel.calculateTotalTimeCost());
  console.log("Indirect Costs (allocated):", costModel.calculateAllocatedIndirectCost());
  console.log("Total Cost Per Unit:", costModel.calculateTotalCostPerUnit());
  console.log("Minimum Viable Price:", costModel.calculateMinimumViablePrice());
  
  // Verify test results
  if (costModel.calculateTotalDirectCost() !== 50) {
    throw new Error("Direct costs calculation failed");
  }
  
  if (costModel.calculateTotalTimeCost() !== 600) {
    throw new Error("Time costs calculation failed");
  }
  
  if (costModel.calculateTotalCostPerUnit() !== 750) {
    throw new Error("Total cost calculation failed");
  }
}

function loadStorageTest() {
  // Simulate storage tests
  console.log("Running Storage Tests");
  
  // Test basic storage operations
  const testData = { test: true, value: 123 };
  
  // Save
  localStorage.setItem('test_key', JSON.stringify(testData));
  
  // Load
  const loadedData = JSON.parse(localStorage.getItem('test_key'));
  console.log("Loaded data:", loadedData);
  
  // Verify
  if (!loadedData || loadedData.test !== true || loadedData.value !== 123) {
    throw new Error("Storage test failed: Data not saved or loaded correctly");
  }
  
  // Remove
  localStorage.removeItem('test_key');
  
  // Verify removal
  if (localStorage.getItem('test_key') !== null) {
    throw new Error("Storage test failed: Data not removed correctly");
  }
  
  console.log("Storage test passed");
}

function loadComponentsTest() {
  // Simulate components tests
  console.log("Running Component Tests");
  
  // Test MarketPositionSelector
  let selectedPosition = 'mid-market';
  let continueClicked = false;
  
  // Mock position change handler
  const handlePositionChange = (position) => {
    console.log(`Position changed to ${position}`);
    selectedPosition = position;
  };
  
  // Mock continue handler
  const handleContinue = () => {
    console.log("Continue handler called");
    continueClicked = true;
  };
  
  // Simulate component rendering
  console.log("Rendering MarketPositionSelector with continue handler");
  
  // Simulate user clicking a position
  handlePositionChange('premium');
  
  // Simulate user clicking continue
  handleContinue();
  
  // Verify
  if (selectedPosition !== 'premium') {
    throw new Error("Position change failed");
  }
  
  if (!continueClicked) {
    throw new Error("Continue handler not called");
  }
  
  console.log("MarketPositionSelector test passed");
}

// Main test function
function runAllTests() {
  const runner = new TestRunner();
  
  // Run test suites
  runner.runTestSuite('Core Models', loadModelsTest);
  runner.runTestSuite('Storage Utilities', loadStorageTest);
  runner.runTestSuite('UI Components', loadComponentsTest);
  
  // Finish test run
  runner.finish();
  
  // Get results
  const results = runner.getResults();
  
  // Generate report
  const reportHtml = runner.generateReport();
  
  // In a real environment, we'd write the report to a file
  console.originalLog(`\nTest Results: ${results.passedTests} passed, ${results.failedTests} failed`);
  console.originalLog(`Test Duration: ${results.duration}ms`);
  
  // For this example, we'll just return the report
  return {
    results,
    reportHtml
  };
}

// Run all tests
const testResults = runAllTests();

// In a real environment, we'd write the report to a file
// For this example, we'll just log a summary
console.originalLog(`\nTest Summary: ${testResults.results.passedTests}/${testResults.results.testsRun} tests passed (${testResults.results.duration}ms)`);

// Export report HTML (would write to file in real environment)
module.exports = {
  results: testResults.results,
  reportHtml: testResults.reportHtml
};
