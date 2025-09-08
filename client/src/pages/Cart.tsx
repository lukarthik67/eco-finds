import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CartItem, Product, User } from "@shared/schema";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function Cart() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { product: Product & { seller: User } })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      
      const shippingAddress = `${user?.address || '123 Eco Street'}, ${user?.city || 'San Francisco'}, ${user?.state || 'CA'} ${user?.zipCode || '94105'}`;
      
      return apiRequest("POST", "/api/orders", {
        items,
        shippingAddress,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-eco-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-eco-muted-foreground">Loading...</div>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  const handleUpdateQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateCartMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add some items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate();
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);
  
  const shipping = 12.00;
  const serviceFee = 3.99;
  const total = subtotal + shipping + serviceFee;

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-cart-title">
              Shopping Cart
            </h1>
            <p className="text-eco-muted-foreground">Review your items before checkout</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-eco-border">
                    <CardContent className="p-6">
                      <div className="flex gap-4 animate-pulse">
                        <div className="w-20 h-20 bg-eco-muted rounded-md"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-eco-muted rounded w-3/4"></div>
                          <div className="h-3 bg-eco-muted rounded w-1/2"></div>
                          <div className="h-6 bg-eco-muted rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="border-eco-border" data-testid={`card-cart-item-${item.id}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-eco-foreground mb-1" data-testid={`text-item-title-${item.id}`}>
                            {item.product.title}
                          </h3>
                          <p className="text-eco-muted-foreground text-sm mb-2">
                            Sold by {item.product.seller.firstName} {item.product.seller.lastName}
                          </p>
                          <p className="text-eco-primary font-bold text-lg" data-testid={`text-item-price-${item.id}`}>
                            ${item.product.price}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeFromCartMutation.isPending}
                            className="text-eco-muted-foreground hover:text-red-600"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={updateCartMutation.isPending || item.quantity <= 1}
                              className="w-8 h-8 p-0 border-eco-border"
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={updateCartMutation.isPending}
                              className="w-8 h-8 p-0 border-eco-border"
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-eco-border sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-eco-foreground mb-4" data-testid="text-order-summary">
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-eco-muted-foreground">Subtotal ({cartItems.length} items)</span>
                        <span className="text-eco-foreground" data-testid="text-subtotal">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-eco-muted-foreground">Shipping</span>
                        <span className="text-eco-foreground" data-testid="text-shipping">
                          ${shipping.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-eco-muted-foreground">Service Fee</span>
                        <span className="text-eco-foreground" data-testid="text-service-fee">
                          ${serviceFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-eco-border pt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-eco-foreground">Total</span>
                          <span className="text-eco-foreground text-lg" data-testid="text-total">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={checkoutMutation.isPending}
                      className="w-full bg-eco-primary hover:bg-eco-primary/90 text-white mt-6"
                      data-testid="button-checkout"
                    >
                      {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                    <p className="text-xs text-eco-muted-foreground mt-3 text-center">
                      By proceeding, you agree to our Terms of Service
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4">
                Your cart is empty
              </div>
              <Button
                onClick={() => window.location.href = "/"}
                className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
