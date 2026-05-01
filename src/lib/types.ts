export type OrderStatus = "Pending" | "Printing" | "Ready";

export interface OrderFile {
  name: string;
  size: number;
  url?: string; // S3 object URL
}

export interface Order {
  id: string;
  userId: string;
  tokenNumber: string;
  userEmail: string;
  userName: string;
  files: OrderFile[];
  status: OrderStatus;
  projectUrl: string;
  createdAt: number;
}

export interface User {
  name: string;
  email: string;
  picture?: string;
}