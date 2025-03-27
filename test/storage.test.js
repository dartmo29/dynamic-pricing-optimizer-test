/**
 * Storage Utilities Tests
 * 
 * This file tests the functionality of the storage utilities in the Dynamic Pricing Optimizer:
 * - saveToStorage
 * - loadFromStorage
 * - removeFromStorage
 * - clearAppStorage
 * - saveScenario / loadScenario / getAllScenarios / deleteScenario
 * - exportAllData / importAllData
 */

// Simulated storage.js implementation for testing
 
// Storage keys
const STORAGE_KEYS = {
  COST_ANALYSIS: 'dpo_cost_analysis',
  PRICING_STRATEGY: 'dpo_pricing_strategy',
  BUSINESS_PROFILE: 'dpo_business_profile',
  COMPETITORS: 'dpo_competitors',
  VALUE_FACTORS: 'dpo_value_factors',
  VALUE_PROPOSITION: 'dpo_value_proposition',
  VALUE_MAP: 'dpo_value_map',
  COMMUNICATION: 'dpo_communication',
  SETTINGS: 'dpo_settings',
  SCENARIOS: 'dpo_scenarios'
};

/**
 * Save data to local storage
 * 
 * @param {string} key Storage key
 * @param {any} data Data to store
 * @returns {boolean} Success status
 */
function saveToStorage(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
}

/**
 * Load data from local storage
 * 
 * @param {string} key Storage key
 * @param {any} defaultValue Default value if not found
 * @returns {any} Retrieved data or default value
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from local storage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from local storage
 * 
 * @param {string} key Storage key
 * @returns {boolean} Success status
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from local storage:', error);
    return false;
  }
}

/**
 * Clear all application data from local storage
 * 
 * @returns {boolean} Success status
 */
function clearAppStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing app storage:', error);
    return false;
  }
}

/**
 * Save a pricing scenario
 * 
 * @param {string} name Scenario name
 * @param {Object} data Scenario data
 * @returns {boolean} Success status
 */
function saveScenario(name, data) {
  try {
    // Get existing scenarios
    const scenarios = loadFromStorage(STORAGE_KEYS.SCENARIOS, {});
    
    // Add new scenario with timestamp
    scenarios[name] = {
      ...data,
      createdAt: new Date().toISOString()
    };
    
    // Save updated scenarios
    return saveToStorage(STORAGE_KEYS.SCENARIOS, scenarios);
  } catch (error) {
    console.error('Error saving scenario:', error);
    return false;
  }
}

/**
 * Load a specific scenario
 * 
 * @param {string} name Scenario name
 * @returns {Object|null} Scenario data or null if not found
 */
function loadScenario(name) {
  try {
    const scenarios = loadFromStorage(STORAGE_KEYS.SCENARIOS, {});
    return scenarios[name] || null;
  } catch (error) {
    console.error('Error loading scenario:', error);
    return null;
  }
}

/**
 * Get all saved scenarios
 * 
 * @returns {Object} Map of scenario names to data
 */
function getAllScenarios() {
  return loadFromStorage(STORAGE_KEYS.SCENARIOS, {});
}

/**
 * Delete a scenario
 * 
 * @param {string} name Scenario name
 * @returns {boolean} Success status
 */
function deleteScenario(name) {
  try {
    const scenarios = loadFromStorage(STORAGE_KEYS.SCENARIOS, {});
    
    if (!scenarios[name]) {
      return false;
    }
    
    // Remove the scenario
    delete scenarios[name];
    
    // Save updated scenarios
    return saveToStorage(STORAGE_KEYS.SCENARIOS, scenarios);
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return false;
  }
}

/**
 * Export all application data as JSON
 * 
 * @returns {string} JSON string of all data
 */
function exportAllData() {
  try {
    const exportData = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      exportData[key] = loadFromStorage(storageKey);
    });
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

/**
 * Import application data from JSON
 * 
 * @param {string} jsonData JSON string of application data
 * @returns {boolean} Success status
 */
function importAllData(jsonData) {
  try {
    const importData = JSON.parse(jsonData);
    
    Object.entries(importData).forEach(([key, data]) => {
      if (STORAGE_KEYS[key] && data !== null) {
        saveToStorage(STORAGE_KEYS[key], data);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

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

// Set up mock localStorage
global.localStorage = new MockLocalStorage();

// Run tests

function runTests() {
  console.log("Running Dynamic Pricing Optimizer Storage Tests\n");
  
  // Test 1: Basic Storage Operations
  console.log("Test 1: Basic Storage Operations");
  
  // Save data
  const testData = { name: "Test Data", value: 123, nested: { prop: "test" } };
  const saveResult = saveToStorage('test_key', testData);
  console.log("Save Result:", saveResult);
  
  // Load data
  const loadedData = loadFromStorage('test_key');
  console.log("Loaded Data:", loadedData);
  console.log("Data Match:", JSON.stringify(loadedData) === JSON.stringify(testData));
  
  // Load with default value (for missing key)
  const defaultData = loadFromStorage('missing_key', { default: true });
  console.log("Default Data:", defaultData);
  
  // Remove data
  const removeResult = removeFromStorage('test_key');
  console.log("Remove Result:", removeResult);
  
  // Verify removal
  const afterRemoval = loadFromStorage('test_key');
  console.log("After Removal:", afterRemoval);

  // Test 2: Scenario Management
  console.log("\nTest 2: Scenario Management");
  
  // Save scenarios
  const scenario1Data = { 
    costAnalysis: { total: 500 },
    pricingStrategy: { selectedStrategy: 'cost-plus' }
  };
  
  const scenario2Data = { 
    costAnalysis: { total: 600 },
    pricingStrategy: { selectedStrategy: 'competitor' }
  };
  
  console.log("Save Scenario 1:", saveScenario('Basic Strategy', scenario1Data));
  console.log("Save Scenario 2:", saveScenario('Premium Strategy', scenario2Data));
  
  // Get all scenarios
  const allScenarios = getAllScenarios();
  console.log("All Scenario Names:", Object.keys(allScenarios));
  
  // Load specific scenario
  const loadedScenario = loadScenario('Basic Strategy');
  console.log("Loaded Scenario:", loadedScenario);
  console.log("Has createdAt:", Boolean(loadedScenario?.createdAt));
  console.log("Strategy Match:", loadedScenario?.pricingStrategy?.selectedStrategy === scenario1Data.pricingStrategy.selectedStrategy);
  
  // Delete scenario
  console.log("Delete Scenario:", deleteScenario('Basic Strategy'));
  
  // Verify deletion
  const remainingScenarios = getAllScenarios();
  console.log("Remaining Scenario Names:", Object.keys(remainingScenarios));
  console.log("Deleted Scenario Not Found:", loadScenario('Basic Strategy') === null);

  // Test 3: Clear App Storage
  console.log("\nTest 3: Clear App Storage");
  
  // Save data to multiple keys
  saveToStorage(STORAGE_KEYS.COST_ANALYSIS, { test: 'cost' });
  saveToStorage(STORAGE_KEYS.PRICING_STRATEGY, { test: 'pricing' });
  saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, { test: 'profile' });
  
  // Verify data is saved
  console.log("Cost Analysis Saved:", loadFromStorage(STORAGE_KEYS.COST_ANALYSIS) !== null);
  console.log("Pricing Strategy Saved:", loadFromStorage(STORAGE_KEYS.PRICING_STRATEGY) !== null);
  console.log("Business Profile Saved:", loadFromStorage(STORAGE_KEYS.BUSINESS_PROFILE) !== null);
  
  // Clear app storage
  console.log("Clear App Storage:", clearAppStorage());
  
  // Verify data is cleared
  console.log("Cost Analysis Cleared:", loadFromStorage(STORAGE_KEYS.COST_ANALYSIS) === null);
  console.log("Pricing Strategy Cleared:", loadFromStorage(STORAGE_KEYS.PRICING_STRATEGY) === null);
  console.log("Business Profile Cleared:", loadFromStorage(STORAGE_KEYS.BUSINESS_PROFILE) === null);

  // Test 4: Export and Import All Data
  console.log("\nTest 4: Export and Import All Data");
  
  // Set up test data
  saveToStorage(STORAGE_KEYS.COST_ANALYSIS, { costs: [{ name: 'Materials', value: 50 }] });
  saveToStorage(STORAGE_KEYS.PRICING_STRATEGY, { strategy: 'cost-plus', margin: 0.3 });
  saveScenario('Test Scenario', { test: true });
  
  // Export all data
  const exportedData = exportAllData();
  console.log("Exported Data Length:", exportedData.length);
  console.log("Export Contains Cost Analysis:", exportedData.includes('costs'));
  console.log("Export Contains Pricing Strategy:", exportedData.includes('strategy'));
  console.log("Export Contains Scenarios:", exportedData.includes('Test Scenario'));
  
  // Clear app storage
  clearAppStorage();
  
  // Verify data is cleared
  console.log("Data Cleared Before Import:", loadFromStorage(STORAGE_KEYS.COST_ANALYSIS) === null);
  
  // Import data
  console.log("Import Result:", importAllData(exportedData));
  
  // Verify data is imported
  console.log("Cost Analysis Imported:", JSON.stringify(loadFromStorage(STORAGE_KEYS.COST_ANALYSIS)));
  console.log("Pricing Strategy Imported:", JSON.stringify(loadFromStorage(STORAGE_KEYS.PRICING_STRATEGY)));
  console.log("Scenarios Imported:", Object.keys(getAllScenarios()).length > 0);

  // Test 5: Error Handling
  console.log("\nTest 5: Error Handling");
  
  // Attempt to import invalid JSON
  const importResult = importAllData("{not valid json}");
  console.log("Invalid JSON Import Result:", importResult);
  
  // Test with a simulated localStorage error
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error("Simulated storage error"); };
  
  const errorSaveResult = saveToStorage('error_test', { test: true });
  console.log("Error Save Result:", errorSaveResult);
  
  // Restore original function
  localStorage.setItem = originalSetItem;
}

// Execute tests
runTests();
