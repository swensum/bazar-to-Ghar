export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedPackage?: string;
  discount_percentage?: number;
  material?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}