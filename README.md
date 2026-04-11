# Data Dashboard - Sales Visualization App

A Next.js 16 application for visualizing sales data from CSV files with interactive KPIs, charts, and filtering capabilities.

## Features Implemented

### 📊 Data Upload & Processing
- **CSV Upload**: Drag & drop or browse to upload CSV files
- **File Validation**: Validates file type (.csv, .cvs) and size
- **Multi-format Support**: Accepts Spanish column names (Ventas, Costos, Unidades) or English (sales, costs, units)
- **Data Types**: Supports Customers, Products, Time dimension, and Sales data

### 📈 KPI Calculations
| KPI | Description |
|-----|-------------|
| Total Sales | Sum of all sales amounts |
| Total Costs | Sum of all costs |
| Gross Margin | Total Sales - Total Costs |
| Margin % | (Gross Margin / Total Sales) × 100 |
| Cost of Sale % | (Total Costs / Total Sales) × 100 |
| Monthly Variation | % change between last 2 completed months |
| Units Sold | Sum of all units |
| Average Sale | Total Sales / Number of transactions |

### 🎛️ Period Filtering
Filters the data displayed based on selected period:

| Period | Description | Shows Monthly Variation |
|--------|-------------|------------------------|
| All | All available data (any year) | ✅ |
| Annual | Current year only (2026) | ✅ |
| Quarterly | Last 3 completed months | ✅ |
| Last Month | Last completed month | ❌ |
| Current | Current month (may have partial data) | ❌ |
| Manual | Last N months (dynamic: 1 to N) | ✅ if >= 3 months |

### 📉 Chart Grouping
Groups data in charts by different time periods:

| Grouping | Available For | Format |
|----------|---------------|--------|
| Day | All periods | YYYY-MM-DD |
| Week | All periods | YYYY-W## |
| Month | All/Annual/Quarterly, Manual >1m | YYYY-MM |
| Quarter | All/Annual/Quarterly | YYYY-Q# |

### 📊 Visualizations
- **Sales by Date**: Line chart showing sales, costs, and margin over time
- **Sales by Customer**: Pie chart showing distribution by customer
- **Sales by Product**: Bar chart showing sales by product category
- **Sales (Costs + Margin)**: Stacked bar chart where Costs + Margin = Total Sales

### 🎨 UI/UX Features
- **Responsive Design**: Works on mobile and desktop
- **Dark/Light Mode**: Toggle between themes
- **Collapsible Sidebar**: Navigation sidebar on mobile
- **Interactive Charts**: Hover tooltips, legends, zoomable

### 🧪 Testing
- **Unit Tests**: Vitest with Node.js test runner
- **E2E Tests**: Playwright for end-to-end testing

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: Zustand with localStorage persistence
- **Icons**: Lucide React
- **CSV Parsing**: Papaparse

## CSV Format Expected
```csv
Fecha,Year,IDCliente,IDProducto,Ventas,Costos,Unidades,IDVenta
2026-02-02,2026,C001,P001,1300,850,90,1
```

### Column Mappings
| Spanish | English |
|--------|---------|
| Fecha | date |
| Año | year |
| IDCliente | customerId |
| IDProducto | productId |
| Ventas | sales |
| Costos | costs |
| Unidades | units |
| IDVenta | saleId |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Project Structure
```
src/
├── app/              # Next.js pages
├── components/
│   ├── charts/      # Chart components
│   ├── dashboard/  # KPI grid, CSV uploader
│   └── ui/          # Reusable UI components
├── lib/
│   ├── csv/         # CSV parser
│   └── kpis/        # KPI calculator
├── stores/          # Zustand store
├── types/           # TypeScript types
└── tests/           # Test files
    ├── e2e/        # Playwright tests
```