import React from "react";
import { ResponsiveLine } from "@nivo/line";

const LineChartScoringQuarter = ({ gameLineChartData, customTheme, homeTeamName }) => {
  return (
    <div className="rounded-xl p-2" style={{ height: "200px", width: "100%", marginTop: "40px" }}>
      <h4 className="text-center text-white mb-2">Scoring Quarter Split</h4>

      <div className="bg-primary-bg h-full w-full py-2 rounded-md">
        <ResponsiveLine
          animate={true}
          motionConfig={{ mass: 1, tension: 250, friction: 20 }}
          data={gameLineChartData}
          margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: false,
            nice: true
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Quarter",
            legendOffset: 36,
            legendPosition: "middle"
          }}
          pointLabel={(point) => `${point.data.y}`}
          pointLabelYOffset={-12}
          pointLabelTextColor={{ from: "color", modifiers: [["brighter", 1.5]] }}
          theme={customTheme}
          axisLeft={{
            tickValues: Array.from({ length: 21 }, (_, i) => i * 5),
            legend: "Score",
            legendOffset: -40,
            legendPosition: "middle"
          }}
          pointLabelColor="#FFFFFFF"
          colors={({ id }) => (id === homeTeamName ? "#0b63fb" : "#10B981")}
          pointColor={({ id }) => (id === "Opponent" ? "#10B981" : "#0b63fb")}
          pointSize={10}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enablePointLabel={true}
          useMesh={true}
        />
      </div>
    </div>
  );
};

export default LineChartScoringQuarter;
