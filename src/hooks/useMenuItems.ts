import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/api/config';
import { Location } from '@/types';

export interface MenuItemDB {
  id: string; // MongoDB _id mapped to id
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  location: 'medical' | 'bitbites';
  available: boolean;
  created_at?: string;
}

export const useMenuItems = (location?: Location) => {
  return useQuery({
    queryKey: ['menu-items', location],
    queryFn: async () => {
      let url = `${API_BASE_URL}/menu`;
      if (location) {
        url += `?location=${location}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      return data as MenuItemDB[];
    },
  });
};

export const useMenuItemsByLocation = (location: Location) => {
  return useQuery({
    queryKey: ['menu-items', location],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/menu?location=${location}`);

      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      return data as MenuItemDB[];
    },
    enabled: !!location,
  });
};
