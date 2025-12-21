import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Location, CartItem } from '@/types';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

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
  tableNumber?: string;
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
          table_number: input.tableNumber || null,
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
          // Refetch orders when any change occurs
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
