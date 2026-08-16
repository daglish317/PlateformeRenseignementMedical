"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatisticsData } from "../types/statistics";

interface HorizontalBarChartProps {
  title: string;
  data: { month: string; count: number }[];
  color?: string;
}

function HorizontalBarChart({ title, data, color = "bg-primary" }: HorizontalBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex h-32 items-end gap-2">
        {data.map((point) => (
          <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{
                height: `${(point.count / max) * 100}%`,
                minHeight: point.count > 0 ? "4px" : "0",
              }}
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

interface StatisticsChartsProps {
  charts: StatisticsData["charts"];
}

export function StatisticsCharts({ charts }: StatisticsChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Graphiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <HorizontalBarChart
            title="Recherches par mois"
            data={charts.recherches_par_jour}
            color="bg-blue-500"
          />
          <HorizontalBarChart
            title="Inscriptions"
            data={charts.inscriptions}
            color="bg-cyan-500"
          />
          <HorizontalBarChart
            title="Validations"
            data={charts.validations}
            color="bg-emerald-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
