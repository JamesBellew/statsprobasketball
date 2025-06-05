// ScoringSplitPie.jsx
import React from "react";
import { ResponsivePie } from "@nivo/pie";

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

const transformGameActionsToPieData = (gameActions) => {
  let twoPoints = 0;
  let threePoints = 0;
  let freeThrows = 0;

  gameActions.forEach((action) => {
    if (action.actionName === "2 Points") {
      twoPoints += 2;
    } else if (action.actionName === "3 Points") {
      threePoints += 3;
    } else if (action.actionName === "FT Score") {
      freeThrows += 1;
    }
  });

  return [
    { id: "2PT", label: "2PT", value: twoPoints, color: "#10B981" },
    { id: "3PT", label: "3PT", value: threePoints, color: "#0b63fb" },
    { id: "FT", label: "FT", value: freeThrows, color: "#8B5CF6" }
  ];
};

const ScoringSplitPie = ({ gameActions }) => {
  const pieData = transformGameActionsToPieData(gameActions);

  return (
    <div className="h-[410px] w-full  rounded-md p-4">
      <h2 className="text-white text-lg font-semibold mb-4 text-center">
        Scoring Breakdown
      </h2>
      <ResponsivePie
        data={pieData}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={({ data }) => data.color}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLabels={true}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#FFFFFF"
        theme={customTheme}
      />
    </div>
  );
};

export default ScoringSplitPie;
