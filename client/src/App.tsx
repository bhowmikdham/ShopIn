import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ShoppingListPage from "./pages/ShoppingListPage";
import CheckoutPage from "./pages/CheckoutPage";
import { ShoppingBag } from "lucide-react";
import CartButton from "./components/CartButton";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={"/shopping-list"} component={ShoppingListPage} />
      <Route path={"/checkout"} component={CheckoutPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-accent" />
                  <h1 className="text-xl font-bold">Meal Store Finder</h1>
                </div>
                <nav className="hidden md:flex gap-6 flex-1 ml-8">
                  <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">
                    Home
                  </Link>
                  <Link href="/?tab=meals" className="text-sm font-medium hover:text-accent transition-colors">
                    Meals
                  </Link>
                  <Link href="/?tab=prices" className="text-sm font-medium hover:text-accent transition-colors">
                    Products
                  </Link>
                  <Link href="/?tab=stores" className="text-sm font-medium hover:text-accent transition-colors">
                    Stores
                  </Link>
                </nav>
                <CartButton />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <Router />
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/50">
              <div className="container mx-auto py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold mb-4">About</h3>
                    <p className="text-sm text-muted-foreground">
                      Meal Store Finder helps you discover the best prices for your favorite meals across nearby stores.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4">Features</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Price Comparison</li>
                      <li>Location-Based Search</li>
                      <li>Dietary Filtering</li>
                      <li>Meal Planning</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4">Supported Cuisines</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Indian</li>
                      <li>Italian</li>
                      <li>Mexican</li>
                      <li>Plant-Based Alternatives</li>
                    </ul>
                  </div>
                </div>
                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                  <p>&copy; 2026 Meal Store Finder. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
