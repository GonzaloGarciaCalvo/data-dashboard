// Data types for CSV

export interface Customer {
  customerId: string;
  name: string;
  region: string;
  segment: string;
}

export interface Product {
  productId: string;
  category: string;
  brand: string;
}

export interface Time {
  timeId: string;
  date: string;
  month: string;
  quarter: string;
  year: string;
}

export interface Sale {
  date: string;
  year?: string;
  customerId: string;
  productId: string;
  sales: number;
  costs: number;
  units: number;
  saleId?: string;
}

// CSV row type - accepts both English and Spanish column names
export interface CSVRow {
  [key: string]: string | number;
}

// Type guards for detecting data
export function isCustomer(data: CSVRow): boolean {
  return 'customerId' in data || 'idcliente' in data || 'IDCliente' in data;
}

export function isProduct(data: CSVRow): boolean {
  return 'productId' in data || 'idproducto' in data || 'IDProducto' in data;
}

export function isTime(data: CSVRow): boolean {
  return 'timeId' in data || 'idtiempo' in data || 'IDTiempo' in data;
}

export function isSale(data: CSVRow): boolean {
  return 'sales' in data || 'ventas' in data || 'Ventas' in data;
}

export interface DashboardData {
  customers: Customer[];
  products: Product[];
  times: Time[];
  sales: Sale[];
}

export interface CalculatedKPI {
  name: string;
  value: number;
  formattedValue: string;
  type: 'currency' | 'percentage' | 'number';
  variation?: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export type Role = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface FileUpload {
  file: File;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  type: 'customers' | 'products' | 'times' | 'sales';
}

export interface FileListProps {
  files: FileUpload[];
  removeFile: (file: File) => void;
}