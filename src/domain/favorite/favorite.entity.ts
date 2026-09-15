export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
  populated?: {
    book?: {
      id: string;
      title: string;
      author: string;
      price: number;
      coverImageUrl?: string;
    };
  };
}

export interface CreateFavoriteInput {
  userId: string;
  bookId: string;
}
