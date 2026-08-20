import { AmbientField } from "@/components/background/AmbientField";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { VehicleSheetProvider } from "@/components/vehicle/SheetProvider";

/** Chrome du site public — volontairement absent du back-office */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientField />
      <VehicleSheetProvider>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBar />
      </VehicleSheetProvider>
    </>
  );
}
