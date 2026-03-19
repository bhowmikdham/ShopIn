import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Zap } from 'lucide-react';
import LivePriceComparison from '@/components/LivePriceComparison';
import StoreLocator from '@/components/StoreLocator';
import SmartMealRecommender from '@/components/SmartMealRecommender';
import { useSearch } from 'wouter';

export default function Home() {
  // Read tab from URL query string
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tabFromUrl = params.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'meals');

  useEffect(() => {
    if (tabFromUrl && ['meals', 'prices', 'stores'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      // Scroll to tabs section
      setTimeout(() => {
        document.getElementById('main-tabs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [tabFromUrl]);

  const scrollToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      document.getElementById('main-tabs')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/hero-background-PyebGsAGmo6coKknxm6kGG.webp)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Meal Store Finder</h1>
          <p className="text-xl mb-8">Real-time price comparison across Woolworths, Coles, Aldi & IGA</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="default" size="lg" onClick={() => scrollToTab('prices')}>
              <Zap className="w-4 h-4 mr-2" />
              View Live Prices
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10" onClick={() => scrollToTab('stores')}>
              <MapPin className="w-4 h-4 mr-2" />
              Find Stores Near Me
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 border-accent/20 bg-accent/5">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-lg mb-2">Real-Time Prices</h3>
            <p className="text-sm text-muted-foreground">
              Live pricing data updated every 30 minutes from all major retailers
            </p>
          </Card>
          <Card className="p-6 border-accent/20 bg-accent/5">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-bold text-lg mb-2">Location-Based</h3>
            <p className="text-sm text-muted-foreground">
              Find stores near you and compare prices instantly
            </p>
          </Card>
          <Card className="p-6 border-accent/20 bg-accent/5">
            <div className="text-3xl mb-2">🍽️</div>
            <h3 className="font-bold text-lg mb-2">Smart Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Get meal suggestions based on time of day and dietary needs
            </p>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs id="main-tabs" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="meals">Meal Ideas</TabsTrigger>
            <TabsTrigger value="prices">Price Comparison</TabsTrigger>
            <TabsTrigger value="stores">Nearby Stores</TabsTrigger>
          </TabsList>

          {/* Meal Recommendations Tab */}
          <TabsContent value="meals" className="space-y-4">
            <SmartMealRecommender />
          </TabsContent>

          {/* Price Comparison Tab */}
          <TabsContent value="prices" className="space-y-4">
            <LivePriceComparison />
          </TabsContent>

          {/* Store Locator Tab */}
          <TabsContent value="stores" className="space-y-4">
            <StoreLocator />
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">1</div>
              <h3 className="font-semibold mb-2">Select Your Meal</h3>
              <p className="text-sm text-muted-foreground">
                Browse meal ideas tailored to your dietary preferences and the time of day
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">2</div>
              <h3 className="font-semibold mb-2">Compare Prices</h3>
              <p className="text-sm text-muted-foreground">
                See real-time prices across all stores and find the best deals
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">3</div>
              <h3 className="font-semibold mb-2">Shop Smart</h3>
              <p className="text-sm text-muted-foreground">
                Get directions to the store with the best prices and save money
              </p>
            </div>
          </div>
        </Card>

        {/* Dietary Info */}
        <Card className="mt-8 p-6 border-l-4 border-accent">
          <h3 className="font-bold mb-2">🌱 Dietary Preferences</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Our app supports various dietary requirements including wheat-free options, dairy-free alternatives, and products suitable for Indian, Italian, and Mexican cuisines.
          </p>
          <p className="text-xs text-muted-foreground">
            All prices are in AUD and updated regularly. Stock availability may vary by location.
          </p>
        </Card>
      </div>
    </div>
  );
}
