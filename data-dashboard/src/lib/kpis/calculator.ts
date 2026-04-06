import type { Hecho, KPICalculado, Cliente, Producto } from '@/types';

export function calcularKPIs(hechos: Hecho[]): KPICalculado[] {
  if (hechos.length === 0) {
    return [];
  }

  // Calcular totales
  const totalVentas = hechos.reduce((sum, h) => sum + h.Ventas, 0);
  const totalCostos = hechos.reduce((sum, h) => sum + h.Costos, 0);
  const totalUnidades = hechos.reduce((sum, h) => sum + h.Unidades, 0);
  
  // Calcular margen
  const margenBruto = totalVentas - totalCostos;
  const margenPorcentaje = totalVentas > 0 ? (margenBruto / totalVentas) * 100 : 0;
  
  // Calcular promedio
  const promedioVenta = totalVentas / hechos.length;
  const promedioUnidades = totalUnidades / hechos.length;

  return [
    {
      nombre: 'Ventas Totales',
      valor: totalVentas,
      formattedValue: formatCurrency(totalVentas),
      tipo: 'moneda',
    },
    {
      nombre: 'Costos Totales',
      valor: totalCostos,
      formattedValue: formatCurrency(totalCostos),
      tipo: 'moneda',
    },
    {
      nombre: 'Margen Bruto',
      valor: margenBruto,
      formattedValue: formatCurrency(margenBruto),
      tipo: 'moneda',
    },
    {
      nombre: 'Margen %',
      valor: margenPorcentaje,
      formattedValue: `${margenPorcentaje.toFixed(1)}%`,
      tipo: 'porcentaje',
    },
    {
      nombre: 'Unidades Vendidas',
      valor: totalUnidades,
      formattedValue: totalUnidades.toLocaleString(),
      tipo: 'numero',
    },
    {
      nombre: 'Promedio por Venta',
      valor: promedioVenta,
      formattedValue: formatCurrency(promedioVenta),
      tipo: 'moneda',
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

// KPIs por cliente
export function calcularKPIsPorCliente(hechos: Hecho[], clientes: Cliente[]): Map<string, KPICalculado[]> {
  const kpisPorCliente = new Map<string, KPICalculado[]>();
  
  // Agrupar hechos por cliente
  const hechosPorCliente = new Map<string, Hecho[]>();
  
  hechos.forEach(hecho => {
    const existentes = hechosPorCliente.get(hecho.IDCliente) || [];
    existentes.push(hecho);
    hechosPorCliente.set(hecho.IDCliente, existentes);
  });
  
  // Calcular KPIs por cliente
  hechosPorCliente.forEach((hechosCliente, idCliente) => {
    const kpis = calcularKPIs(hechosCliente);
    kpisPorCliente.set(idCliente, kpis);
  });
  
  return kpisPorCliente;
}

// KPIs por producto
export function calcularKPIsPorProducto(hechos: Hecho[], productos: Producto[]): Map<string, KPICalculado[]> {
  const kpisPorProducto = new Map<string, KPICalculado[]>();
  
  const hechosPorProducto = new Map<string, Hecho[]>();
  
  hechos.forEach(hecho => {
    const existentes = hechosPorProducto.get(hecho.IDProducto) || [];
    existentes.push(hecho);
    hechosPorProducto.set(hecho.IDProducto, existentes);
  });
  
  hechosPorProducto.forEach((hechosProducto, idProducto) => {
    const kpis = calcularKPIs(hechosProducto);
    kpisPorProducto.set(idProducto, kpis);
  });
  
  return kpisPorProducto;
}

// Datos para gráficos
export function obtenerDatosGraficoVentasPorFecha(hechos: Hecho[]): { fecha: string; ventas: number; costos: number; margen: number }[] {
  const datosPorFecha = new Map<string, { ventas: number; costos: number }>();
  
  hechos.forEach(hecho => {
    const existente = datosPorFecha.get(hecho.Fecha) || { ventas: 0, costos: 0 };
    existente.ventas += hecho.Ventas;
    existente.costos += hecho.Costos;
    datosPorFecha.set(hecho.Fecha, existente);
  });
  
  return Array.from(datosPorFecha.entries())
    .map(([fecha, datos]) => ({
      fecha,
      ventas: datos.ventas,
      costos: datos.costos,
      margen: datos.ventas - datos.costos,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function obtenerDatosGraficoVentasPorCliente(hechos: Hecho[], clientes: Cliente[]): { name: string; value: number }[] {
  const datosPorCliente = new Map<string, number>();
  
  hechos.forEach(hecho => {
    const existente = datosPorCliente.get(hecho.IDCliente) || 0;
    datosPorCliente.set(hecho.IDCliente, existente + hecho.Ventas);
  });
  
  return Array.from(datosPorCliente.entries())
    .map(([idCliente, ventas]) => {
      const cliente = clientes.find(c => c.IDCliente === idCliente);
      return {
        name: cliente?.Nombre || idCliente,
        value: ventas,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function obtenerDatosGraficoVentasPorProducto(hechos: Hecho[], productos: Producto[]): { name: string; value: number }[] {
  const datosPorProducto = new Map<string, number>();
  
  hechos.forEach(hecho => {
    const existente = datosPorProducto.get(hecho.IDProducto) || 0;
    datosPorProducto.set(hecho.IDProducto, existente + hecho.Ventas);
  });
  
  return Array.from(datosPorProducto.entries())
    .map(([idProducto, ventas]) => {
      const producto = productos.find(p => p.IDProducto === idProducto);
      return {
        name: producto?.Categoría || idProducto,
        value: ventas,
      };
    })
    .sort((a, b) => b.value - a.value);
}