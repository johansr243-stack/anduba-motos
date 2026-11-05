export interface Product {
  reviews: [];
  avgStars: number;
  _id?: string;
  name: string;
  nr?: string;
  category: string; 
  description: string;
  price: number;
  stock: number;
  status: string
  createdAt?: string;
  updatedAt?: string;
}

export interface ResponseProducts {
  msg: string;
  data: Product[];
}
