import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { Star, User as UserIcon, Settings, Bell, Shield, HelpCircle } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const form = useForm<Partial<User>>({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      bio: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset(user);
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile",
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

  const onSubmit = (data: Partial<User>) => {
    updateUserMutation.mutate(data);
  };

  const soldProducts = products.filter(p => p.status === "sold");
  const purchasedItems = orders.reduce((sum, order) => sum + order.orderItems?.length || 0, 0);
  const totalEarnings = soldProducts.reduce((sum, product) => sum + parseFloat(product.price || "0"), 0);
  const totalSaved = orders.reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);

  return (
    <div className="min-h-screen bg-eco-background">
      <Header />
      
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eco-foreground mb-2" data-testid="text-dashboard-title">
              Profile Dashboard
            </h1>
            <p className="text-eco-muted-foreground">Manage your account and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-eco-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-eco-foreground mb-4">
                    Personal Information
                  </h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-eco-foreground">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-first-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-eco-foreground">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-last-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="border-eco-border focus:border-eco-primary"
                                data-testid="input-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                value={field.value || ""}
                                className="border-eco-border focus:border-eco-primary"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                value={field.value || ""}
                                placeholder="Tell us about yourself..."
                                className="border-eco-border focus:border-eco-primary resize-none"
                                data-testid="textarea-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                        data-testid="button-save-personal"
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Address Information */}
              <Card className="border-eco-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-eco-foreground mb-4">
                    Address Information
                  </h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eco-foreground">Street Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="border-eco-border focus:border-eco-primary"
                                data-testid="input-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-eco-foreground">City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-city"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-eco-foreground">State</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-state"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-eco-foreground">ZIP Code</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  className="border-eco-border focus:border-eco-primary"
                                  data-testid="input-zip"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="bg-eco-primary hover:bg-eco-primary/90 text-white"
                        data-testid="button-save-address"
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Update Address"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            {/* Profile Sidebar */}
            <div className="space-y-6">
              {/* Profile Picture */}
              <Card className="border-eco-border">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-eco-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-eco-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-eco-foreground mb-2" data-testid="text-user-name">
                    {user?.firstName || user?.username || "User"}
                    {user?.lastName && ` ${user.lastName}`}
                  </h3>
                  <p className="text-sm text-eco-muted-foreground mb-4" data-testid="text-member-since">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'recently'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-eco-border text-eco-muted-foreground hover:bg-eco-muted"
                    data-testid="button-change-photo"
                  >
                    Change Photo
                  </Button>
                </CardContent>
              </Card>
              
              {/* Account Stats */}
              <Card className="border-eco-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-eco-foreground mb-4">Account Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-eco-muted-foreground text-sm">Items Sold</span>
                      <span className="font-semibold text-eco-foreground" data-testid="text-items-sold">
                        {soldProducts.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eco-muted-foreground text-sm">Items Purchased</span>
                      <span className="font-semibold text-eco-foreground" data-testid="text-items-purchased">
                        {purchasedItems}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eco-muted-foreground text-sm">Rating</span>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-eco-secondary">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-eco-foreground" data-testid="text-rating">
                          4.9
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eco-muted-foreground text-sm">Total Earned</span>
                      <span className="font-semibold text-eco-secondary" data-testid="text-total-earned">
                        ${totalEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eco-muted-foreground text-sm">Total Saved</span>
                      <span className="font-semibold text-eco-secondary" data-testid="text-total-saved">
                        ${totalSaved.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="border-eco-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-eco-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 text-sm text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-settings"
                    >
                      <Settings className="h-4 w-4 mr-3 text-eco-muted-foreground" />
                      Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 text-sm text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-notifications"
                    >
                      <Bell className="h-4 w-4 mr-3 text-eco-muted-foreground" />
                      Notifications
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 text-sm text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-privacy"
                    >
                      <Shield className="h-4 w-4 mr-3 text-eco-muted-foreground" />
                      Privacy & Security
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 text-sm text-eco-foreground hover:bg-eco-muted"
                      data-testid="button-help"
                    >
                      <HelpCircle className="h-4 w-4 mr-3 text-eco-muted-foreground" />
                      Help & Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
