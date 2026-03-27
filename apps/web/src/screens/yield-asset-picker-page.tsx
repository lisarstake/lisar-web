import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { YieldAssetPickerPage } from "@/components/savings/YieldAssetPickerPage";

export default function YieldAssetPickerPageScreen() {
  usePageTracking("Yield Asset Picker Page", { page_type: "yield_asset_picker" });

  return <YieldAssetPickerPage />;
}
