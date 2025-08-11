import SvgViewer from "@/components/SvgViewer";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">SVG Viewer — Upload or Paste SVG</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Preview, sanitize, and download your SVGs. Drag & drop a file or paste code.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="#viewer"><Button variant="hero" className="h-11 px-6">Get started</Button></a>
          </div>
        </div>
      </header>
      <main id="viewer" className="container mx-auto pb-16 px-4 md:px-6">
        <SvgViewer />
      </main>
    </div>
  );
};

export default Index;
