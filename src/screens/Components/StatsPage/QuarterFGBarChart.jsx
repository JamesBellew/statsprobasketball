// components/StatsPage/QuarterFGBarChart.jsx
import React from "react";
import { ResponsiveBar } from "@nivo/bar";


export default function QuarterFGBarChart({ gameActions = [], currentQuater = 4 }) {

const customTheme = {
    axis: {
      ticks: {
        text: { fill: "#FFFFFF" }
      },
      legend: {
        text: { fill: "#FFFFFF" }
      }
    },
    grid: {
      line: {
        stroke: "#262626",
        strokeWidth: 1
      }
    },
    labels: {
      text: {
        fill: "#ffffff",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    tooltip: {
      container: {
        background: "#222",
        color: "#fff",
        fontSize: "14px",
        borderRadius: "5px",
        padding: "8px"
      }
    }
  };
  
  // Build quarter stats
  const quarterStats = {};
  for (let i = 1; i <= 8; i++) {
    quarterStats[i] = { made: 0, attempted: 0 };
  }

  gameActions.forEach(action => {
    const q = action.quarter;
    if (!quarterStats[q]) return;

    if (["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)) {
      quarterStats[q].attempted++;
    }
    if (["2 Points", "3 Points"].includes(action.actionName)) {
      quarterStats[q].made++;
    }
  });

  // Build FG% data
  const fgPercentages = Object.keys(quarterStats)
    .filter(q => parseInt(q) <= 4 || parseInt(q) <= currentQuater)
    .map(q => {
      const { made, attempted } = quarterStats[q];
      const percentage = attempted > 0 ? Math.round((made / attempted) * 100) : 0;
      return {
        quarter: parseInt(q) > 4 ? `OT${parseInt(q) - 4}` : `Q${q}`,
        percentage
      };
    });

  return (
    <div className="h-[300px] top-[75px] relative w-full">
      <ResponsiveBar
        data={fgPercentages}
        keys={["percentage"]}
        indexBy="quarter"
        margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
        padding={0.3}
        colors="#0b63fb"
        theme={customTheme}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        axisTop={null}
        axisRight={null}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
        label={({ value }) => `${value}%`}
        animate={true}
        motionConfig="wobbly"
        legends={[
          {
            anchor: "top",
            direction: "row",
            translateY: -20,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#fff",
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}
