import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Product, User, Category } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("latest");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<(Product & { seller: User, category: Category })[]>({
    queryKey: ["/api/products", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by the query dependency
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === "all" ? "" : categoryId);
  };

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-eco-background to-eco-card py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-eco-foreground mb-4">
                Discover. Reuse. Sustain.
              </h1>
              <p className="text-xl text-eco-muted-foreground mb-8">
                Find unique second-hand treasures while making a positive impact on our planet
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-6">
                <Input
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-20 h-12 bg-eco-background border-eco-border focus:border-eco-primary"
                  data-testid="input-search"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-muted-foreground" />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-eco-primary hover:bg-eco-primary/90 text-white px-6"
                  data-testid="button-search"
                >
                  Search
                </Button>
              </form>
              
              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant={selectedCategory === "" ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer text-sm font-medium ${
                    selectedCategory === ""
                      ? "bg-eco-primary text-white"
                      : "bg-eco-card text-eco-foreground border-eco-border hover:bg-eco-muted"
                  }`}
                  onClick={() => handleCategoryChange("all")}
                  data-testid="filter-all-categories"
                >
                  All Categories
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`px-4 py-2 cursor-pointer text-sm font-medium ${
                      selectedCategory === category.id
                        ? "bg-eco-primary text-white"
                        : "bg-eco-card text-eco-foreground border-eco-border hover:bg-eco-muted"
                    }`}
                    onClick={() => handleCategoryChange(category.id)}
                    data-testid={`filter-category-${category.slug}`}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-eco-foreground" data-testid="text-featured-items">
              Featured Items
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-eco-muted-foreground text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-eco-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-eco-card rounded-lg shadow-sm border border-eco-border overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-eco-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-eco-muted rounded"></div>
                    <div className="h-3 bg-eco-muted rounded w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-eco-muted rounded w-16"></div>
                      <div className="h-8 bg-eco-muted rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={() => setLocation(`/product/${product.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-eco-muted-foreground text-lg mb-4">
                {searchTerm || selectedCategory
                  ? "No products found matching your criteria"
                  : "No products available yet"}
              </div>
              <Button
                onClick={() => setLocation("/sell")}
                className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                data-testid="button-list-first-item"
              >
                List the First Item
              </Button>
            </div>
          )}
          
          {products.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                data-testid="button-load-more"
              >
                Load More Items
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
