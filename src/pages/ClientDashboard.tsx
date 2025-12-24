import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, RefreshCw, History, UtensilsCrossed, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useClientActiveOrders, useClientOrderHistory, OrderDB } from '@/hooks/useOrders';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { data: activeOrders = [], isLoading: loadingActive } = useClientActiveOrders();
  const { data: orderHistory = [], isLoading: loadingHistory } = useClientOrderHistory();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return colors[status] || colors.pending;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Welcome, {profile?.name || 'Guest'}!</h1>
          <p className="text-muted-foreground">Your personal food ordering dashboard</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">My Cart</p>
                  <p className="text-2xl font-bold">{cartItems.length} items</p>
                  <p className="text-sm text-muted-foreground">Total: ₹{cartTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <RefreshCw className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Being prepared</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <History className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Past Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{orderHistory.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Cart Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              My Cart ({cartItems.length} items)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/locations')} size="sm">
                <UtensilsCrossed className="h-4 w-4 mr-1" />
                Order More
              </Button>
              {cartItems.length > 0 && (
                <>
                  <Button onClick={() => navigate('/checkout')} size="sm" variant="default">
                    Checkout
                  </Button>
                  <Button onClick={clearCart} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-muted-foreground">Add some delicious items to get started!</p>
                <Button onClick={() => navigate('/locations')} className="mt-4">
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Cart Total</span>
                    <span className="text-2xl font-bold text-primary">₹{cartTotal}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Orders Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Active Orders ({activeOrders.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Orders being prepared for you</p>
          </CardHeader>
          <CardContent>
            {loadingActive ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-2">Loading...</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No active orders</h3>
                <p className="text-muted-foreground">Checkout your cart to place an order!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} formatTime={formatTime} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Order History ({orderHistory.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your completed and cancelled orders</p>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-2">Loading...</p>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No order history yet</h3>
                <p className="text-muted-foreground">Your completed orders will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {orderHistory.map((order) => (
                      <tr key={order.id} className="hover:bg-secondary/20">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold">{order.token}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {order.location === 'medical' ? '🏥 Medical' : '🍔 Bit Bites'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx}>{item.name} x{item.quantity}</div>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-muted-foreground">+{order.items.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold">₹{order.total}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Subcomponent for active order cards
const OrderCard: React.FC<{
  order: OrderDB;
  getStatusColor: (status: string) => string;
  formatTime: (date: string) => string;
}> = ({ order, getStatusColor, formatTime }) => {
  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge className="bg-primary/10 text-primary font-bold">🎫 {order.token}</Badge>
          </div>
          <Badge className={getStatusColor(order.status)} variant="secondary">
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="mb-3">
          <p className="font-medium">
            📍 {order.location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites'}
          </p>
          <p className="text-sm text-muted-foreground">
            Ordered: {formatTime(order.created_at)}
          </p>
        </div>

        <div className="border-t pt-3">
          <h5 className="font-medium mb-2 text-sm">Items:</h5>
          <ul className="space-y-1 text-sm">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-3 pt-3 font-bold flex justify-between">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Show token <span className="font-bold">{order.token}</span> at counter
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDashboard;
