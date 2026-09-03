export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  phoneNumber?: string;
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  notifications: boolean;
  language: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  sku?: string;
}

export interface Order {
  id: string;

  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  shippingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  shippingAddress: Address;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  title: string;
  dataIndex: keyof T | string;
  key: string;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  width?: number | string;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "date";
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  rules?: any[];
}

export type TimelineFilter =
  | "userRemarks"
  | "remarks"
  | "interfaceLogs"
  | "milestones"
  | "dispatch"
  | "caseActivity";
export type NoteTypes =
  | "userRemarks"
  | "remarks"
  | "interfaceLogs"
  | "milestones"
  | "fallout"
  | "dispatch";

export interface TimelineTab {
  id: TimelineFilter;
  label: string;
  icon: string;
}
