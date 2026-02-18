export interface School {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  commissionPercentage: number
  status: "active" | "inactive"
  totalStudents: number
  totalSales: number
  commissionEarned: number
}

export interface Student {
  id: string
  rollNumber: string
  name: string
  class: string
  section: string
  phone?: string
  schoolId?: string
  schoolName?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  productCount: number
}

export interface Product {
  id: string
  name: string
  productCode: string
  barcode: string
  categoryId: string
  categoryName: string
  purchasePrice: number
  sellingPrice: number
  gstRate: number
  currentStock: number
  reorderLevel: number
  supplier: string
  status: "active" | "inactive"
}

export interface Supplier {
  id: string
  name: string
  code: string
  contact?: {
    phone?: string
    email?: string
    contactPerson?: string
  }
  gstin: string
  paymentTerms: string
  address: string
}

export interface PurchaseOrder {
  id: string
  purchaseNumber: string
  supplierId: string
  supplierName: string
  date: string
  items: PurchaseItem[]
  totalAmount: number
  paymentStatus: "pending" | "paid"
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  studentId: string
  studentName: string
  rollNumber: string
  schoolId?: string
  schoolName?: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  gstAmount: number
  totalAmount: number
  commissionAmount: number
  paymentStatus: "paid" | "unpaid" | "partial"
  paymentMethod: "cash" | "card" | "upi" | "bank_transfer"
}

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  gstRate: number
  gstAmount: number
  total: number
}

export interface Commission {
  id: string
  schoolId: string
  schoolName: string
  month: string
  totalSales: number
  baseAmount: number
  commissionRate: number
  commissionAmount: number
  status: "pending" | "settled"
  settledDate?: string
  reference?: string
}

export interface Admin {
  id: string
  username: string
  email: string
  role: string
}

export interface AuthResponse {
  success: boolean
  token: string
  admin: Admin
  message?: string
}
