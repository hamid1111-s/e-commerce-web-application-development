export type Category = "چاودێری پێست" | "ماکیاژ" | "چاودێری قژ" | "عەتر و بۆن"

export const CATEGORIES: Category[] = [
  "چاودێری پێست",
  "ماکیاژ",
  "چاودێری قژ",
  "عەتر و بۆن",
]

export const PAYMENT_METHODS = [
  { value: "FIB", label: "FIB", sub: "بانکی یەکەمی عێراق" },
  { value: "FastPay", label: "FastPay", sub: "فاست پەی" },
  { value: "QiCard", label: "QiCard", sub: "کی کارت" },
  { value: "کاش", label: "کاش لەکاتی وەرگرتن", sub: "پارەدان لە کاتی گەیاندن" },
] as const

export const ORDER_STATUSES = [
  "چاودێڕییە",
  "دراوە",
  "نێردراوە",
  "تەواوبوو",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface Product {
  id: string
  title: string
  category: string
  price_iqd: number
  image_url: string | null
  in_stock: boolean
  shades: string[]
  created_at: string
}

export interface City {
  id: string
  name: string
  delivery_fee_iqd: number
  sort_order: number
  created_at: string
}

export interface CartItem {
  productId: string
  title: string
  price_iqd: number
  image_url: string | null
  shade: string | null
  quantity: number
}

export interface OrderItem {
  title: string
  shade: string | null
  quantity: number
  price_iqd: number
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  city: string
  address_details: string
  items: OrderItem[]
  delivery_fee_iqd: number
  total_price_iqd: number
  payment_method: string
  payment_receipt_url: string | null
  status: OrderStatus
  created_at: string
}
