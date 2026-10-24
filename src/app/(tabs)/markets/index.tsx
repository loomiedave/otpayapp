import DXYNews from "@/components/DXYNews";
import DXYChart from "@/components/DXYChart";
import ScreenContainer from "@/components/ui/ScreenContainer";

export default function DXYScreen() {
  return (
    <ScreenContainer scroll paddingHorizontal={false} extraBottomPadding={32} edges={['top']}>
      <DXYChart />
      <DXYNews />
    </ScreenContainer>
  );
}
