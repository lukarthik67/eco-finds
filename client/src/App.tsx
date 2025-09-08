import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Sell from "@/pages/Sell";
import MyListings from "@/pages/MyListings";
import Cart from "@/pages/Cart";
import Dashboard from "@/pages/Dashboard";
import Purchases from "@/pages/Purchases";
import ProductDetail from "@/pages/ProductDetail";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/sell" component={Sell} />
          <Route path="/my-listings" component={MyListings} />
          <Route path="/cart" component={Cart} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/purchases" component={Purchases} />
          <Route path="/product/:id" component={ProductDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
