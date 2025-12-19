import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, location, clearCart, updateQuantity, removeItem } = useCart();
  const { createOrder } = useOrders();
  
  const [clientName, setClientName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!location || items.length === 0) {
    navigate('/menu');
    return null;
  }

  const handlePayment = async () => {
    if (!clientName.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const order = createOrder(items, location, clientName, tableNumber || undefined);
    clearCart();
    
    navigate('/confirmation', { state: { order } });
  };

  const locationName = location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/menu')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Menu
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Review your order and complete payment</p>

          {/* Order Summary */}
          <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {locationName}
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-2xl font-bold text-primary">₹{total}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Your Details
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="table">Table Number (Optional)</Label>
                <Input
                  id="table"
                  placeholder="e.g., T-5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full gap-2"
            disabled={!clientName.trim() || isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? (
              <>
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay ₹{total} (Demo)
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            This is a demo payment. No real transaction will occur.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
