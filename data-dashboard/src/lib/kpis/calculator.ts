import type { Sale, CalculatedKPI, Customer, Product } from '@/types';

export function calculateKPIs(sales: Sale[]): CalculatedKPI[] {
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
  
  // Calculate average
  const averageSale = totalSales / sales.length;
  const averageUnits = totalUnits / sales.length;

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
    const kpis = calculateKPIs(salesCustomer);
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
    const kpis = calculateKPIs(salesProduct);
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