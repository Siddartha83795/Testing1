import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { RefreshCw, ArrowLeft, User, Phone, ChefHat, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useLocationOrders, useUpdateOrderStatus, OrderStatus } from '@/hooks/useOrders';
import { Location } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Get location from auth profile (for logged-in staff) or URL state (for demo)
  const demoLocation = routerLocation.state?.location as Location | undefined;
  const staffLocation = profile?.location || demoLocation;

  const { data: locationOrders = [], isLoading: ordersLoading, refetch } = useLocationOrders(staffLocation!);
  const updateOrderStatus = useUpdateOrderStatus();

  // Redirect if no location selected
  useEffect(() => {
    if (!authLoading && !staffLocation) {
      navigate('/staff/location');
    }
  }, [authLoading, staffLocation, navigate]);

  // Set up real-time subscription
  useEffect(() => {
    if (!staffLocation) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${staffLocation}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [staffLocation, refetch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (authLoading || !staffLocation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredOrders = statusFilter === 'all'
    ? locationOrders
    : locationOrders.filter((order) => order.status === statusFilter);

  const pendingCount = locationOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = locationOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = locationOrders.filter((o) => o.status === 'ready').length;

  const locationName = staffLocation === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  const handleBackToLocation = () => {
    navigate(isAuthenticated ? '/' : '/staff/location');
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLocation}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{isAuthenticated ? 'Home' : 'Change Location'}</span>
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">{locationName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && profile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{profile.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm hidden sm:inline">Live</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">New Orders</p>
          </div>
          <div className="rounded-xl border border-primary/50 bg-primary/10 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{preparingCount}</p>
            <p className="text-sm text-muted-foreground">Preparing</p>
          </div>
          <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{readyCount}</p>
            <p className="text-sm text-muted-foreground">Ready</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="all" className="gap-1">
              All
              <Badge variant="secondary" className="ml-1">{locationOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              New
              {pendingCount > 0 && (
                <Badge className="ml-1 bg-yellow-500 text-white">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders Grid */}
        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-border/50 bg-card p-5">
                  {/* Token Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold">
                        🎫 {order.token}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-muted text-muted-foreground'
                      }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Client Details */}
                  <div className="mb-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{order.client_name}</span>
                    </div>
                    {order.client_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{order.client_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-border/50 pt-3 mb-4">
                    <h4 className="font-medium text-sm mb-2">Order Items:</h4>
                    <ul className="space-y-1">
                      {(order.items as { name: string; quantity: number; price: number }[]).map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/30 mt-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      >
                        <ChefHat className="h-4 w-4 mr-1" />
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                      >
                        Complete Order
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-sm text-muted-foreground w-full text-center py-2">
                        ✅ Order Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-medium text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Orders will appear here in real-time</p>
              </div>
            )}
          </>
        )}

        {/* Last refresh indicator */}
        <div className="fixed bottom-4 right-4">
          <Badge variant="outline" className="text-xs">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;