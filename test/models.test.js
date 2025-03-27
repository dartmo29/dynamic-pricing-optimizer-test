/**
 * Core Models Tests
 * 
 * This file tests the functionality of the core models in the Dynamic Pricing Optimizer:
 * - CostModel
 * - PricingModel
 * - CustomerSegmentModel
 * - ScenarioModel
 */

// Importing models directly from source repo would be ideal
// For this test we're recreating the model functionality

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

  calculateBreakEvenPrice() {
    return this.calculateTotalCostPerUnit();
  }

  calculateBreakEvenVolume(price) {
    const totalCost = this.calculateTotalCostPerUnit();
    if (price <= totalCost) return Infinity; // Price too low to break even
    
    const monthlyIndirectCosts = this.indirectCosts.reduce((total, cost) => {
      const monthlyCost = cost.period === 'year' ? cost.amount / 12 : cost.amount;
      return total + monthlyCost;
    }, 0);
    
    const contributionMargin = price - (this.calculateTotalDirectCost() + this.calculateTotalTimeCost());
    return monthlyIndirectCosts / contributionMargin;
  }

  calculateMarginAtPrice(price) {
    const totalCost = this.calculateTotalCostPerUnit();
    return (price - totalCost) / price;
  }
}

// Simple CustomerSegmentModel for testing
class CustomerSegmentModel {
  constructor() {
    this.segments = [];
    this.nextId = 1;
  }
  
  addSegment(name, size, elasticity, description = '') {
    const id = `seg_${this.nextId++}`;
    this.segments.push({
      id,
      name,
      size: Number(size),
      priceElasticity: elasticity,
      description
    });
    return id;
  }
  
  updateSegment(id, segmentData) {
    const index = this.segments.findIndex(s => s.id === id);
    if (index >= 0) {
      this.segments[index] = { ...this.segments[index], ...segmentData };
      return true;
    }
    return false;
  }
  
  removeSegment(id) {
    const index = this.segments.findIndex(s => s.id === id);
    if (index >= 0) {
      this.segments.splice(index, 1);
      return true;
    }
    return false;
  }
  
  calculateWeightedElasticity() {
    if (this.segments.length === 0) return -0.5; // Default elasticity
    
    const totalSize = this.segments.reduce((sum, seg) => sum + seg.size, 0);
    const weightedSum = this.segments.reduce(
      (sum, seg) => sum + (seg.priceElasticity * seg.size), 0
    );
    
    return weightedSum / totalSize;
  }
}

// PricingModel simulation
class PricingModel {
  constructor(costModel) {
    this.costModel = costModel;
    this.competitors = [];
    this.valueFactors = [];
    this.customerSegmentModel = new CustomerSegmentModel();
    this.marketPosition = 'mid-market'; // 'budget', 'mid-market', 'premium'
    this.baseDemand = 100; // Default reference demand
  }

  get segments() {
    return this.customerSegmentModel.segments || [];
  }

  addCompetitor(name, price, attributes = {}) {
    this.competitors.push({
      name,
      price: Number(price),
      attributes,
      overallValue: this.calculateOverallValue(attributes)
    });
  }

  calculateOverallValue(attributes) {
    if (Object.keys(attributes).length === 0) return 5; // Default mid-value
    
    const values = Object.values(attributes);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  addValueFactor(name, importance, score) {
    this.valueFactors.push({
      name,
      importance: Number(importance),
      score: Number(score)
    });
  }

  addSegment(name, size, priceElasticity, description = '') {
    // Convert priceElasticity from 1-10 scale to -10 to 0 scale
    const elasticity = -((priceElasticity / 10) * 9.5 + 0.5);
    return this.customerSegmentModel.addSegment(name, size, elasticity, description);
  }

  setMarketPosition(position) {
    if (['budget', 'mid-market', 'premium'].includes(position)) {
      this.marketPosition = position;
    } else {
      throw new Error('Market position must be "budget", "mid-market", or "premium"');
    }
  }

  calculateCostPlusPrice(marginMultiplier = 1) {
    const baseMinimumPrice = this.costModel.calculateMinimumViablePrice();
    
    const positionMultipliers = {
      'budget': 0.9,
      'mid-market': 1.0,
      'premium': 1.2
    };
    
    return baseMinimumPrice * positionMultipliers[this.marketPosition] * marginMultiplier;
  }

  calculateCompetitorIndexedPrice() {
    if (this.competitors.length === 0) {
      return this.calculateCostPlusPrice(); // Fall back to cost-plus
    }
    
    const avgCompetitorPrice = this.competitors.reduce(
      (sum, competitor) => sum + competitor.price, 0
    ) / this.competitors.length;
    
    const positionMultipliers = {
      'budget': 0.85,
      'mid-market': 1.0,
      'premium': 1.25
    };
    
    const basePrice = avgCompetitorPrice * positionMultipliers[this.marketPosition];
    
    const minimumViablePrice = this.costModel.calculateMinimumViablePrice();
    return Math.max(basePrice, minimumViablePrice);
  }

  calculateValueBasedPrice() {
    if (this.competitors.length === 0 || this.valueFactors.length === 0) {
      return this.calculateCostPlusPrice(); // Fall back to cost-plus
    }
    
    // Calculate your value score
    const valueScore = this.valueFactors.reduce(
      (sum, factor) => sum + (factor.importance * factor.score), 0
    ) / this.valueFactors.reduce((sum, factor) => sum + factor.importance, 0);
    
    // Calculate average competitor price and value
    const avgCompetitorPrice = this.competitors.reduce(
      (sum, competitor) => sum + competitor.price, 0
    ) / this.competitors.length;
    
    const avgCompetitorValue = this.competitors.reduce(
      (sum, competitor) => sum + competitor.overallValue, 0
    ) / this.competitors.length;
    
    // Calculate value-to-price ratio in the market
    const marketValueToPrice = avgCompetitorValue / avgCompetitorPrice;
    
    // Your price should reflect your relative value
    let valueBasedPrice = valueScore / marketValueToPrice;
    
    // Apply market position adjustment
    const positionMultipliers = {
      'budget': 0.9,
      'mid-market': 1.0,
      'premium': 1.15
    };
    
    valueBasedPrice *= positionMultipliers[this.marketPosition];
    
    // Ensure price covers costs with minimum margin
    const minimumViablePrice = this.costModel.calculateMinimumViablePrice();
    return Math.max(valueBasedPrice, minimumViablePrice);
  }

  getPriceRecommendation(strategy = 'optimal') {
    let price, explanation, confidenceLevel;
    
    switch (strategy) {
      case 'cost-plus':
        price = this.calculateCostPlusPrice();
        explanation = `Based on your cost structure and desired ${this.marketPosition} positioning, this price ensures your target margin of ${(this.costModel.targetMargin * 100).toFixed(0)}%.`;
        confidenceLevel = 0.8; // High confidence in cost calculations
        break;
        
      case 'competitor':
        price = this.calculateCompetitorIndexedPrice();
        explanation = `This price positions your offering in the ${this.marketPosition} segment relative to your competitors while ensuring profitability.`;
        confidenceLevel = this.competitors.length > 2 ? 0.7 : 0.5; // Confidence depends on number of competitors
        break;
      
      case 'value':
        price = this.calculateValueBasedPrice();
        explanation = `Based on your superior value offering, this price reflects the premium value you provide while maintaining competitive positioning.`;
        confidenceLevel = (this.competitors.length > 0 && this.valueFactors.length > 2) ? 0.75 : 0.4;
        break;
        
      case 'optimal':
      default:
        // For testing, we'll use a simple weighted average
        const weights = {
          costPlus: 0.4,
          competitor: 0.3,
          value: 0.3
        };
        
        price = (
          this.calculateCostPlusPrice() * weights.costPlus +
          this.calculateCompetitorIndexedPrice() * weights.competitor +
          this.calculateValueBasedPrice() * weights.value
        );
        
        explanation = `This optimal price balances your cost structure, competitive positioning, and value differentiation to maximize long-term profitability.`;
        confidenceLevel = 0.65;
        break;
    }
    
    return {
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
      explanation,
      confidenceLevel,
      margin: this.costModel.calculateMarginAtPrice(price),
      breakEvenVolume: this.costModel.calculateBreakEvenVolume(price)
    };
  }

  getAllPriceRecommendations() {
    return {
      'cost-plus': this.getPriceRecommendation('cost-plus'),
      'competitor': this.getPriceRecommendation('competitor'),
      'value': this.getPriceRecommendation('value'),
      'optimal': this.getPriceRecommendation('optimal')
    };
  }
}

// Simple ScenarioModel for testing
class ScenarioModel {
  constructor() {
    this.scenarios = {};
  }
  
  saveScenario(name, data) {
    this.scenarios[name] = {
      ...data,
      createdAt: new Date().toISOString()
    };
    return true;
  }
  
  getScenario(name) {
    return this.scenarios[name] || null;
  }
  
  getAllScenarios() {
    return this.scenarios;
  }
  
  deleteScenario(name) {
    if (this.scenarios[name]) {
      delete this.scenarios[name];
      return true;
    }
    return false;
  }
  
  compareScenarios(scenario1Name, scenario2Name) {
    const scenario1 = this.getScenario(scenario1Name);
    const scenario2 = this.getScenario(scenario2Name);
    
    if (!scenario1 || !scenario2) {
      return null;
    }
    
    // Create comparison results
    return {
      names: {
        scenario1: scenario1Name,
        scenario2: scenario2Name
      },
      prices: {
        scenario1: scenario1.pricingStrategy?.priceRecommendations?.optimal?.price || 0,
        scenario2: scenario2.pricingStrategy?.priceRecommendations?.optimal?.price || 0,
        difference: (scenario1.pricingStrategy?.priceRecommendations?.optimal?.price || 0) - 
                   (scenario2.pricingStrategy?.priceRecommendations?.optimal?.price || 0)
      },
      margins: {
        scenario1: scenario1.pricingStrategy?.priceRecommendations?.optimal?.margin || 0,
        scenario2: scenario2.pricingStrategy?.priceRecommendations?.optimal?.margin || 0,
        difference: (scenario1.pricingStrategy?.priceRecommendations?.optimal?.margin || 0) - 
                   (scenario2.pricingStrategy?.priceRecommendations?.optimal?.margin || 0)
      }
    };
  }
}

// Run tests

function runTests() {
  console.log("Running Dynamic Pricing Optimizer Model Tests\n");
  
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
  console.log("Break-Even Volume at $1200:", costModel.calculateBreakEvenVolume(1200));

  // Test 2: PricingModel with cost-plus strategy
  console.log("\nTest 2: PricingModel with cost-plus strategy");
  const pricingModel = new PricingModel(costModel);
  const costPlusPrice = pricingModel.calculateCostPlusPrice();
  console.log("Cost-Plus Price:", costPlusPrice);
  console.log("Cost-Plus Recommendation:", JSON.stringify(pricingModel.getPriceRecommendation('cost-plus')));

  // Test 3: PricingModel with competitors
  console.log("\nTest 3: PricingModel with competitors");
  pricingModel.addCompetitor('Competitor A', 1000);
  pricingModel.addCompetitor('Competitor B', 1200);
  const competitorPrice = pricingModel.calculateCompetitorIndexedPrice();
  console.log("Competitor-Indexed Price:", competitorPrice);
  console.log("Competitor-Based Recommendation:", JSON.stringify(pricingModel.getPriceRecommendation('competitor')));

  // Test 4: PricingModel with value factors
  console.log("\nTest 4: PricingModel with value factors");
  pricingModel.addValueFactor('Quality', 8, 9);
  pricingModel.addValueFactor('Support', 6, 8);
  pricingModel.addValueFactor('Features', 7, 7);
  const valuePrice = pricingModel.calculateValueBasedPrice();
  console.log("Value-Based Price:", valuePrice);
  console.log("Value-Based Recommendation:", JSON.stringify(pricingModel.getPriceRecommendation('value')));

  // Test 5: Market position impact
  console.log("\nTest 5: Market position impact");
  console.log("Mid-market pricing:", JSON.stringify(pricingModel.getPriceRecommendation('optimal')));
  pricingModel.setMarketPosition('premium');
  console.log("Premium pricing:", JSON.stringify(pricingModel.getPriceRecommendation('optimal')));
  pricingModel.setMarketPosition('budget');
  console.log("Budget pricing:", JSON.stringify(pricingModel.getPriceRecommendation('optimal')));

  // Test 6: Customer segments
  console.log("\nTest 6: Customer segments");
  const enterpriseId = pricingModel.addSegment('Enterprise', 30, 3, 'Large enterprise customers');
  const smbId = pricingModel.addSegment('SMB', 50, 7, 'Small and medium businesses');
  const startupId = pricingModel.addSegment('Startup', 20, 9, 'Early-stage startups');
  console.log("Customer Segments:", pricingModel.segments);
  
  // Test segment update and removal
  console.log("\nTest 7: Customer segment operations");
  const updateResult = pricingModel.customerSegmentModel.updateSegment(smbId, { size: 55, description: 'Updated SMB description' });
  console.log("Update Result:", updateResult);
  console.log("Updated Segments:", pricingModel.segments);
  
  const removeResult = pricingModel.customerSegmentModel.removeSegment(startupId);
  console.log("Remove Result:", removeResult);
  console.log("Remaining Segments:", pricingModel.segments);
  
  // Test weighted elasticity
  console.log("\nTest 8: Weighted elasticity");
  console.log("Weighted Elasticity:", pricingModel.customerSegmentModel.calculateWeightedElasticity());

  // Test 9: Get all price recommendations
  console.log("\nTest 9: All price recommendations");
  console.log(JSON.stringify(pricingModel.getAllPriceRecommendations(), null, 2));

  // Test 10: Scenario Model
  console.log("\nTest 10: ScenarioModel functionality");
  const scenarioModel = new ScenarioModel();
  
  // Save scenarios
  scenarioModel.saveScenario('Basic Strategy', {
    costAnalysis: {
      costBreakdown: { total: 750, direct: 50, time: 600, indirect: 100 }
    },
    pricingStrategy: {
      marketPosition: 'mid-market',
      priceRecommendations: {
        optimal: { price: 1071.43, margin: 0.30 }
      }
    }
  });
  
  scenarioModel.saveScenario('Premium Strategy', {
    costAnalysis: {
      costBreakdown: { total: 750, direct: 50, time: 600, indirect: 100 }
    },
    pricingStrategy: {
      marketPosition: 'premium',
      priceRecommendations: {
        optimal: { price: 1285.72, margin: 0.42 }
      }
    }
  });
  
  console.log("All Scenarios:", Object.keys(scenarioModel.getAllScenarios()));
  console.log("Basic Strategy:", scenarioModel.getScenario('Basic Strategy'));
  
  // Compare scenarios
  console.log("\nTest 11: Scenario Comparison");
  console.log("Comparison:", JSON.stringify(scenarioModel.compareScenarios('Basic Strategy', 'Premium Strategy'), null, 2));
  
  // Delete scenario
  console.log("\nTest 12: Delete Scenario");
  console.log("Delete Result:", scenarioModel.deleteScenario('Basic Strategy'));
  console.log("Remaining Scenarios:", Object.keys(scenarioModel.getAllScenarios()));

  // Verify edge cases and error handling
  console.log("\nTest 13: Error handling");
  try {
    pricingModel.setMarketPosition('luxury');
    console.log("Error: Should have thrown an error for invalid market position");
  } catch (e) {
    console.log("Successfully caught invalid market position error:", e.message);
  }
}

// Execute tests
runTests();
