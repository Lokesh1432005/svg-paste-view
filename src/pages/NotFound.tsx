import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Palette } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background app-layout">
      <Card className="signature-glow border border-border/40 bg-card/50 backdrop-blur-sm shadow-lg max-w-lg mx-4">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-hsl(var(--brand)) to-hsl(var(--brand-2)) rounded-lg blur-sm opacity-60"></div>
            <div className="relative bg-background p-3 rounded-lg border border-border/60 shadow-sm w-fit mx-auto">
              <Palette className="h-8 w-8 text-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold brand-gradient">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <Button 
            asChild
            className="bg-gradient-to-r from-hsl(var(--brand)) to-hsl(var(--brand-2)) text-white hover:opacity-90 transition-opacity"
          >
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to SVG Viewer
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
