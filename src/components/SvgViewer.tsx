import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { toast } from "sonner";
import { Upload, ClipboardPaste, Download, Trash2, Copy, Hand, RefreshCw } from "lucide-react";

// --- Helpers: sanitize SVG and transform utilities
function sanitizeSvg(raw: string): string {
  let svg = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s*(xlink:href|href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");

  if (!/<svg[\s\S]*<\/svg>/i.test(svg)) return "";
  return svg.trim();
}

type Transforms = { tx: number; ty: number; sx: number; sy: number };

function parseTransformAttribute(attr: string | null): Transforms | null {
  if (!attr) return null;
  let tx = 0;
  let ty = 0;
  let sx = 1;
  let sy = 1;
  const translateMatch = attr.match(/translate\(\s*([\-\d.+eE]+)(?:[\s,]+([\-\d.+eE]+))?\s*\)/);
  if (translateMatch) {
    tx = parseFloat(translateMatch[1]);
    ty = translateMatch[2] !== undefined ? parseFloat(translateMatch[2]) : 0;
  }
  const scaleMatch = attr.match(/scale\(\s*([\-\d.+eE]+)(?:[\s,]+([\-\d.+eE]+))?\s*\)/);
  if (scaleMatch) {
    sx = parseFloat(scaleMatch[1]);
    sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx;
  }
  return { tx, ty, sx, sy };
}

function getTransforms(el: Element): Transforms {
  const ds = (el as HTMLElement).dataset;
  if (ds.lvTx !== undefined || ds.lvTy !== undefined || ds.lvSx !== undefined || ds.lvSy !== undefined) {
    const tx = parseFloat(ds.lvTx || "0");
    const ty = parseFloat(ds.lvTy || "0");
    const sx = parseFloat(ds.lvSx || "1");
    const sy = parseFloat(ds.lvSy || "1");
    return { tx, ty, sx, sy };
  }
  const parsed = parseTransformAttribute((el as SVGGraphicsElement).getAttribute("transform"));
  if (parsed) return parsed;
  return { tx: 0, ty: 0, sx: 1, sy: 1 };
}

function setTransforms(el: Element, t: Transforms) {
  (el as HTMLElement).dataset.lvTx = String(t.tx);
  (el as HTMLElement).dataset.lvTy = String(t.ty);
  (el as HTMLElement).dataset.lvSx = String(t.sx);
  (el as HTMLElement).dataset.lvSy = String(t.sy);
  (el as SVGGraphicsElement).setAttribute(
    "transform",
    `translate(${t.tx}, ${t.ty}) scale(${t.sx}, ${t.sy})`
  );
}

export default function SvgViewer() {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [rawSvg, setRawSvg] = useState<string>("");
  const [transparentBg, setTransparentBg] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [autoRewrite, setAutoRewrite] = useState(true);
  const [zoom, setZoom] = useState(1);

  const containerRef = useRef<HTMLDivElement | null>(null); // glow
  const svgHostRef = useRef<HTMLDivElement | null>(null); // preview host

  const [selectedEl, setSelectedEl] = useState<SVGGraphicsElement | null>(null);
  const [overlay, setOverlay] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [textValue, setTextValue] = useState<string>("");
  const [fillValue, setFillValue] = useState<string>("");
  const [strokeValue, setStrokeValue] = useState<string>("");
  const [fontSizeValue, setFontSizeValue] = useState<string>("");
  const [fontFamilyValue, setFontFamilyValue] = useState<string>("");
  const isSelectedTextLike = useMemo(() => {
    if (!selectedEl) return false;
    const tag = selectedEl.tagName.toLowerCase();
    return tag === "text" || tag === "tspan";
  }, [selectedEl]);

  const safeSvg = useMemo(() => sanitizeSvg(rawSvg), [rawSvg]);

  const rewriteSvgFromDom = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector("svg");
    if (!svg) return;
    const cloned = svg.cloneNode(true) as SVGSVGElement;
    // Remove internal data attributes
    const removeDataAttrs = (el: Element) => {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("data-lv-")) {
          el.removeAttribute(attr.name);
        }
      }
      for (const child of Array.from(el.children)) removeDataAttrs(child);
    };
    removeDataAttrs(cloned);
    if (!cloned.getAttribute("xmlns")) {
      cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    const serialized = cloned.outerHTML;
    const cleaned = sanitizeSvg(serialized);
    if (cleaned) {
      setRawSvg(cleaned);
    }
  }, []);

  // Signature glow motion
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

  // File handlers
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
    setSelectedEl(null);
    setOverlay(null);
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
    setSelectedEl(null);
    setOverlay(null);
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
    setSelectedEl(null);
    setOverlay(null);
  };

  // Selection logic in edit mode
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host || !editMode) return;

    const onClick = (e: MouseEvent) => {
      // Ignore overlay clicks
      const target = e.target as Element;
      if (!host.contains(target)) return;
      const svgEl = host.querySelector("svg");
      if (!svgEl) return;
      // Ensure we clicked inside the SVG, but not the <svg> root itself
      const svgRoot = svgEl as SVGSVGElement;
      let el: Element | null = target;
      while (el && el !== svgRoot && el.tagName.toLowerCase() !== "svg") {
        // Ignore groups that are just containers; still allow selecting <g>
        if (
          el instanceof SVGGraphicsElement &&
          typeof (el as SVGGraphicsElement).getBBox === "function"
        ) {
          setSelectedEl(el as SVGGraphicsElement);
          break;
        }
        el = el.parentElement;
      }
    };

    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [editMode, safeSvg]);

  // Compute overlay whenever selection changes or window resizes/scrolls
  const recomputeOverlay = useCallback(() => {
    if (!selectedEl || !svgHostRef.current) {
      setOverlay(null);
      return;
    }
    const box = selectedEl.getBoundingClientRect();
    const hostBox = svgHostRef.current.getBoundingClientRect();
    setOverlay({
      left: box.left - hostBox.left + svgHostRef.current.scrollLeft,
      top: box.top - hostBox.top + svgHostRef.current.scrollTop,
      width: box.width,
      height: box.height,
    });
  }, [selectedEl]);

  useEffect(() => {
    if (!selectedEl) return;
    recomputeOverlay();
    const onResize = () => recomputeOverlay();
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onResize, true);
    };
  }, [selectedEl, recomputeOverlay]);

  // Populate inspector when an element is selected
  useEffect(() => {
    if (!selectedEl) {
      setTextValue("");
      setFillValue("");
      setStrokeValue("");
      setFontSizeValue("");
      setFontFamilyValue("");
      return;
    }
    try {
      const element = selectedEl as unknown as Element;
      const cs = window.getComputedStyle(element);
      const fillAttr = element.getAttribute("fill") || cs.fill || "";
      const strokeAttr = element.getAttribute("stroke") || cs.stroke || "";
      setFillValue(fillAttr === "none" ? "" : fillAttr);
      setStrokeValue(strokeAttr === "none" ? "" : strokeAttr);

      const tag = selectedEl.tagName.toLowerCase();
      const isTextLikeLocal = tag === "text" || tag === "tspan";
      if (isTextLikeLocal) {
        const fsAttr = element.getAttribute("font-size") || cs.fontSize || "";
        const ffAttr = element.getAttribute("font-family") || cs.fontFamily || "";
        setTextValue(selectedEl.textContent || "");
        setFontSizeValue(fsAttr.replace(/[^\d.]+$/, ""));
        setFontFamilyValue(ffAttr);
      } else {
        setTextValue("");
        setFontSizeValue("");
        setFontFamilyValue("");
      }
    } catch {}
  }, [selectedEl]);

  const applyDomChange = useCallback((fn: () => void, shouldRewrite = false) => {
    fn();
    recomputeOverlay();
    if (shouldRewrite && autoRewrite) {
      // Avoid rewriting on every keystroke; small timeout batches rapid changes
      window.setTimeout(() => {
        try { rewriteSvgFromDom(); } catch {}
      }, 150);
    }
  }, [recomputeOverlay, autoRewrite, rewriteSvgFromDom]);

  const onTextChange = (value: string) => {
    setTextValue(value);
    if (!selectedEl) return;
    const tag = selectedEl.tagName.toLowerCase();
    if (tag === "text" || tag === "tspan") {
      applyDomChange(() => { selectedEl.textContent = value; }, true);
    }
  };

  const onFillChange = (value: string) => {
    setFillValue(value);
    if (!selectedEl) return;
    applyDomChange(() => {
      if (value.trim()) (selectedEl as Element).setAttribute("fill", value.trim());
      else (selectedEl as Element).removeAttribute("fill");
    }, true);
  };

  const onStrokeChange = (value: string) => {
    setStrokeValue(value);
    if (!selectedEl) return;
    applyDomChange(() => {
      if (value.trim()) (selectedEl as Element).setAttribute("stroke", value.trim());
      else (selectedEl as Element).removeAttribute("stroke");
    }, true);
  };

  const onFontSizeChange = (value: string) => {
    // accept numeric or with unit, normalize to px when numeric
    setFontSizeValue(value);
    if (!selectedEl) return;
    const normalized = value.trim() ? (/\d$/.test(value.trim()) ? `${value.trim()}px` : value.trim()) : "";
    applyDomChange(() => {
      if (normalized) (selectedEl as Element).setAttribute("font-size", normalized);
      else (selectedEl as Element).removeAttribute("font-size");
    }, true);
  };

  const onFontFamilyChange = (value: string) => {
    setFontFamilyValue(value);
    if (!selectedEl) return;
    applyDomChange(() => {
      if (value.trim()) (selectedEl as Element).setAttribute("font-family", value.trim());
      else (selectedEl as Element).removeAttribute("font-family");
    }, true);
  };

  // Drag to move and handle resizing
  useEffect(() => {
    if (!editMode) return;
    let mode: "none" | "move" | "resize" = "none";
    let dir: string | null = null; // e, w, n, s, ne, nw, se, sw
    let startX = 0;
    let startY = 0;
    let startT: Transforms = { tx: 0, ty: 0, sx: 1, sy: 1 };
    let startBox: { width: number; height: number } = { width: 1, height: 1 };

    const onPointerDown = (e: PointerEvent) => {
      if (!selectedEl || !svgHostRef.current) return;
      const target = e.target as HTMLElement;
      if (target.dataset.handle) {
        mode = "resize";
        dir = target.dataset.handle;
      } else if (target.dataset.overlay) {
        mode = "move";
      } else {
        return;
      }
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startT = getTransforms(selectedEl);
      const b = selectedEl.getBoundingClientRect();
      startBox = { width: b.width, height: b.height };
      (document.activeElement as HTMLElement | null)?.blur?.();
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp, { once: true });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!selectedEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (mode === "move") {
        const next = { ...startT, tx: startT.tx + dx, ty: startT.ty + dy };
        setTransforms(selectedEl, next);
        recomputeOverlay();
      } else if (mode === "resize" && dir) {
        // Scale proportional to pixel delta relative to initial box
        let scaleX = startT.sx;
        let scaleY = startT.sy;
        if (dir.includes("e")) scaleX = startT.sx * Math.max((startBox.width + dx) / startBox.width, 0.05);
        if (dir.includes("w")) scaleX = startT.sx * Math.max((startBox.width - dx) / startBox.width, 0.05);
        if (dir.includes("s")) scaleY = startT.sy * Math.max((startBox.height + dy) / startBox.height, 0.05);
        if (dir.includes("n")) scaleY = startT.sy * Math.max((startBox.height - dy) / startBox.height, 0.05);
        const next = { ...startT, sx: scaleX, sy: scaleY };
        setTransforms(selectedEl, next);
        recomputeOverlay();
      }
    };

    const onPointerUp = () => {
      mode = "none";
      dir = null;
      window.removeEventListener("pointermove", onPointerMove);
      if (autoRewrite) {
        rewriteSvgFromDom();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [editMode, selectedEl, recomputeOverlay, autoRewrite, rewriteSvgFromDom]);

  const clearSelection = () => {
    setSelectedEl(null);
    setOverlay(null);
  };

  return (
    <section aria-labelledby="svg-viewer-heading" className="w-full">
      <Card ref={containerRef} className="signature-glow border border-border/60">
        <CardHeader>
          <CardTitle id="svg-viewer-heading" className="text-xl">SVG Viewer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="opacity-80" /> Upload</TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2"><ClipboardPaste className="opacity-80" /> Paste code</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="transparent-bg" checked={transparentBg} onCheckedChange={setTransparentBg} />
                <label htmlFor="transparent-bg" className="text-sm text-muted-foreground">Transparent preview</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="edit-mode" checked={editMode} onCheckedChange={(v) => { setEditMode(v); if (!v) clearSelection(); }} />
                <label htmlFor="edit-mode" className="text-sm text-muted-foreground">Edit mode (move/resize)</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="auto-rewrite" checked={autoRewrite} onCheckedChange={setAutoRewrite} />
                <label htmlFor="auto-rewrite" className="text-sm text-muted-foreground">Auto update code</label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={rewriteSvgFromDom}><RefreshCw className="mr-2" />Rewrite code</Button>
              <Button variant="outline" onClick={clearAll}><Trash2 className="mr-2" />Clear</Button>
            </div>
          </div>

          {selectedEl && (
            <div className="rounded-md border p-3 bg-muted/10">
              <div className="text-sm font-medium mb-3 flex items-center justify-between">
                <span>Inspector</span>
                <span className="text-muted-foreground">Selected: &lt;{selectedEl.tagName.toLowerCase()}&gt;</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isSelectedTextLike && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="inspector-text">Text</Label>
                      <Input id="inspector-text" value={textValue} onChange={(e) => onTextChange(e.target.value)} placeholder="Edit text" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inspector-font-size">Font size (px)</Label>
                      <Input id="inspector-font-size" inputMode="numeric" pattern="[0-9]*" value={fontSizeValue} onChange={(e) => onFontSizeChange(e.target.value)} placeholder="e.g. 16" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label htmlFor="inspector-font-family">Font family</Label>
                      <Input
                        id="inspector-font-family"
                        value={fontFamilyValue}
                        onChange={(e) => onFontFamilyChange(e.target.value)}
                        list="font-family-presets"
                        placeholder="e.g. Inter, Arial, sans-serif"
                      />
                      <datalist id="font-family-presets">
                        <option value="" />
                        <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" />
                        <option value="Arial, Helvetica, sans-serif" />
                        <option value="Helvetica, Arial, sans-serif" />
                        <option value="Times New Roman, Times, serif" />
                        <option value="Georgia, serif" />
                        <option value="Courier New, Courier, monospace" />
                        <option value="Menlo, Monaco, monospace" />
                        <option value="monospace" />
                        <option value="serif" />
                        <option value="sans-serif" />
                      </datalist>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label htmlFor="inspector-fill">Fill color</Label>
                  <Input id="inspector-fill" value={fillValue} onChange={(e) => onFillChange(e.target.value)} placeholder="e.g. #111827 or red" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="inspector-stroke">Stroke color</Label>
                  <Input id="inspector-stroke" value={strokeValue} onChange={(e) => onStrokeChange(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>
          )}

          <ResizablePanelGroup direction="horizontal" className="w-full h[70vh] sm:h-[70vh] rounded-md border bg-background">
            <ResizablePanel defaultSize={45} minSize={20} className="min-w-0">
              {activeTab === "upload" ? (
                <div className="h-full p-3 space-y-3">
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
                    className="rounded-md border border-dashed p-6 text-sm text-muted-foreground bg-secondary/40"
                    aria-label="Drag and drop SVG file here"
                  >
                    Drag & drop an SVG file here
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 min-h-0">
                    <Textarea
                      placeholder="Paste SVG markup here (including <svg>...</svg>)"
                      className="h-full resize-none"
                      value={rawSvg}
                      onChange={(e) => setRawSvg(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 py-2">
                    <Button variant="secondary" size="sm" onClick={onPasteRender}><Hand className="mr-2" />Render</Button>
                  </div>
                </div>
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} className="min-w-0">
              <div
                ref={svgHostRef}
                className={`relative h-full overflow-auto ${transparentBg ? 'bg-checker' : 'bg-card bg-grid-soft'}`}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="absolute left-3 bottom-3 z-20 flex items-center gap-2 rounded-md border bg-background/80 backdrop-blur px-2 py-1">
                  <Button size="sm" variant="outline" onClick={() => setZoom((z)=> Math.max(0.25, Number((z - 0.1).toFixed(2))))}>-</Button>
                  <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom((z)=> Math.min(4, Number((z + 0.1).toFixed(2))))}>+</Button>
                </div>

                {safeSvg ? (
                  <div className="p-4">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                      <div className="svg-preview" dangerouslySetInnerHTML={{ __html: safeSvg }} />
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center text-muted-foreground">
                    Your SVG preview will appear here
                  </div>
                )}

                {editMode && selectedEl && overlay && (
                  <div
                    data-overlay
                    className="absolute border-2 border-primary/70 rounded-sm pointer-events-auto"
                    style={{ left: overlay.left, top: overlay.top, width: overlay.width, height: overlay.height }}
                    title="Drag to move"
                  >
                    {(["nw","n","ne","e","se","s","sw","w"] as const).map((h) => {
                      const base = "absolute w-3 h-3 bg-primary rounded-sm shadow";
                      const pos: Record<string, string> = {
                        nw: "-left-1 -top-1 cursor-nw-resize",
                        n: "left-1/2 -translate-x-1/2 -top-1 cursor-n-resize",
                        ne: "-right-1 -top-1 cursor-ne-resize",
                        e: "-right-1 top-1/2 -translate-y-1/2 cursor-e-resize",
                        se: "-right-1 -bottom-1 cursor-se-resize",
                        s: "left-1/2 -translate-x-1/2 -bottom-1 cursor-s-resize",
                        sw: "-left-1 -bottom-1 cursor-sw-resize",
                        w: "-left-1 top-1/2 -translate-y-1/2 cursor-w-resize",
                      };
                      return (
                        <div key={h} data-handle={h} className={`${base} ${pos[h]}`} />
                      );
                    })}
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button variant="outline" onClick={copyCode} disabled={!safeSvg}><Copy />Copy</Button>
            <Button variant="outline" onClick={downloadSvg} disabled={!safeSvg}><Download />Download</Button>
            <Button variant="hero" onClick={() => toast("Tip: In Edit mode, click an element to select, drag the box to move, use handles to resize.")}>Tips</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
