import type { Sale, CalculatedKPI, Customer, Product, Time } from '@/types';
import type { ChartGrouping } from '@/stores/dashboard';

// ==================== KPI Calculation ====================

export function calculateKPIs(sales: Sale[], times: Time[]): CalculatedKPI[] {
  // Filter out null or undefined sales entries
  const validSales = sales.filter((sale): sale is Sale => sale !== null && sale !== undefined);
  
  if (validSales.length === 0) {
    return [];
  }
  
  // Calculate totals
  const totalSales = validSales.reduce((sum, s) => sum + s.sales, 0);
  const totalCosts = validSales.reduce((sum, s) => sum + s.costs, 0);
  const totalUnits = validSales.reduce((sum, s) => sum + s.units, 0);
  
  // Calculate margin
  const grossMargin = totalSales - totalCosts;
  const marginPercentage = totalSales > 0 ? (grossMargin / totalSales) * 100 : 0;
  const costOfSalePercentage = totalSales > 0 ? (totalCosts / totalSales) * 100 : 0;
  
  // Calculate average
  const averageSale = totalSales / validSales.length;
  
  // Calculate Monthly Variation (last 2 completed months)
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
      formattedValue: `${marginPercentage.toFixed(1)}%`,
      type: 'percentage',
    },
    {
      name: 'Cost of Sale %',
      value: costOfSalePercentage,
      formattedValue: `${costOfSalePercentage.toFixed(1)}%`,
      type: 'percentage',
    },
    {
      name: 'Monthly Variation',
      value: monthlyVariation ?? 0,
      formattedValue: monthlyVariation === null ? 'N/A' : `${monthlyVariation >= 0 ? '+' : ''}${Math.abs(monthlyVariation).toFixed(1)}%`,
      type: 'percentage',
    },
    {
      name: 'Units Sold',
      value: totalUnits,
      formattedValue: totalUnits.toLocaleString(),
      type: 'number',
    },
    {
      name: 'Average Sale',
      value: averageSale,
      formattedValue: formatCurrency(averageSale),
      type: 'currency',
    },
  ];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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

// KPIs by customer
export function calculateKPIsByCustomer(sales: Sale[], customers: Customer[]): Map<string, CalculatedKPI[]> {
  const kpisByCustomer = new Map<string, CalculatedKPI[]>();
  
  const salesByCustomer = new Map<string, Sale[]>();
  
  sales.forEach(sale => {
    const existing = salesByCustomer.get(sale.customerId) || [];
    existing.push(sale);
    salesByCustomer.set(sale.customerId, existing);
  });
  
  salesByCustomer.forEach((salesForCustomer, customerId) => {
    const kpis = calculateKPIs(salesForCustomer, []);
    kpisByCustomer.set(customerId, kpis);
  });
  
  return kpisByCustomer;
}

// KPIs by product
export function calculateKPIsByProduct(sales: Sale[], products: Product[]): Map<string, CalculatedKPI[]> {
  const kpisByProduct = new Map<string, CalculatedKPI[]>();
  
  const salesByProduct = new Map<string, Sale[]>();
  
  sales.forEach(sale => {
    const existing = salesByProduct.get(sale.productId) || [];
    existing.push(sale);
    salesByProduct.set(sale.productId, existing);
  });
  
  salesByProduct.forEach((salesForProduct, productId) => {
    const kpis = calculateKPIs(salesForProduct, []);
    kpisByProduct.set(productId, kpis);
  });
  
  return kpisByProduct;
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
        name: product?.category || productId,
        value: salesAmount,
      };
    })
    .sort((a, b) => b.value - a.value);
}