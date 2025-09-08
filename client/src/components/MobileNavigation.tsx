import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { CartItem, Product, User } from "@shared/schema";
import { Home, Plus, List, ShoppingCart, User as UserIcon } from "lucide-react";

export default function MobileNavigation() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product & { seller: User } })[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getButtonClass = (path: string) => {
    const baseClass = "flex flex-col items-center py-2 px-3 transition-colors";
    return `${baseClass} ${
      isActive(path)
        ? "text-eco-primary"
        : "text-eco-muted-foreground hover:text-eco-primary"
    }`;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-eco-card border-t border-eco-border z-40">
      <div className="flex justify-around py-2">
        <button
          onClick={() => setLocation("/")}
          className={getButtonClass("/")}
          data-testid="nav-mobile-browse"
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Browse</span>
        </button>
        
        <button
          onClick={() => setLocation("/sell")}
          className={getButtonClass("/sell")}
          data-testid="nav-mobile-sell"
        >
          <Plus className="h-5 w-5 mb-1" />
          <span className="text-xs">Sell</span>
        </button>
        
        <button
          onClick={() => setLocation("/my-listings")}
          className={getButtonClass("/my-listings")}
          data-testid="nav-mobile-listings"
        >
          <List className="h-5 w-5 mb-1" />
          <span className="text-xs">My Items</span>
        </button>
        
        <button
          onClick={() => setLocation("/cart")}
          className={`${getButtonClass("/cart")} relative`}
          data-testid="nav-mobile-cart"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 mb-1" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-eco-accent text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                {cartItemCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </button>
        
        <button
          onClick={() => setLocation("/dashboard")}
          className={getButtonClass("/dashboard")}
          data-testid="nav-mobile-profile"
        >
          <UserIcon className="h-5 w-5 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
}
