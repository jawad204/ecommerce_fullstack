export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  image: string | null;
  is_active: boolean;
  in_stock: boolean;
  category: Category;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: number;
}

export interface Order {
  id: number;
  total_price: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  is_seller:boolean
}