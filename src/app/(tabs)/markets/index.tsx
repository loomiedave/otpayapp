import ScreenContainer from "@/components/ui/ScreenContainer";
import DXYChart from "@/components/DXYChart";
import DXYNews from "@/components/DXYNews";

export default function DXYScreen() {
  return (
    <ScreenContainer scroll paddingHorizontal={false} extraBottomPadding={32} edges={['top']}>
      <DXYChart />

      <DXYNews />
    </ScreenContainer>
  );
}
