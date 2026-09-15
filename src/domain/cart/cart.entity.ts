export interface CartItem {
  bookId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
  createdAt: Date;
}

export interface AddCartItemInput {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
