import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, ClipboardPaste, Download, Trash2, Copy } from "lucide-react";

function sanitizeSvg(raw: string): string {
  // Basic sanitation: remove scripts, event handlers, and javascript: URIs
  let svg = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s*(xlink:href|href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");

  // Ensure it actually is an SVG
  if (!/<svg[\s\S]*<\/svg>/i.test(svg)) return "";
  return svg.trim();
}

export default function SvgViewer() {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [rawSvg, setRawSvg] = useState<string>("");
  const [transparentBg, setTransparentBg] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeSvg = useMemo(() => sanitizeSvg(rawSvg), [rawSvg]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 20;
      const y = (e.clientY - rect.top - rect.height / 2) / 20;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const handleFiles = useCallback(async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.includes("svg")) {
      toast.error("Please upload an SVG file");
      return;
    }
    const text = await file.text();
    const cleaned = sanitizeSvg(text);
    if (!cleaned) {
      toast.error("Invalid SVG content");
      return;
    }
    setRawSvg(cleaned);
    toast.success("SVG loaded");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer?.files);
    },
    [handleFiles]
  );

  const onPasteRender = useCallback(() => {
    if (!rawSvg) {
      toast("Paste SVG code first");
      return;
    }
    const cleaned = sanitizeSvg(rawSvg);
    if (!cleaned) {
      toast.error("Invalid SVG content");
      return;
    }
    setRawSvg(cleaned);
    toast.success("SVG rendered");
  }, [rawSvg]);

  const copyCode = async () => {
    if (!safeSvg) return;
    await navigator.clipboard.writeText(safeSvg);
    toast.success("SVG code copied");
  };

  const downloadSvg = () => {
    if (!safeSvg) return;
    const blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setRawSvg("");
  };

  return (
    <section aria-labelledby="svg-viewer-heading" className="w-full">
      <Card ref={containerRef} className="signature-glow border border-border/60">
        <CardHeader>
          <CardTitle id="svg-viewer-heading" className="text-xl">SVG Viewer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="opacity-80" /> Upload</TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2"><ClipboardPaste className="opacity-80" /> Paste code</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Button variant="secondary" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                  Choose file
                </Button>
              </div>
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 rounded-md border border-dashed p-6 text-sm text-muted-foreground bg-secondary/40"
                aria-label="Drag and drop SVG file here"
              >
                Drag & drop an SVG file here
              </div>
            </TabsContent>
            <TabsContent value="paste" className="mt-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste SVG markup here (including <svg>...</svg>)"
                  className="min-h-[160px]"
                  value={rawSvg}
                  onChange={(e) => setRawSvg(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="transparent-bg" checked={transparentBg} onCheckedChange={setTransparentBg} />
                    <label htmlFor="transparent-bg" className="text-sm text-muted-foreground">Transparent preview background</label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={onPasteRender}>Render</Button>
                    <Button variant="outline" onClick={clearAll}><Trash2 className="mr-2" />Clear</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div
            className={`relative rounded-lg border overflow-auto min-h-[280px] ${transparentBg ? 'bg-checker' : 'bg-card bg-grid-soft'}`}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {safeSvg ? (
              <div className="p-4 svg-preview" dangerouslySetInnerHTML={{ __html: safeSvg }} />
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                Your SVG preview will appear here
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button variant="outline" onClick={copyCode} disabled={!safeSvg}><Copy />Copy</Button>
            <Button variant="outline" onClick={downloadSvg} disabled={!safeSvg}><Download />Download</Button>
            <Button variant="hero" onClick={() => toast("Tip: You can drag & drop an SVG directly into the preview!")}>Tips</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
