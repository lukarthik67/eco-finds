import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, Category } from "@shared/schema";
import { Plus, Edit, Eye, Share, Trash2 } from "lucide-react";

export default function MyListings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "draft">("active");

  const { data: products = [], isLoading, error } = useQuery<(Product & { category: Category })[]>({
    queryKey: ["/api/products/user", user?.id],
    enabled: !!user?.id,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Your product listing has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products/user", user?.id] });
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
        description: "Failed to delete product listing",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-eco-secondary/20 text-eco-secondary">Active</Badge>;
      case "sold":
        return <Badge className="bg-eco-accent/20 text-eco-accent">Sold</Badge>;
      case "draft":
        return <Badge variant="outline" className="border-eco-border text-eco-muted-foreground">Draft</Badge>;
      default:
        return null;
    }
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === "active") return product.status === "active";
    if (activeTab === "sold") return product.status === "sold";
    if (activeTab === "draft") return product.status === "draft";
    return true;
  });

  const tabCounts = {
    active: products.filter(p => p.status === "active").length,
    sold: products.filter(p => p.status === "sold").length,
    draft: products.filter(p => p.status === "draft").length,
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleShare = async (product: Product & { category: Category }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this ${product.category.name.toLowerCase()} on EcoFinds: ${product.title}`,
          url: `${window.location.origin}/product/${product.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to your clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-my-listings-title">
                My Listings
              </h1>
              <p className="text-eco-muted-foreground">Manage your active and sold listings</p>
            </div>
            <Button
              onClick={() => setLocation("/sell")}
              className="bg-eco-primary hover:bg-eco-primary/90 text-white"
              data-testid="button-add-listing"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="flex space-x-4 border-b border-eco-border">
              {[
                { key: "active", label: "Active", count: tabCounts.active },
                { key: "sold", label: "Sold", count: tabCounts.sold },
                { key: "draft", label: "Draft", count: tabCounts.draft },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-eco-primary text-eco-primary"
                      : "border-transparent text-eco-muted-foreground hover:text-eco-foreground"
                  }`}
                  data-testid={`tab-${tab.key}`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-eco-border">
                  <CardContent className="p-6">
                    <div className="flex gap-6 animate-pulse">
                      <div className="w-32 h-32 bg-eco-muted rounded-md"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-eco-muted rounded w-3/4"></div>
                        <div className="h-4 bg-eco-muted rounded w-1/2"></div>
                        <div className="h-4 bg-eco-muted rounded w-full"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-eco-muted rounded w-16"></div>
                          <div className="h-8 bg-eco-muted rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4">
                Failed to load your listings
              </div>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products/user", user?.id] })}
                variant="outline"
                className="border-eco-border"
                data-testid="button-retry"
              >
                Try Again
              </Button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-eco-border" data-testid={`card-product-${product.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"}
                        alt={product.title}
                        className="w-32 h-32 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-eco-foreground" data-testid={`text-title-${product.id}`}>
                            {product.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(product.status)}
                            <span className="text-lg font-bold text-eco-primary" data-testid={`text-price-${product.id}`}>
                              ${product.price}
                            </span>
                          </div>
                        </div>
                        <p className="text-eco-muted-foreground text-sm mb-4">
                          {product.category.name} • Posted {new Date(product.createdAt!).toLocaleDateString()} • 
                          {product.views || 0} views
                        </p>
                        <p className="text-eco-foreground mb-4 line-clamp-2" data-testid={`text-description-${product.id}`}>
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/product/${product.id}`)}
                            className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                            data-testid={`button-view-${product.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(product)}
                            className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                            data-testid={`button-share-${product.id}`}
                          >
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4">
                {activeTab === "active" && "No active listings"}
                {activeTab === "sold" && "No sold items yet"}
                {activeTab === "draft" && "No draft listings"}
              </div>
              {activeTab === "active" && (
                <Button
                  onClick={() => setLocation("/sell")}
                  className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                  data-testid="button-create-first-listing"
                >
                  Create Your First Listing
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
