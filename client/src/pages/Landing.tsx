import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Recycle, ArrowRight, Users, ShoppingBag, Star } from "lucide-react";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-eco-primary" />,
      title: "Sustainable Shopping",
      description: "Every purchase helps reduce waste and extend product lifecycles"
    },
    {
      icon: <Users className="h-8 w-8 text-eco-secondary" />,
      title: "Trusted Community",
      description: "Join thousands of conscious consumers making a positive impact"
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-eco-accent" />,
      title: "Unique Finds",
      description: "Discover one-of-a-kind treasures and vintage items"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-background to-eco-card">
      {/* Header */}
      <header className="bg-eco-card/80 backdrop-blur-sm border-b border-eco-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-eco-foreground">EcoFinds</span>
            </div>
            
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="bg-eco-primary hover:bg-eco-primary/90 text-white"
              data-testid="button-login"
            >
              Sign In / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-eco-primary/10 rounded-full mb-6">
              <Recycle className="h-10 w-10 text-eco-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-eco-foreground mb-6">
            Discover. Reuse. <span className="text-eco-primary">Sustain.</span>
          </h1>
          
          <p className="text-xl text-eco-muted-foreground mb-8 max-w-3xl mx-auto">
            Find unique second-hand treasures while making a positive impact on our planet. 
            Join our community of conscious consumers committed to sustainable living.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-eco-primary hover:bg-eco-primary/90 text-white px-8 py-4 text-lg"
              data-testid="button-get-started"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-eco-muted-foreground">
              Free to join • No subscription fees
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-eco-foreground mb-4">
              Why Choose EcoFinds?
            </h2>
            <p className="text-eco-muted-foreground text-lg max-w-2xl mx-auto">
              More than just a marketplace - we're building a sustainable future together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-2 transition-all duration-300 cursor-pointer ${
                  activeFeature === index
                    ? "border-eco-primary bg-eco-card shadow-lg"
                    : "border-eco-border bg-eco-card/50 hover:border-eco-primary/50"
                }`}
                onClick={() => setActiveFeature(index)}
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-eco-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-eco-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-eco-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-eco-primary mb-2" data-testid="text-users-count">
                10,000+
              </div>
              <div className="text-eco-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-eco-secondary mb-2" data-testid="text-items-sold">
                50,000+
              </div>
              <div className="text-eco-muted-foreground">Items Given New Life</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-eco-accent mb-2" data-testid="text-co2-saved">
                2.5M lbs
              </div>
              <div className="text-eco-muted-foreground">CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-eco-primary mb-2" data-testid="text-satisfaction">
                4.9
                <Star className="inline h-6 w-6 ml-1 text-eco-secondary fill-current" />
              </div>
              <div className="text-eco-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-eco-foreground mb-6">
            Ready to Start Your Sustainable Journey?
          </h2>
          <p className="text-lg text-eco-muted-foreground mb-8">
            Join thousands of others who are making a difference, one purchase at a time.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-eco-secondary hover:bg-eco-secondary/90 text-white px-8 py-4 text-lg"
            data-testid="button-join-now"
          >
            Join EcoFinds Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-eco-card border-t border-eco-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-eco-foreground">EcoFinds</span>
          </div>
          <p className="text-eco-muted-foreground text-sm">
            © 2024 EcoFinds. Empowering sustainable consumption through community.
          </p>
        </div>
      </footer>
    </div>
  );
}
