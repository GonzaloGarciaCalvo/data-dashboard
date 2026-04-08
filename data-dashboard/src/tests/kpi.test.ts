import { describe, it, assert, expect } from 'vitest';  
import { calculateKPIs, getSalesByDateChartData, getSalesByCustomerChartData, getSalesByProductChartData } from '../lib/kpis/calculator.js';
import type { Sale, Customer, Product, Time } from '../types/index.js';

// Sample data for testing
const mockSales = [
  { date: '2026-02-02', customerId: 'C001', productId: 'P001', sales: 1300, costs: 850, units: 90 },
  { date: '2026-02-04', customerId: 'C002', productId: 'P002', sales: 1200, costs: 800, units: 70 },
  { date: '2026-02-05', customerId: 'C003', productId: 'P001', sales: 750, costs: 430, units: 45 },
  { date: '2026-02-05', customerId: 'C001', productId: 'P002', sales: 1600, costs: 970, units: 100 },
  { date: '2026-02-07', customerId: 'C003', productId: 'P001', sales: 900, costs: 480, units: 55 },
  { date: '2026-02-08', customerId: 'C001', productId: 'P002', sales: 1550, costs: 950, units: 100 },
  { date: '2026-02-10', customerId: 'C002', productId: 'P001', sales: 750, costs: 440, units: 45 },
  { date: '2026-02-11', customerId: 'C001', productId: 'P002', sales: 1580, costs: 950, units: 100 },
  { date: '2026-02-13', customerId: 'C003', productId: 'P001', sales: 720, costs: 440, units: 43 },
  { date: '2026-02-16', customerId: 'C001', productId: 'P002', sales: 1500, costs: 950, units: 97 },
  { date: '2026-02-20', customerId: 'C002', productId: 'P001', sales: 700, costs: 450, units: 45 },
  { date: '2026-02-23', customerId: 'C002', productId: 'P002', sales: 1500, costs: 930, units: 95 },
  { date: '2026-02-25', customerId: 'C003', productId: 'P001', sales: 630, costs: 450, units: 45 },
  { date: '2026-02-29', customerId: 'C001', productId: 'P002', sales: 1550, costs: 950, units: 95 },
  // March data
  { date: '2026-03-02', customerId: 'C001', productId: 'P001', sales: 1400, costs: 850, units: 90 },
  { date: '2026-03-04', customerId: 'C002', productId: 'P002', sales: 1200, costs: 800, units: 70 },
  { date: '2026-03-05', customerId: 'C003', productId: 'P001', sales: 750, costs: 430, units: 45 },
  { date: '2026-03-05', customerId: 'C001', productId: 'P002', sales: 1600, costs: 970, units: 100 },
  { date: '2026-03-07', customerId: 'C003', productId: 'P001', sales: 900, costs: 480, units: 55 },
  { date: '2026-03-08', customerId: 'C001', productId: 'P002', sales: 1600, costs: 950, units: 100 },
  { date: '2026-03-10', customerId: 'C002', productId: 'P001', sales: 750, costs: 440, units: 45 },
  { date: '2026-03-11', customerId: 'C001', productId: 'P002', sales: 1600, costs: 950, units: 100 },
  { date: '2026-03-13', customerId: 'C003', productId: 'P001', sales: 720, costs: 440, units: 43 },
  { date: '2026-03-16', customerId: 'C001', productId: 'P002', sales: 1500, costs: 950, units: 97 },
  { date: '2026-03-19', customerId: 'C002', productId: 'P001', sales: 700, costs: 450, units: 45 },
  { date: '2026-03-23', customerId: 'C002', productId: 'P002', sales: 1500, costs: 930, units: 95 },
  { date: '2026-03-26', customerId: 'C003', productId: 'P001', sales: 700, costs: 450, units: 45 },
  { date: '2026-03-29', customerId: 'C001', productId: 'P002', sales: 1550, costs: 950, units: 95 },
] as Sale[];

const mockTimes: Time[] = [];

describe('KPI Calculator', () => {
  it('should calculate total sales correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const totalSales = kpis.find(k => k.name === 'Total Sales');
    assert.strictEqual(totalSales?.value, 32700);
  });

  it('should calculate total costs correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const totalCosts = kpis.find(k => k.name === 'Total Costs');
    assert.strictEqual(totalCosts?.value, 20080);
  });

  it('should calculate gross margin correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const grossMargin = kpis.find(k => k.name === 'Gross Margin');
    assert.strictEqual(grossMargin?.value, 12620);
  });

  it('should calculate margin percentage correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const marginPct = kpis.find(k => k.name === 'Margin %');
    expect(marginPct?.value).toBeCloseTo(38.593, 2);
  });

  it('should calculate cost of sale percentage correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const costOfSale = kpis.find(k => k.name === 'Cost of Sale %');
    expect(costOfSale?.value).toBeCloseTo(61.406, 2);
  });

  it('should calculate units sold correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const unitsSold = kpis.find(k => k.name === 'Units Sold');
    assert.strictEqual(unitsSold?.value, 2050);
  });

  it('should calculate average sale correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const avgSale = kpis.find(k => k.name === 'Average Sale');
    expect(avgSale?.value).toBeCloseTo(1167.86, 2);
  });

  it('should calculate monthly variation between February and March', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const monthlyVariation = kpis.find(k => k.name === 'Monthly Variation');
    expect(monthlyVariation?.value).toBeCloseTo(1.478, 2);
  });

  it('should calculate average sale correctly', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const avgSale = kpis.find(k => k.name === 'Average Sale');
    expect(avgSale?.value).toBeCloseTo(1167.857, 2);
  });

  it('should return empty array when sales is empty', () => {
    const kpis = calculateKPIs([], mockTimes);
    assert.deepEqual(kpis, []);
  });

  it('should calculate monthly variation between February and March', () => {
    const kpis = calculateKPIs(mockSales, mockTimes);
    const monthlyVariation = kpis.find(k => k.name === 'Monthly Variation');
    expect(monthlyVariation?.value).toBeCloseTo(1.478, 2);
  });
});

describe('getSalesByDateChartData', () => {
  it('should aggregate sales by date correctly', () => {
    const chartData = getSalesByDateChartData(mockSales);
    const firstDate = chartData.find(d => d.date === '2026-02-02');
    assert.strictEqual(firstDate?.sales, 1300);
    assert.strictEqual(firstDate?.costs, 850);
    assert.strictEqual(firstDate?.margin, 450);
  });

  it('should sort dates in ascending order', () => {
    const chartData = getSalesByDateChartData(mockSales);
    for (let i = 1; i < chartData.length; i++) {
      assert.ok(chartData[i].date >= chartData[i - 1].date);
    }
  });
});

describe('getSalesByCustomerChartData', () => {
  const mockCustomers = [
    { customerId: 'C001', name: 'Customer 1', region: 'North', segment: 'Premium' },
    { customerId: 'C002', name: 'Customer 2', region: 'South', segment: 'Standard' },
    { customerId: 'C003', name: 'Customer 3', region: 'East', segment: 'Premium' },
  ] as Customer[];

  it('should aggregate sales by customer correctly', () => {
    const chartData = getSalesByCustomerChartData(mockSales, mockCustomers);
    const customer1 = chartData.find(c => c.name === 'Customer 1');
    if (customer1) assert.ok(customer1?.value > 0);
  });
});

describe('getSalesByProductChartData', () => {
  const mockProducts = [
    { productId: 'P001', category: 'Electronics', brand: 'Brand A' },
    { productId: 'P002', category: 'Clothing', brand: 'Brand B' },
  ] as Product[];

  it('should aggregate sales by product correctly', () => {
    const chartData = getSalesByProductChartData(mockSales, mockProducts);
    assert.ok(chartData.length > 0);
  });
});
