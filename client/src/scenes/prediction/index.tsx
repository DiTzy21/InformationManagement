import DashboardBox from "@/components/DashboardBox";
import FlexBetween from "@/components/FlexBetween";
import { useGetKpisQuery } from "@/state/api";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import regression, { DataPoint } from "regression";

const Predictions = () => {
  const { palette } = useTheme();
  const [isLinearPredictions, setIsLinearPredictions] = useState(false);
  const [isPolynomialPredictions, setIsPolynomialPredictions] = useState(false);
  const { data: kpiData } = useGetKpisQuery();

  const formattedData = useMemo(() => {
    if (!kpiData) return [];
    const monthData = kpiData[0].monthlyData;

    const formatted: Array<DataPoint> = monthData.map(
      ({ revenue }, i: number) => {
        return [i, revenue];
      }
    );

    // Perform linear regression
    const linearRegression = regression.linear(formatted);

    // Perform polynomial regression
    const polynomialRegression = regression.polynomial(formatted, { order: 2 });

    // Calculate accuracy metrics
    const linearAccuracy = linearRegression.r2.toFixed(2);
    const polynomialAccuracy = polynomialRegression.r2.toFixed(2);

    return monthData.map(({ month, revenue }, i: number) => {
      return {
        name: month,
        "Actual Revenue": revenue,
        "Linear Regression Line": linearRegression.points[i][1],
        "Polynomial Regression Line": polynomialRegression.points[i][1],
        "Linear Predicted Revenue": linearRegression.predict(i + 12)[1],
        "Polynomial Predicted Revenue": polynomialRegression.predict(i + 12)[1],
        "Linear Accuracy": `R²: ${linearAccuracy}`,
        "Polynomial Accuracy": `R²: ${polynomialAccuracy}`,
      };
    });
  }, [kpiData]);

  return (
    <DashboardBox width="100%" height="100%" p="1rem" overflow="hidden">
      <FlexBetween m="1rem 2.5rem" gap="1rem">
        <Box>
          <Typography variant="h3">Revenue and Predictions</Typography>
          <Typography variant="h6">
            charted revenue and predicted revenue based on linear and polynomial regression models
          </Typography>
        </Box>
        <FlexBetween gap="0.5rem">
          <Button
            onClick={() => setIsLinearPredictions(!isLinearPredictions)}
            sx={{
              color: palette.grey[900],
              backgroundColor: palette.grey[700],
              boxShadow: "0.1rem 0.1rem 0.1rem 0.1rem rgba(0,0,0,.4)",
            }}
          >
            {isLinearPredictions ? "Hide Linear Predictions" : "Show Linear Predictions"}
          </Button>
          <Button
            onClick={() => setIsPolynomialPredictions(!isPolynomialPredictions)}
            sx={{
              color: palette.grey[900],
              backgroundColor: palette.grey[700],
              boxShadow: "0.1rem 0.1rem 0.1rem 0.1rem rgba(0,0,0,.4)",
              marginRight:"0.5rem"
            }}
          >
            {isPolynomialPredictions ? "Hide Polynomial Predictions" : "Show Polynomial Predictions"}
          </Button>
        </FlexBetween>
      </FlexBetween>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 20,
            right: 75,
            left: 20,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grey[800]} />
          <XAxis dataKey="name" tickLine={false} style={{ fontSize: "10px" }}>
            <Label value="Month" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis
            domain={[12000, 26000]}
            axisLine={{ strokeWidth: "0" }}
            style={{ fontSize: "10px" }}
            tickFormatter={(v) => `$${v}`}
          >
            <Label
              value="Revenue in USD"
              angle={-90}
              offset={-5}
              position="insideLeft"
            />
          </YAxis>
          <Tooltip />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="Actual Revenue"
            stroke={palette.primary.main}
            strokeWidth={0}
            dot={{ strokeWidth: 5 }}
          />
          {isLinearPredictions && (
            <>
              <Line
                type="monotone"
                dataKey="Linear Regression Line"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                strokeDasharray="5 5"
                dataKey="Linear Predicted Revenue"
                stroke={palette.secondary[500]}
              />
              <Line
                type="monotone"
                dataKey="Linear Accuracy"
                stroke="#FF0000"
                dot={true}
              />
            </>
          )}
          {isPolynomialPredictions && (
            <>
              <Line
                type="monotone"
                dataKey="Polynomial Regression Line"
                stroke="#82ca9d"
                dot={false}
              />
              <Line
                strokeDasharray="5 5"
                dataKey="Polynomial Predicted Revenue"
                stroke={palette.secondary[300]}
              />
              <Line
                type="monotone"
                dataKey="Polynomial Accuracy"
                stroke="#FF0000"
                dot={true}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </DashboardBox>
  );
};

export default Predictions;
