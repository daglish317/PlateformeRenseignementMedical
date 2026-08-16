"use client";

import { AdminSection } from "../../shared/components/AdminSection";
import type { DashboardCharts } from "../types/dashboard";

interface BarChartProps {
  title: string;
  data: { month: string; count: number }[];
  color?: string;
}

function SimpleBarChart({ title, data, color = "bg-primary" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex h-32 items-end gap-2">
        {data.map((point) => (
          <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${(point.count / max) * 100}%`, minHeight: point.count > 0 ? "4px" : "0" }}
              title={`${point.count}`}
            />
            <span className="text-[10px] text-muted-foreground">
              {point.month.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardChartsProps {
  charts: DashboardCharts;
}

export function DashboardCharts({ charts }: DashboardChartsProps) {
  const total = charts.repartition_types.hopital + charts.repartition_types.pharmacie;

  return (
    <AdminSection>
      <h2 className="mb-4 font-semibold">Graphiques</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleBarChart
          title="Inscriptions par mois"
          data={charts.inscriptions_par_mois}
          color="bg-blue-500"
        />
        <SimpleBarChart
          title="Validations"
          data={charts.validations}
          color="bg-emerald-500"
        />
        <SimpleBarChart
          title="Recherches effectuées"
          data={charts.recherches}
          color="bg-purple-500"
        />
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Répartition Hôpital / Pharmacie</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600" />
              <span className="text-sm flex-1">Hôpitaux</span>
              <span className="text-sm font-medium">
                {charts.repartition_types.hopital}
                {total > 0 && ` (${Math.round((charts.repartition_types.hopital / total) * 100)}%)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span className="text-sm flex-1">Pharmacies</span>
              <span className="text-sm font-medium">
                {charts.repartition_types.pharmacie}
                {total > 0 && ` (${Math.round((charts.repartition_types.pharmacie / total) * 100)}%)`}
              </span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full">
              <div
                className="bg-blue-600"
                style={{ width: total > 0 ? `${(charts.repartition_types.hopital / total) * 100}%` : "50%" }}
              />
              <div
                className="bg-emerald-600"
                style={{ width: total > 0 ? `${(charts.repartition_types.pharmacie / total) * 100}%` : "50%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminSection>
  );
}
