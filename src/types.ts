export interface LaundryOrder {
  id: number;
  order_number: number;
  villa_name: string;
  guest_name: string;
  order_date: string;
  delivery_date: string | null;
  delivered: boolean;
  total_garments: number;
  shirts: number;
  tshirts: number;
  jeans: number;
  trousers: number;
  shorts: number;
  inner_wear: number;
  socks: number;
  womens_dresses: number;
  coat_jacket: number;
  cap_hat: number;
  other: number;
  notes: string;
}

export interface GarmentCount {
  label: string;
  key: keyof Omit<LaundryOrder, 'id' | 'order_number' | 'villa_name' | 'guest_name' | 'order_date' | 'delivery_date' | 'delivered' | 'total_garments' | 'notes'>;
}