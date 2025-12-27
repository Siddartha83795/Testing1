import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Location, CartItem } from '@/types';
import { API_BASE_URL, fetchConfig } from '@/api/config';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderDB {
  id: string;
  token: string;
  user_id: string | null;
  location: 'medical' | 'bitbites';
  items: CartItem[];
  total: number;
  status: OrderStatus;
  client_name: string;
  client_phone: string | null;
  table_number: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateOrderInput {
  items: CartItem[];
  location: Location;
  clientName: string;
  clientPhone?: string;
}

const generateToken = (location: Location): string => {
  const prefix = location === 'medical' ? 'MED' : 'BIT';
  const number = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${number}`;
};

export const useCreateOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<OrderDB> => {
      const token = generateToken(input.location);
      const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const orderData = {
        token,
        user_id: user?.id || null, // Supabase Auth ID
        location: input.location,
        items: input.items,
        total,
        status: 'pending',
        client_name: input.clientName,
        client_phone: input.clientPhone || null,
        table_number: null,
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data as OrderDB;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Get all orders for the current logged-in client
export const useClientOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', 'client', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch(`${API_BASE_URL}/orders?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data as OrderDB[];
    },
    enabled: !!user?.id,
  });
};

// Get active orders for logged-in client (pending, preparing, ready)
export const useClientActiveOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'client', 'active', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // We'll fetch all and filter for now, or could add advanced filtering to backend
      const response = await fetch(`${API_BASE_URL}/orders?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch active orders');
      }

      const data: OrderDB[] = await response.json();
      return data.filter(order => ['pending', 'preparing', 'ready'].includes(order.status));
    },
    enabled: !!user?.id,
  });

  // Polling for updates since we lost Real-time (for now)
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'client'] });
    }, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [user?.id, queryClient]);

  return query;
};

// Get order history for logged-in client (completed, cancelled)
export const useClientOrderHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', 'client', 'history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch(`${API_BASE_URL}/orders?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data: OrderDB[] = await response.json();
      return data.filter(order => ['completed', 'cancelled'].includes(order.status));
    },
    enabled: !!user?.id,
  });
};

export const useLocationOrders = (location: Location) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'location', location],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/orders?location=${location}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location orders');
      }

      return await response.json() as OrderDB[];
    },
    enabled: !!location,
  });

  // Polling for updates
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'location', location] });
    }, 10000);

    return () => clearInterval(interval);
  }, [location, queryClient]);

  return query;
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        ...fetchConfig,
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
