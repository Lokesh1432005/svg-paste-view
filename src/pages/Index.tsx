import SvgViewer from "@/components/SvgViewer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Palette, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid grid-rows-[auto,1fr] app-layout">
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-hsl(var(--brand))/5 via-transparent to-hsl(var(--brand-2))/5"></div>
        <div className="relative container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-hsl(var(--brand)) to-hsl(var(--brand-2)) rounded-lg blur-sm opacity-60"></div>
                <div className="relative bg-background p-2 rounded-lg border border-border/60 shadow-sm">
                  <Palette className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight brand-gradient flex items-center gap-2">
                  SVG Viewer
                  <Sparkles className="h-5 w-5 text-hsl(var(--brand)) animate-pulse" />
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Paste, edit, and export SVG graphics with ease
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main id="viewer" className="container mx-auto px-4 md:px-6 py-6 overflow-hidden min-h-0">
        <SvgViewer />
      </main>
    </div>
  );
};

export default Index;
