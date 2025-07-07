import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const MetricsCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4">
      {metrics.map((metric, index) => (
        <Card className="rounded  py-3" key={index}>
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium  text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric?.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
