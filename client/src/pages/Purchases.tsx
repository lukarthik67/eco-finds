import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderItem, Product } from "@shared/schema";
import { Truck } from "lucide-react";

export default function Purchases() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "progress" | "completed">("all");

  const { data: orders = [], isLoading } = useQuery<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-eco-secondary/20 text-eco-secondary">Delivered</Badge>;
      case "pending":
        return <Badge className="bg-eco-accent/20 text-eco-accent">In Progress</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-200 text-red-600">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "progress") return order.status === "pending";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  const tabCounts = {
    all: orders.length,
    progress: orders.filter(o => o.status === "pending").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const formatOrderId = (id: string) => {
    return `ECO-${new Date().getFullYear()}-${id.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-purchase-history-title">
              Purchase History
            </h1>
            <p className="text-eco-muted-foreground">Track your sustainable shopping journey</p>
          </div>
          
          <div className="mb-6">
            <div className="flex space-x-4 border-b border-eco-border">
              {[
                { key: "all", label: "All Orders", count: tabCounts.all },
                { key: "progress", label: "In Progress", count: tabCounts.progress },
                { key: "completed", label: "Completed", count: tabCounts.completed },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-eco-primary text-eco-primary"
                      : "border-transparent text-eco-muted-foreground hover:text-eco-foreground"
                  }`}
                  data-testid={`tab-orders-${tab.key}`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-eco-border">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                          <div className="h-6 bg-eco-muted rounded w-48"></div>
                          <div className="h-4 bg-eco-muted rounded w-32"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-eco-muted rounded w-20 mb-1"></div>
                          <div className="h-6 bg-eco-muted rounded w-16"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-eco-muted rounded-md"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-eco-muted rounded w-24"></div>
                              <div className="h-3 bg-eco-muted rounded w-16"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border-eco-border" data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-eco-foreground mb-1" data-testid={`text-order-id-${order.id}`}>
                          Order #{formatOrderId(order.id)}
                        </h3>
                        <p className="text-eco-muted-foreground text-sm">
                          Placed on {new Date(order.createdAt!).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} • {order.orderItems?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-lg font-bold text-eco-foreground mt-1" data-testid={`text-order-total-${order.id}`}>
                          ${order.total}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {order.orderItems?.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img
                            src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"}
                            alt={item.product.title}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                            }}
                          />
                          <div>
                            <p className="font-medium text-eco-foreground text-sm" data-testid={`text-item-title-${item.id}`}>
                              {item.product.title}
                            </p>
                            <p className="text-eco-muted-foreground text-xs" data-testid={`text-item-price-${item.id}`}>
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(order.orderItems?.length || 0) > 3 && (
                        <div className="flex items-center justify-center">
                          <p className="text-eco-muted-foreground text-sm">
                            +{(order.orderItems?.length || 0) - 3} more items
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-eco-border">
                      <p className="text-sm text-eco-muted-foreground flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        {order.status === "completed" 
                          ? `Delivered to ${order.shippingAddress || 'your address'}`
                          : `Shipping to ${order.shippingAddress || 'your address'}`
                        }
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                          data-testid={`button-view-details-${order.id}`}
                        >
                          View Details
                        </Button>
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                            data-testid={`button-buy-again-${order.id}`}
                          >
                            Buy Again
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4" data-testid="text-no-orders">
                {activeTab === "all" && "No orders yet"}
                {activeTab === "progress" && "No orders in progress"}
                {activeTab === "completed" && "No completed orders"}
              </div>
              {activeTab === "all" && (
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                  data-testid="button-start-shopping"
                >
                  Start Shopping
                </Button>
              )}
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                data-testid="button-load-more-orders"
              >
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
