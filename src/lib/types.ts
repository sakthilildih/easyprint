export type OrderStatus = "Pending" | "Printing" | "Ready";

export interface OrderFile {
  name: string;
  size: number;
}

export interface Order {
  id: string;
  tokenNumber: string;
  userEmail: string;
  userName: string;
  files: OrderFile[];
  status: OrderStatus;
  createdAt: number;
}

export interface User {
  name: string;
  email: string;
  picture?: string;
}