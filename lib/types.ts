export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  category_id: string | null;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  about: string | null;
  city: string | null;
  country: string | null;
  twitter: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  updated_at: string;
}
