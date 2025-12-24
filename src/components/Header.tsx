import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Home, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { itemCount, location } = useCart();
  const { isAuthenticated, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent transition-transform group-hover:scale-110">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Quick<span className="text-primary">Bite</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>

          {isAuthenticated && profile ? (
            <>
              {profile.role !== 'staff' && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">My Orders</span>
                  </Button>
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-2">
                <User className="h-4 w-4" />
                <span>{profile.name}</span>
                {profile.role === 'staff' && (
                  <Badge variant="secondary" className="text-xs">Staff</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}

          {location && (
            <Link to="/menu">
              <Button variant="glass" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;