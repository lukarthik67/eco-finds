import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, User, Category } from "@shared/schema";

interface ProductCardProps {
  product: Product & { seller: User; category: Category };
  onViewDetails: () => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

    if (product.sellerId === user.id) {
      toast({
        title: "Cannot Add Own Item",
        description: "You cannot add your own listing to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
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

  return (
    <div
      className="bg-eco-card rounded-lg shadow-sm border border-eco-border overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      onClick={onViewDetails}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <img
          src={!imageError && product.imageUrl 
            ? product.imageUrl 
            : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
          }
          alt={product.title}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
        <Badge
          className={`absolute top-2 right-2 ${getConditionColor(product.condition)} text-xs`}
        >
          {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
        </Badge>
        {product.status === "sold" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge className="bg-red-600 text-white">SOLD</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-eco-foreground mb-2 line-clamp-1" data-testid={`text-title-${product.id}`}>
          {product.title}
        </h3>
        <p className="text-eco-muted-foreground text-sm mb-3" data-testid={`text-category-${product.id}`}>
          {product.category.name} • {product.condition} condition
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-eco-primary" data-testid={`text-price-${product.id}`}>
            ${product.price}
          </span>
          {product.status === "active" && (
            <Button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.sellerId === user?.id}
              size="sm"
              className="bg-eco-secondary hover:bg-eco-secondary/90 text-white"
              data-testid={`button-add-cart-${product.id}`}
            >
              {addToCartMutation.isPending 
                ? "Adding..." 
                : product.sellerId === user?.id
                ? "Your Item"
                : "Add to Cart"
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
