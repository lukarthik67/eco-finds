import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import type { InsertProduct, Category } from "@shared/schema";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CloudUpload } from "lucide-react";
import { z } from "zod";

const sellFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
}).omit({ sellerId: true });

type SellFormData = z.infer<typeof sellFormSchema>;

export default function Sell() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDraft, setIsDraft] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      categoryId: "",
      condition: "good",
      status: "active",
      imageUrl: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: SellFormData) => {
      const productData = {
        ...data,
        price: parseFloat(data.price).toFixed(2),
        status: isDraft ? "draft" : "active",
      };
      return apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      toast({
        title: isDraft ? "Draft Saved" : "Product Listed",
        description: isDraft 
          ? "Your product has been saved as a draft"
          : "Your product has been successfully listed!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/my-listings");
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
        description: "Failed to create product listing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellFormData) => {
    createProductMutation.mutate(data);
  };

  const handleSaveAsDraft = () => {
    setIsDraft(true);
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setIsDraft(false);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-list-item-title">
              List Your Item
            </h1>
            <p className="text-eco-muted-foreground">
              Give your pre-loved items a new home and earn some money while helping the planet
            </p>
          </div>
          
          <Card className="border-eco-border">
            <CardContent className="p-6">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Product Title *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Vintage Leather Jacket, iPhone 12, etc."
                                className="border-eco-border focus:border-eco-primary"
                                data-testid="input-product-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eco-foreground">Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-eco-border" data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eco-foreground">Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-muted-foreground">$</span>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8 border-eco-border focus:border-eco-primary"
                                data-testid="input-price"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder="Describe the condition, age, brand, and any other relevant details..."
                                className="border-eco-border focus:border-eco-primary resize-none"
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Condition</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 md:grid-cols-5 gap-2"
                              >
                                {[
                                  { value: "new", label: "Like New" },
                                  { value: "excellent", label: "Excellent" },
                                  { value: "good", label: "Good" },
                                  { value: "fair", label: "Fair" },
                                  { value: "poor", label: "For Parts" },
                                ].map((condition) => (
                                  <div
                                    key={condition.value}
                                    className="flex items-center space-x-2 p-3 border border-eco-border rounded-md cursor-pointer hover:bg-eco-muted"
                                  >
                                    <RadioGroupItem value={condition.value} id={condition.value} />
                                    <Label
                                      htmlFor={condition.value}
                                      className="cursor-pointer text-sm"
                                      data-testid={`radio-condition-${condition.value}`}
                                    >
                                      {condition.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Photos</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <div className="border-2 border-dashed border-eco-border rounded-lg p-8 text-center hover:bg-eco-muted/50 transition-colors">
                                  <CloudUpload className="h-12 w-12 text-eco-muted-foreground mx-auto mb-4" />
                                  <p className="text-eco-muted-foreground mb-2">
                                    For now, please enter an image URL below
                                  </p>
                                  <p className="text-xs text-eco-muted-foreground">
                                    File upload will be available soon
                                  </p>
                                </div>
                                <Input
                                  {...field}
                                  placeholder="Enter image URL (optional)"
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-image-url"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-eco-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveAsDraft}
                      disabled={createProductMutation.isPending}
                      className="flex-1 border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                      data-testid="button-save-draft"
                    >
                      {createProductMutation.isPending && isDraft ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={createProductMutation.isPending}
                      className="flex-1 bg-eco-primary hover:bg-eco-primary/90 text-white"
                      data-testid="button-publish-listing"
                    >
                      {createProductMutation.isPending && !isDraft ? "Publishing..." : "Publish Listing"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
