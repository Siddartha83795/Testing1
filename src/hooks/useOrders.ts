import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Location, CartItem } from '@/types';

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

      const { data, error } = await supabase
        .from('orders')
        .insert({
          token,
          user_id: user?.id || null,
          location: input.location as 'medical' | 'bitbites',
          items: JSON.parse(JSON.stringify(input.items)),
          total,
          status: 'pending' as const,
          client_name: input.clientName,
          client_phone: input.clientPhone || null,
          table_number: null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        items: data.items as unknown as CartItem[],
      } as OrderDB;
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

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((order) => ({
        ...order,
        items: order.items as unknown as CartItem[],
      })) as OrderDB[];
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

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((order) => ({
        ...order,
        items: order.items as unknown as CartItem[],
      })) as OrderDB[];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`client-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', 'client'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return data.map((order) => ({
        ...order,
        items: order.items as unknown as CartItem[],
      })) as OrderDB[];
    },
    enabled: !!user?.id,
  });
};

export const useLocationOrders = (location: Location) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'location', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((order) => ({
        ...order,
        items: order.items as unknown as CartItem[],
      })) as OrderDB[];
    },
    enabled: !!location,
  });

  // Real-time subscription for order updates
  useEffect(() => {
    if (!location) return;

    const channel = supabase
      .channel(`orders-${location}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${location}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', 'location', location] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location, queryClient]);

  return query;
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
