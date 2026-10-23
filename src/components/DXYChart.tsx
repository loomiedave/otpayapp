import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Svg, {
  Path,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_URL = "https://oicrtvfceigbwpvufhih.supabase.co/functions/v1/dxy";

type DXYData = {
  mid: number;
  dayDiff?: number;
  dayDiffPercent?: number;
};

export default function DXYChart() {
  const [data, setData] = useState<DXYData | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDXY = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      // console.log("DXY:", json);

      setData(json);
    } catch (error) {
      console.error("DXY error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}?history=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const closes = (json.bars ?? [])
        .slice()
        .reverse()
        .map((b: { close: number }) => b.close);
      if (closes.length > 1) setHistory(closes);
    } catch (error) {
      console.error("DXY history error:", error);
    }
  };

  useEffect(() => {
    const refresh = () => {
      fetchDXY();
      fetchHistory();
    };
    refresh();
    const timer = setInterval(refresh, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <View className="h-[250px] items-center justify-center">
        <ActivityIndicator size="small" color="#2563eb" />
        <Text className="mt-2 text-sm text-text-muted dark:text-text-muted-dark">
          Loading DXY...
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="p-5">
        <Text className="text-red-500">Unable to load DXY</Text>
      </View>
    );
  }

  const change = data.dayDiffPercent ?? 0;
  const isPositive = change >= 0;

  return (
    <View className="w-full px-4 pt-4">
      {/* Header */}

      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-text-main dark:text-text-main-dark">
            US Dollar Index
          </Text>

          <Text className="mt-1 text-xs text-text-muted dark:text-text-muted-dark">
            US Dollar Index
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[26px] font-bold text-text-main dark:text-text-main-dark">
            {data.mid.toFixed(2)}
          </Text>

          <Text
            className={`mt-0.5 text-sm font-semibold ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Chart */}

      <DXYLineChart values={history} />

      {/* Updated */}

      <Text className="mt-1.5 text-[11px] text-text-muted dark:text-text-muted-dark">
        Updates every minute
      </Text>
    </View>
  );
}

function DXYLineChart({ values }: { values: number[] }) {
  const chartWidth = SCREEN_WIDTH - 32;
  const chartHeight = 220;

  if (values.length < 2) {
    return (
      <View
        className="items-center justify-center"
        style={{ width: chartWidth, height: chartHeight }}
      >
        <Text className="text-text-muted dark:text-text-muted-dark">
          Collecting chart data...
        </Text>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Prevent division by zero
  const range = max - min || 0.01;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (chartWidth - 16) + 8;

    const y =
      chartHeight - ((value - min) / range) * (chartHeight - 20) - 10;

    return { x, y };
  });

  const linePath = points
    .map((point, index) =>
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${chartWidth - 8} ${chartHeight}
    L 8 ${chartHeight}
    Z
  `;

  const lastPoint = points[points.length - 1];

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="dxyGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2563eb" stopOpacity="0.30" />
            <Stop offset="1" stopColor="#2563eb" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}

        {[0.25, 0.5, 0.75].map((position) => (
          <Line
            key={position}
            x1="0"
            y1={chartHeight * position}
            x2={chartWidth}
            y2={chartHeight * position}
            stroke="#888"
            strokeWidth="1"
            opacity="0.25"
          />
        ))}

        {/* Area */}

        <Path d={areaPath} fill="url(#dxyGradient)" />

        {/* Main line */}

        <Path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* Current price dot */}

        <Polygon
          points={`
            ${lastPoint.x - 4},${lastPoint.y}
            ${lastPoint.x},${lastPoint.y - 4}
            ${lastPoint.x + 4},${lastPoint.y}
            ${lastPoint.x},${lastPoint.y + 4}
          `}
          fill="#2563eb"
        />
      </Svg>

      {/* Price range */}

      <View className="flex-row justify-between px-1">
        <Text className="text-[10px] text-text-muted dark:text-text-muted-dark">
          {min.toFixed(2)}
        </Text>

        <Text className="text-[10px] text-text-muted dark:text-text-muted-dark">
          {max.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
