import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItem, Product, User } from "@shared/schema";
import { Leaf, ShoppingCart, User as UserIcon, ChevronDown } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product & { seller: User } })[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavigation = (path: string) => {
    setLocation(path);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-eco-card/80 backdrop-blur-sm border-b border-eco-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              data-testid="link-logo"
            >
              <div className="w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-eco-foreground">EcoFinds</span>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => handleNavigation("/")}
              className="text-eco-muted-foreground hover:text-eco-primary transition-colors"
              data-testid="nav-browse"
            >
              Browse
            </button>
            <button
              onClick={() => handleNavigation("/sell")}
              className="text-eco-muted-foreground hover:text-eco-primary transition-colors"
              data-testid="nav-sell"
            >
              Sell
            </button>
            <button
              onClick={() => handleNavigation("/my-listings")}
              className="text-eco-muted-foreground hover:text-eco-primary transition-colors"
              data-testid="nav-my-listings"
            >
              My Listings
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => handleNavigation("/cart")}
                    className="p-2 text-eco-muted-foreground hover:text-eco-primary transition-colors relative"
                    data-testid="button-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-eco-accent text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
                        {cartItemCount}
                      </Badge>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-eco-muted transition-colors"
                    data-testid="button-user-menu"
                  >
                    <div className="w-8 h-8 bg-eco-muted rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt="Profile"
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <UserIcon className="h-4 w-4 text-eco-muted-foreground" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm text-eco-foreground" data-testid="text-user-name">
                      {user?.firstName || user?.username || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-eco-muted-foreground" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-eco-popover rounded-md shadow-lg border border-eco-border z-20">
                        <button
                          onClick={() => handleNavigation("/dashboard")}
                          className="block w-full text-left px-4 py-2 text-sm text-eco-popover-foreground hover:bg-eco-muted"
                          data-testid="menu-dashboard"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigation("/purchases")}
                          className="block w-full text-left px-4 py-2 text-sm text-eco-popover-foreground hover:bg-eco-muted"
                          data-testid="menu-purchases"
                        >
                          Purchase History
                        </button>
                        <div className="border-t border-eco-border"></div>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-eco-popover-foreground hover:bg-eco-muted"
                          data-testid="menu-signout"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                data-testid="button-signin"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
