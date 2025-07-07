import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Metric = {
  title: string;
  value: string | number;
  change?: string;
};

interface Props {
  metrics: Metric[];
}

const MetricsCards: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="rounded-lg py-3 hover:shadow transition-all"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value ?? "—"}</div>
            {metric.change && (
              <p className="text-xs text-muted-foreground mt-1">
                {metric.change}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
