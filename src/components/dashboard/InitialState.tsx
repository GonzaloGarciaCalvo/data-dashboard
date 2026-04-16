import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVUploader } from "@/components/dashboard/csv-uploader";

export function InitialState() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to Data Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Start by loading your CSV files to visualize your data and KPIs.
        </p>
      </div>
      <CSVUploader />

      {/* Expected format info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Expected Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              •{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                Customers:
              </strong>{" "}
              customerId, name, region, segment
            </li>
            <li>
              •{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                Products:
              </strong>{" "}
              productId, category, brand
            </li>
            <li>
              •{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                Times:
              </strong>{" "}
              (optional) timeId, date, month, quarter, year
            </li>
            <li>
              •{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                Sales:
              </strong>{" "}
              date, customerId, productId, sales, costs, units
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
