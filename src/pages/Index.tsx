import SvgViewer from "@/components/SvgViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid grid-rows-[auto,1fr]">
      <header className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">SVG Viewer</h1>
        </div>
      </header>
      <main id="viewer" className="container mx-auto px-4 md:px-6 pb-2 overflow-hidden min-h-0">
        <SvgViewer />
      </main>
    </div>
  );
};

export default Index;
