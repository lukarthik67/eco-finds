import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, User, Category } from "@shared/schema";
import { ArrowLeft, ShoppingCart, MessageCircle, Heart, Star, Eye } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const productId = params?.id;

  const { data: product, isLoading, error } = useQuery<Product & { seller: User, category: Category }>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Product ID not found");
      return apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to be signed in to add items to cart",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (product?.sellerId === user.id) {
      toast({
        title: "Cannot Add Own Item",
        description: "You cannot add your own listing to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-eco-secondary/20 text-eco-secondary";
      case "excellent":
        return "bg-eco-primary/20 text-eco-primary";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eco-background">
        <Header />
        <main className="pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
              <div className="space-y-4">
                <div className="w-full h-96 bg-eco-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-eco-muted rounded w-3/4"></div>
                <div className="h-10 bg-eco-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-eco-muted rounded"></div>
                  <div className="h-4 bg-eco-muted rounded"></div>
                  <div className="h-4 bg-eco-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-eco-background">
        <Header />
        <main className="pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4">
                Product not found
              </div>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-eco-border"
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            className="mb-6 text-eco-muted-foreground hover:text-eco-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative bg-eco-card rounded-lg overflow-hidden border border-eco-border">
                <img
                  src={!imageError && product.imageUrl 
                    ? product.imageUrl 
                    : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop"
                  }
                  alt={product.title}
                  className="w-full h-96 object-cover"
                  onError={() => setImageError(true)}
                  data-testid="img-product"
                />
                {product.status === "sold" && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                      SOLD
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge 
                  className={`mb-3 ${getConditionColor(product.condition)}`}
                  data-testid="badge-condition"
                >
                  {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)} Condition
                </Badge>
                <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-product-title">
                  {product.title}
                </h1>
                <p className="text-4xl font-bold text-eco-primary mb-4" data-testid="text-product-price">
                  ${product.price}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-eco-foreground mb-2">Description</h3>
                <p className="text-eco-muted-foreground leading-relaxed" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-eco-foreground mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-eco-muted-foreground">Category:</span>
                    <span className="text-eco-foreground font-medium ml-2" data-testid="text-product-category">
                      {product.category.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-eco-muted-foreground">Condition:</span>
                    <span className="text-eco-foreground font-medium ml-2" data-testid="text-product-condition">
                      {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-eco-muted-foreground">Posted:</span>
                    <span className="text-eco-foreground font-medium ml-2" data-testid="text-product-posted">
                      {new Date(product.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-eco-muted-foreground">Views:</span>
                    <span className="text-eco-foreground font-medium ml-2 flex items-center" data-testid="text-product-views">
                      <Eye className="h-4 w-4 mr-1" />
                      {product.views || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <Card className="border-eco-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-eco-foreground mb-3">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-eco-muted rounded-full flex items-center justify-center">
                      {product.seller.profileImageUrl ? (
                        <img
                          src={product.seller.profileImageUrl}
                          alt="Seller"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-eco-muted-foreground font-medium">
                          {(product.seller.firstName?.[0] || product.seller.username?.[0] || "U").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-eco-foreground" data-testid="text-seller-name">
                        {product.seller.firstName 
                          ? `${product.seller.firstName} ${product.seller.lastName || ''}`.trim()
                          : product.seller.username || 'Anonymous Seller'
                        }
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-eco-secondary text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-eco-muted-foreground" data-testid="text-seller-rating">
                          4.9 (24 reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                {product.status === "active" ? (
                  <>
                    <Button
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending || product.sellerId === user?.id}
                      className="w-full bg-eco-primary hover:bg-eco-primary/90 text-white"
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {addToCartMutation.isPending 
                        ? "Adding to Cart..." 
                        : product.sellerId === user?.id
                        ? "Your Own Listing"
                        : "Add to Cart"
                      }
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-eco-border text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-message-seller"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-eco-border text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-save-favorite"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Save to Favorites
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                      This item has been sold
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
