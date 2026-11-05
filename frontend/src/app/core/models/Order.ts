export interface OrderItem {
  product: { _id: string; name: string; price: number };
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  _id: string;
  user: { username: string; phoneNumber: string };
  products: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  createdAt: string;
}

export interface ResponseOrders {
  msg: string;
  data: OrderRecord[];
}
