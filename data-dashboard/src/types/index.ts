// Tipos para los datos del CSV

export interface Cliente {
  IDCliente: string;
  Nombre: string;
  Región: string;
  Segmento: string;
}

export interface Producto {
  IDProducto: string;
  Categoría: string;
  Marca: string;
}

export interface Tiempo {
  IDTiempo: string;
  Fecha: string;
  Mes: string;
  Trimestre: string;
  Año: string;
}

export interface Hecho {
  Fecha: string;
  IDCliente: string;
  IDProducto: string;
  Ventas: number;
  Costos: number;
  Unidades: number;
}

export interface DatosDashboard {
  clientes: Cliente[];
  productos: Producto[];
  tiempos: Tiempo[];
  hechos: Hecho[];
}

export interface KPICalculado {
  nombre: string;
  valor: number;
  formattedValue: string;
  tipo: 'moneda' | 'porcentaje' | 'numero';
  Variación?: number;
}

export interface GraficoData {
  name: string;
  value: number;
  color?: string;
}

export type Role = 'admin' | 'manager' | 'viewer';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Role;
}