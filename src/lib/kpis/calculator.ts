import type { Sale, CalculatedKPI, Customer, Product, Time } from '@/types';
import type { ChartGrouping } from '@/stores/dashboard';

// ==================== Helper Functions for Consistent English Formatting ====================
// Since the app is in English, we enforce US number formatting:
// - Thousands separator: comma (,)
// - Decimal separator: period (.)

// Format a number as currency (USD) with no decimal places
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format a number as percentage with 1 decimal place
function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100); // Input is in percent (e.g. 15.5 for 15.5%), convert to ratio
}

// Format a plain number (e.g. units) with thousands separators
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

// ==================== KPI Calculation ====================

export function calculateKPIs(sales: Sale[], times: Time[]): CalculatedKPI[] {
  const validSales = sales.filter((sale): sale is Sale => sale !== null && sale !== undefined);

  if (validSales.length === 0) {
    return [];
  }

  const totalSales = validSales.reduce((sum, s) => sum + s.sales, 0);
  const totalCosts = validSales.reduce((sum, s) => sum + s.costs, 0);
  const totalUnits = validSales.reduce((sum, s) => sum + s.units, 0);
  
  const grossMargin = totalSales - totalCosts;
  const marginPercentage = totalSales > 0 ? (grossMargin / totalSales) * 100 : 0;
  const costOfSalePercentage = totalSales > 0 ? (totalCosts / totalSales) * 100 : 0;
  
  const { mean: averageAmount, stdDev: stdDeviation } = calculateStatistics(
    validSales.map(s => s.sales)
  );
  
  const monthlyVariation = calculateMonthlyVariation(sales, times);
  
  return [
    {
      name: 'Total Sales',
      value: totalSales,
      formattedValue: formatCurrency(totalSales),
      type: 'currency',
    },
    {
      name: 'Total Costs',
      value: totalCosts,
      formattedValue: formatCurrency(totalCosts),
      type: 'currency',
    },
    {
      name: 'Gross Margin',
      value: grossMargin,
      formattedValue: formatCurrency(grossMargin),
      type: 'currency',
    },
    {
      name: 'Margin %',
      value: marginPercentage,
      formattedValue: formatPercentage(marginPercentage),
      type: 'percentage',
    },
    {
      name: 'Cost of Sale %',
      value: costOfSalePercentage,
      formattedValue: formatPercentage(costOfSalePercentage),
      type: 'percentage',
    },
    {
      name: 'Monthly Variation',
      value: monthlyVariation ?? 0,
      formattedValue: monthlyVariation === null ? 'N/A' : `${monthlyVariation >= 0 ? '+' : ''}${formatPercentage(Math.abs(monthlyVariation ?? 0)).replace('%', '')}%`,
      type: 'percentage',
    },
    {
      name: 'Units Sold',
      value: totalUnits,
      formattedValue: formatNumber(totalUnits),
      type: 'number',
    },
    {
      name: 'Average Amount',
      value: averageAmount,
      formattedValue: formatCurrency(averageAmount),
      type: 'currency',
    },
    {
      name: 'Std Deviation',
      value: stdDeviation,
      formattedValue: formatCurrency(stdDeviation),
      type: 'currency',
      variation: stdDeviation // opcional: para mostrar variación en tooltip o gráfico
    },
  ];
}

// Helper function to calculate mean and population standard deviation
function calculateStatistics(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0 };
  }
  
  // Calculate sum in one pass
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / values.length;
  
  // Calculate sum of squared differences from the mean
  const squaredDiffsSum = values.reduce((acc, v) => {
    const diff = v - mean;
    return acc + (diff * diff);
  }, 0);
  
  // Population variance (divide by N)
  const variance = squaredDiffsSum / values.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, stdDev };
}

// Calculate monthly variation between last 2 completed months
function calculateMonthlyVariation(sales: Sale[], times: Time[]): number | null {
  // Filter out null or undefined sales entries
  const validSales = sales.filter((sale): sale is Sale => sale !== null && sale !== undefined);
  
  if (validSales.length === 0) {
    return null;
  }

  // Get current year and month to identify the current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Create a map of month->year to total sales, excluding current month
  const salesByMonth = new Map<string, number>();
    
  validSales.forEach(sale => {
    // Parse date manually from YYYY-MM-DD format to avoid timezone issues
    const [yearStr, monthStr] = sale.date.split('-');
    const saleYear = parseInt(yearStr, 10);
    const saleMonth = parseInt(monthStr, 10);
    
    // Skip if this is the current month (incomplete)
    if (saleYear === currentYear && saleMonth === currentMonth) {
      return;
    }
    
    const monthYearKey = `${saleYear}-${saleMonth.toString().padStart(2, '0')}`;
    const current = salesByMonth.get(monthYearKey) || 0;
    salesByMonth.set(monthYearKey, current + sale.sales);
  });

  // Convert to array and sort by year/month descending (most recent first)
  const sortedMonths = Array.from(salesByMonth.entries())
    .map(([monthYear, salesAmount]) => ({
      monthYear,
      sales: Number(salesAmount)
    }))
    .sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  // Need at least 2 completed months to calculate variation
  if (sortedMonths.length < 2) {
    return null;
  }

  // Get the last 2 completed months (most recent and previous)
  const [mostRecent, previous] = sortedMonths.slice(0, 2);
  
  // Calculate percentage change: ((current - previous) / previous) * 100
  if (previous.sales === 0) {
    return mostRecent.sales > 0 ? 100 : 0;
  }
  
  return ((mostRecent.sales - previous.sales) / previous.sales) * 100;
}

// ==================== Chart Data ====================

export function getSalesByDateChartData(
  sales: Sale[], 
  grouping: ChartGrouping = 'day'
): { date: string; sales: number; costs: number; margin: number }[] {
  const dataByDate = new Map<string, { sales: number; costs: number }>();
  
  sales.forEach(sale => {
    const groupKey = getGroupKey(sale.date, grouping);
    const existing = dataByDate.get(groupKey) || { sales: 0, costs: 0 };
    existing.sales += sale.sales;
    existing.costs += sale.costs;
    dataByDate.set(groupKey, existing);
  });
  
  return Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      costs: data.costs,
      margin: data.sales - data.costs,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getGroupKey(dateStr: string, grouping: ChartGrouping): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (grouping === 'day') {
    return dateStr;
  }
  
  if (grouping === 'week') {
    const firstDayOfYear = new Date(year, 0, 1);
    const pasteDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pasteDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNum.toString().padStart(2, '0')}`;
  }
  
  if (grouping === 'month') {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }
  
  if (grouping === 'quarter') {
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  }
  
  return dateStr;
}

export function getSalesByCustomerChartData(sales: Sale[], customers: Customer[]): { name: string; value: number }[] {
  const dataByCustomer = new Map<string, number>();
  
  sales.forEach(sale => {
    const existing = dataByCustomer.get(sale.customerId) || 0;
    dataByCustomer.set(sale.customerId, existing + sale.sales);
  });
  
  return Array.from(dataByCustomer.entries())
    .map(([customerId, salesAmount]) => {
      const customer = customers.find(c => c.customerId === customerId);
      return {
        name: customer?.name || customerId,
        value: salesAmount,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getSalesByProductChartData(sales: Sale[], products: Product[]): { name: string; value: number }[] {
  const dataByProduct = new Map<string, number>();
  
  sales.forEach(sale => {
    const existing = dataByProduct.get(sale.productId) || 0;
    dataByProduct.set(sale.productId, existing + sale.sales);
  });
  
  return Array.from(dataByProduct.entries())
    .map(([productId, salesAmount]) => {
      const product = products.find(p => p.productId === productId);
      return {
        name: product?.name || productId,
        value: salesAmount,
      };
    })
    .sort((a, b) => b.value - a.value);
}