import { create } from 'zustand';
import { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Cylinder = Database['public']['Tables']['cylinders']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Pickup = Database['public']['Tables']['pickups']['Row'];

interface Store {
  user: User | null;
  cylinders: Cylinder[];
  orders: Order[];
  pickups: Pickup[];
  setCylinders: (cylinders: Cylinder[]) => void;
  setOrders: (orders: Order[]) => void;
  setPickups: (pickups: Pickup[]) => void;
  setUser: (user: User | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  cylinders: [],
  orders: [],
  pickups: [],
  setCylinders: (cylinders) => set({ cylinders }),
  setOrders: (orders) => set({ orders }),
  setPickups: (pickups) => set({ pickups }),
  setUser: (user) => set({ user }),
}));