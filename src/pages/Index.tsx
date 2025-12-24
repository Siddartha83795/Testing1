import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Users, Zap, Coffee, Stethoscope, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading } = useAuth();

  // Redirect logged-in users
  React.useEffect(() => {
    if (isAuthenticated && profile && !isLoading) {
      if (profile.role === 'staff') {
        navigate('/staff');
      }
      // Don't auto-redirect clients - let them choose between dashboard/locations
    }
  }, [isAuthenticated, profile, isLoading, navigate]);

  const handleClientDemo = () => {
    navigate('/locations');
  };

  const handleStaffDemo = () => {
    navigate('/staff/location');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleOrderFood = () => {
    navigate('/locations');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">QuickBite Pro • Food Ordering System</span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl animate-slide-up">
              QuickBite{' '}
              <span className="gradient-text">Pro</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Order food instantly with saved details. 
              Login once, order anytime. Skip the queue.
            </p>

            {/* Login/Register or Authenticated User Buttons */}
            {isAuthenticated && profile ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleDashboard}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  My Dashboard & Orders
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleOrderFood}
                  className="gap-2"
                >
                  <Utensils className="h-5 w-5" />
                  Order Food
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleLogin}
                  className="gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Login / Register
                </Button>
              </div>
            )}

            {/* Demo Section */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm text-muted-foreground mb-4">🚀 Quick Demo Access (No login required)</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClientDemo}
                  className="flex-1 py-6 gap-3"
                >
                  <span className="text-2xl">👤</span>
                  <div className="text-left">
                    <div className="font-bold">Client Demo</div>
                    <div className="text-xs font-normal opacity-80">Order food • Get token</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStaffDemo}
                  className="flex-1 py-6 gap-3"
                >
                  <span className="text-2xl">👨‍🍳</span>
                  <div className="text-left">
                    <div className="font-bold">Staff Demo</div>
                    <div className="text-xs font-normal opacity-80">Manage orders</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-bold text-lg mb-2">Save Details</h3>
              <p className="text-sm text-muted-foreground">Login once, auto-fill forever.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Quick Order</h3>
              <p className="text-sm text-muted-foreground">No re-entering details.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Instant Token</h3>
              <p className="text-sm text-muted-foreground">Get your pickup token instantly.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold text-lg mb-2">Real-time</h3>
              <p className="text-sm text-muted-foreground">Staff dashboard updates live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-4">Two Locations, One App</h2>
            <p className="text-muted-foreground">Choose your favorite spot and start ordering</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-primary/20 p-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Medical Cafeteria</h3>
                <p className="text-muted-foreground mb-4">
                  Healthy and nutritious meals designed for wellness. Fresh juices, 
                  salads, and balanced thalis.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Healthy</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Fresh</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Nutritious</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-accent/50 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-accent/20 p-4">
                  <Coffee className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Bit Bites</h3>
                <p className="text-muted-foreground mb-4">
                  Quick bites and cafe favorites. Burgers, wraps, 
                  specialty coffees, and delicious snacks.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Fast Food</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Coffee</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Snacks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 QuickBite Pro. Food Ordering System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;