import type { Sale, CalculatedKPI, Customer, Product, Time } from '@/types';

export function calculateKPIs(sales: Sale[], times: Time[]): CalculatedKPI[] {
  if (sales.length === 0) {
    return [];
  }

  // Calculate totals
  const totalSales = sales.reduce((sum, s) => sum + s.sales, 0);
  const totalCosts = sales.reduce((sum, s) => sum + s.costs, 0);
  const totalUnits = sales.reduce((sum, s) => sum + s.units, 0);
  
  // Calculate margin
  const grossMargin = totalSales - totalCosts;
  const marginPercentage = totalSales > 0 ? (grossMargin / totalSales) * 100 : 0;
  const costOfSalePercentage = totalSales > 0 ? (totalCosts / totalSales) * 100 : 0;
  
  // Calculate average
  const averageSale = totalSales / sales.length;
  const averageUnits = totalUnits / sales.length;
  
  // Calculate Monthly Variation (last 2 completed months)
  const monthlyVariation = calculateMonthlyVariation(sales, times);
  console.log("Monthly Variation: ", monthlyVariation);

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
  console.log("Sales in Calculating monthly variation: ", sales);
  console.log("Times in Calculating monthly variation: ", times);
  if (sales.length === 0) {
    console.log(" EN IF RETURN NULL (no sales)");
    return null;
  }

  // Get current year and month to identify the current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Create a map of month->year to total sales, excluding current month
  const salesByMonth = new Map<string, number>();
  console.log("salesByMonth initial: ", salesByMonth);
  
  // Group sales by month/year, excluding current month
  // Extract year/month directly from sale date (YYYY-MM-DD format)
  sales.forEach(sale => {
    // Parse date manually from YYYY-MM-DD format to avoid timezone issues
    const [yearStr, monthStr, dayStr] = sale.date.split('-');
    const saleYear = parseInt(yearStr, 10);
    const saleMonth = parseInt(monthStr, 10);
    
    console.log(`Processing sale date: ${sale.date}, parsed year: ${saleYear}, month: ${saleMonth}`);
    
    // Skip if this is the current month (incomplete)
    if (saleYear === currentYear && saleMonth === currentMonth) {
      console.log(`Skipping current month sale: ${sale.date}`);
      return;
    }
    
    if (saleMonth === 3) console.log("TERMINO 3 : ", sale);
    if (saleMonth === 2) console.log("TERMINO 2 : ", sale);
    
    // Format as YYYY-MM for consistent sorting
    const monthYearKey = `${saleYear}-${saleMonth.toString().padStart(2, '0')}`;
    const current = salesByMonth.get(monthYearKey) || 0;
    salesByMonth.set(monthYearKey, current + sale.sales);
  });

  console.log("salesByMonth after processing: ", salesByMonth);
  
  // Convert to array and sort by year/month descending (most recent first)
  const sortedMonths = Array.from(salesByMonth.entries())
    .map(([monthYear, sales]) => ({
      monthYear,
      sales: Number(sales)
    }))
    .sort((a, b) => b.monthYear.localeCompare(a.monthYear)); // Descending order

  console.log("sortedMonths: ", sortedMonths);
  
  // Need at least 2 completed months to calculate variation
  if (sortedMonths.length < 2) {
    console.log("Not enough completed months: ", sortedMonths.length);
    return null;
  }

  // Get the last 2 completed months (most recent and previous)
  const [mostRecent, previous] = sortedMonths.slice(0, 2);
  
  // Calculate percentage change: ((current - previous) / previous) * 100
  if (previous.sales === 0) {
    return mostRecent.sales > 0 ? 100 : 0;
  }
  console.log("mostRecent.sales: ", mostRecent.sales);
  console.log("previous.sales: ", previous.sales);
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
  
  salesByCustomer.forEach((salesCustomer, customerId) => {
    const kpis = calculateKPIs(salesCustomer, []); // Pass empty times array for now
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
  
  salesByProduct.forEach((salesProduct, productId) => {
    const kpis = calculateKPIs(salesProduct, []); // Pass empty times array for now
    kpisByProduct.set(productId, kpis);
  });
  
  return kpisByProduct;
}

// Chart data for sales by date
export function getSalesByDateChartData(sales: Sale[]): { date: string; sales: number; costs: number; margin: number }[] {
  const dataByDate = new Map<string, { sales: number; costs: number }>();
  
  sales.forEach(sale => {
    const existing = dataByDate.get(sale.date) || { sales: 0, costs: 0 };
    existing.sales += sale.sales;
    existing.costs += sale.costs;
    dataByDate.set(sale.date, existing);
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