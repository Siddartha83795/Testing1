import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { RefreshCw, Filter, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from '@/components/OrderCard';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { Order } from '@/types';

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orders, getOrdersByLocation } = useOrders();
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user || user.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  const locationOrders = user.location ? getOrdersByLocation(user.location) : orders;
  
  const filteredOrders = statusFilter === 'all' 
    ? locationOrders 
    : locationOrders.filter((order) => order.status === statusFilter);

  const pendingCount = locationOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = locationOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = locationOrders.filter((o) => o.status === 'ready').length;

  const locationName = user.location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="font-display text-xl font-bold">Staff Dashboard</h1>
            <p className="text-sm text-muted-foreground">{locationName}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastRefresh(new Date())}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 text-center">
            <p className="text-3xl font-bold text-warning">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">New Orders</p>
          </div>
          <div className="rounded-xl border border-primary/50 bg-primary/10 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{preparingCount}</p>
            <p className="text-sm text-muted-foreground">Preparing</p>
          </div>
          <div className="rounded-xl border border-success/50 bg-success/10 p-4 text-center">
            <p className="text-3xl font-bold text-success">{readyCount}</p>
            <p className="text-sm text-muted-foreground">Ready</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="all" className="gap-1">
              All
              <Badge variant="secondary" className="ml-1">{locationOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              New
              {pendingCount > 0 && (
                <Badge className="ml-1 bg-warning text-warning-foreground">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found</p>
          </div>
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
