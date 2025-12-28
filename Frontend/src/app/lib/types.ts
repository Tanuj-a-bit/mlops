// Core TypeScript types for the e-commerce platform

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string | any; // Can be string (from mock) or Category object (from API)
  rating: number;
  reviewCount?: number;
  reviews?: number; // kept for compatibility
  inStock: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  properties?: string; // Raw properties from DB
  specifications?: Record<string, string>;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
}
