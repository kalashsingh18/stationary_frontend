"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, Printer, X, Minus, ShoppingCart, Pencil } from "lucide-react"
import type { Invoice, InvoiceItem, Student, School, Product } from "@/lib/types"
import { getInvoices, createInvoice, updateInvoice } from "@/lib/api/invoices"
import { getStudents, createStudent } from "@/lib/api/students"
import { getSchools } from "@/lib/api/schools"
import { getProducts } from "@/lib/api/products"
import { toast } from "sonner"

interface CartItem extends InvoiceItem {
  stock: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("invoices")
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)

  // POS State
  const [customerMode, setCustomerMode] = useState<"student" | "walk-in">("student")
  const [posSchoolFilter, setPosSchoolFilter] = useState<string>("all")
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi" | "bank_transfer">("cash")
  const [posPaymentStatus, setPosPaymentStatus] = useState<"paid" | "unpaid" | "partial">("paid")
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [invoicesData, studentsData, schoolsData, productsData] = await Promise.all([
        getInvoices(),
        getStudents(),
        getSchools(),
        getProducts()
      ])
      setInvoices(invoicesData)
      setStudents(studentsData)
      setSchools(schoolsData)
      setProducts(productsData)
    } catch (error) {
      toast.error("Failed to fetch data")
      console.error(error)
    } finally {
        setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.schoolName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const matchedStudents = studentSearch.length >= 2 && customerMode === "student"
    ? students.filter(
        (s) =>
          (posSchoolFilter === "all" || s.schoolId === posSchoolFilter) &&
          (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
           s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())),
      )
    : []

  const matchedWalkIns = studentSearch.length >= 2 && customerMode === "walk-in"
    ? students.filter(
        (s) =>
          s.class === "Walk-in" &&
          (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
           (s.phone && s.phone.includes(studentSearch))),
      )
    : []

  const matchedProducts = productSearch.length >= 2
    ? products.filter(
        (p) =>
          p.status === "active" &&
          (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.productCode.toLowerCase().includes(productSearch.toLowerCase())),
      )
    : []

  // Cart calculations
  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + item.unitPrice * item.quantity, 0)
  const gstAmount = cart.reduce((sum: number, item: CartItem) => sum + (item.unitPrice * item.quantity * item.gstRate) / 100, 0)
  const totalAmount = subtotal - discount + gstAmount
  const school = (customerMode === "student" && selectedStudent) ? schools.find((s) => s.id === selectedStudent.schoolId) : null
  const commissionAmount = school ? ((subtotal - discount) * school.commissionPercentage) / 100 : 0

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCart((prev: CartItem[]) => {
      const existing = prev.find((c: CartItem) => c.productId === productId)
      if (existing) {
        // Check stock before adding
        const productInStock = products.find(p => p.id === productId);
        if (productInStock && existing.quantity + 1 > productInStock.currentStock) {
          toast.error("Insufficient stock");
          return prev;
        }
        return prev.map((c: CartItem) =>
          c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      // Check stock for new item
      if (product.currentStock < 1) {
        toast.error("Insufficient stock");
        return prev;
      }
      const gst = (product.sellingPrice * product.gstRate) / 100
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellingPrice,
          gstRate: product.gstRate,
          gstAmount: gst,
          total: product.sellingPrice + gst,
          stock: product.currentStock,
        },
      ]
    })
    setProductSearch("")
  }

  function updateCartQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.productId !== productId) return c
          const newQty = c.quantity + delta
          if (newQty <= 0) return null as unknown as CartItem
          if (newQty > c.stock) {
            toast.error("Insufficient stock")
            return c
          }
          return {
            ...c,
            quantity: newQty,
            gstAmount: (newQty * c.unitPrice * c.gstRate) / 100,
            total: newQty * c.unitPrice + (newQty * c.unitPrice * c.gstRate) / 100,
          }
        })
        .filter(Boolean),
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }

  async function handleGenerateInvoice() {
    if (customerMode === "student" && !selectedStudent) {
      toast.error("Please select a student")
      return
    }
    if (customerMode === "walk-in" && !walkInName) {
      toast.error("Please enter customer name")
      return
    }
    if (cart.length === 0) {
      toast.error("Please add items to cart")
      return
    }

    try {
        let studentId = selectedStudent?.id;

        // If walk-in, create a student record first if not already selected/existing
        if (customerMode === "walk-in" && !studentId) {
            // Check if student with this name and phone already exists in local state to avoid duplicates
            const existingWalkIn = students.find(s => 
                s.class === "Walk-in" && 
                s.name.toLowerCase() === walkInName.toLowerCase() && 
                s.phone === walkInPhone
            );

            if (existingWalkIn) {
                studentId = existingWalkIn.id;
            } else {
                const walkInStudent = await createStudent({
                    name: walkInName,
                    rollNumber: `WK-${Date.now().toString().slice(-6)}`,
                    class: "Walk-in",
                    section: "N/A",
                    contact: {
                        phone: walkInPhone
                    }
                });
                studentId = walkInStudent.id;
                // Add to local students list
                setStudents(prev => [...prev, walkInStudent]);
            }
        }

        const payload = {
            student: studentId,
            school: (customerMode === "student" && selectedStudent) ? selectedStudent.schoolId : undefined,
            items: cart.map(item => ({
                product: item.productId,
                quantity: item.quantity
            })),
            discount: discount,
            paymentMethod: paymentMethod,
            paymentStatus: posPaymentStatus
        }

        let result: Invoice;
        if (editingInvoice) {
            result = await updateInvoice(editingInvoice.id, payload)
            setInvoices((prev) => prev.map(inv => inv.id === result.id ? result : inv))
            toast.success(`Invoice ${result.invoiceNumber} updated successfully`)
        } else {
            result = await createInvoice(payload)
            // Enrich for immediate UI update if needed
            if(!result.studentName) {
                result.studentName = customerMode === "walk-in" ? walkInName : selectedStudent!.name
                result.rollNumber = customerMode === "walk-in" ? `WK-${studentId?.slice(-6)}` : selectedStudent!.rollNumber
                result.schoolName = customerMode === "walk-in" ? "N/A" : selectedStudent!.schoolName
            }
            setInvoices((prev) => [result, ...prev])
            toast.success(`Invoice ${result.invoiceNumber} generated successfully`)
        }
        
        // Reset POS
        setCart([])
        setSelectedStudent(null)
        setEditingInvoice(null)
        setStudentSearch("")
        setWalkInName("")
        setWalkInPhone("")
        setDiscount(0)
        setPaymentMethod("cash")
        setPosPaymentStatus("paid")
        setActiveTab("invoices")

    } catch (error) {
        toast.error(editingInvoice ? "Failed to update invoice" : "Failed to generate invoice")
        console.error(error)
    }
  }

  function handleEditInvoice(inv: Invoice) {
    setEditingInvoice(inv)
    setCustomerMode(inv.rollNumber.startsWith("WK-") ? "walk-in" : "student")
    if (!inv.rollNumber.startsWith("WK-")) {
        const student = students.find(s => s.id === inv.studentId)
        if (student) setSelectedStudent(student)
    } else {
        const walkIn = students.find(s => s.id === inv.studentId)
        if (walkIn) {
            setSelectedStudent(walkIn)
        } else {
            setWalkInName(inv.studentName)
        }
    }
    
    setCart(inv.items.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
            ...item,
            stock: product?.currentStock || 100 // Fallback
        }
    }))
    setDiscount(inv.discount)
    setPaymentMethod(inv.paymentMethod)
    setPosPaymentStatus(inv.paymentStatus)
    setActiveTab("pos")
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices" },
        ]}
      />

      <div className="flex flex-col gap-6 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="pos">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Invoice (POS)
            </TabsTrigger>
          </TabsList>

          {/* Invoices List Tab */}
          <TabsContent value="invoices" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              <span className="text-sm text-muted-foreground font-medium">Loading invoices...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            No invoices found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                            <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                            <TableCell>{inv.studentName}</TableCell>
                            <TableCell className="font-mono text-sm">{inv.rollNumber}</TableCell>
                            <TableCell className="text-muted-foreground">{inv.schoolName || "N/A"}</TableCell>
                            <TableCell className="text-right font-medium">₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                              <Badge variant={inv.paymentStatus === "paid" ? "secondary" : "destructive"} className="capitalize">
                                {inv.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize text-xs font-medium text-gray-500">{inv.paymentMethod.replace("_", " ")}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setViewingInvoice(inv)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Invoice
                                  </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      disabled={inv.paymentStatus === "paid"}
                                      className={inv.paymentStatus === "paid" ? "opacity-50 cursor-not-allowed" : ""}
                                      onClick={() => handleEditInvoice(inv)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit Invoice
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* POS Tab */}
          <TabsContent value="pos" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Left: Student + Product Selection */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Customer Selection */}
                <Card>
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base text-gray-800">Customer Details</CardTitle>
                        <CardDescription>Select student or enter walk-in info</CardDescription>
                      </div>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg self-start">
                        <Button 
                          variant={customerMode === "student" ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 text-xs font-semibold rounded-md shadow-xs px-4"
                          onClick={() => setCustomerMode("student")}
                        >
                          School Student
                        </Button>
                        <Button 
                          variant={customerMode === "walk-in" ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 text-xs font-semibold rounded-md px-4"
                          onClick={() => setCustomerMode("walk-in")}
                        >
                          Walk-in
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    {customerMode === "student" ? (
                      selectedStudent ? (
                        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 p-4 transition-all hover:bg-primary/10 group">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">{selectedStudent.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{selectedStudent.name}</p>
                              <p className="text-sm text-gray-500 font-medium">
                                {selectedStudent.rollNumber} • {selectedStudent.schoolName}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] h-4 bg-white/50 border-gray-200">Class {selectedStudent.class}-{selectedStudent.section}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
                            onClick={() => { setSelectedStudent(null); setStudentSearch("") }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="grid gap-2">
                             <Label className="text-xs font-bold text-gray-500 tracking-wider">Filter by School</Label>
                             <Select value={posSchoolFilter} onValueChange={setPosSchoolFilter}>
                               <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                                 <SelectValue placeholder="All Schools" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="all">All Schools</SelectItem>
                                 {schools.filter(s => s.status === 'active').map((s) => (
                                   <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                          </div>
                          <div className="relative">
                            <Label className="text-xs font-bold text-gray-500 tracking-wider mb-2 block">Search Student</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input
                                placeholder="Type student name or roll number..."
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 text-gray-700"
                              />
                            </div>
                            {matchedStudents.length > 0 && (
                              <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-100 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-[220px] overflow-y-auto p-1.5 pt-0">
                                  <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">Matching Students</div>
                                  {matchedStudents.map((student) => (
                                    <button
                                      key={student.id}
                                      className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-primary/5 text-left transition-colors border border-transparent hover:border-primary/10 mb-1"
                                      onClick={() => {
                                        setSelectedStudent(student)
                                        setStudentSearch("")
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600">
                                          {student.name.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-800 leading-tight">{student.name}</p>
                                          <p className="text-[11px] text-gray-500 font-medium">{student.schoolName}</p>
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-mono text-[10px]">{student.rollNumber}</Badge>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col gap-4">
                        {selectedStudent ? (
                          <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 p-4 transition-all hover:bg-primary/10 group">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold text-lg">{selectedStudent.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{selectedStudent.name}</p>
                                <p className="text-sm text-gray-500 font-medium">
                                  {selectedStudent.phone || "No phone"} • Walk-in Customer
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
                              onClick={() => { setSelectedStudent(null); setStudentSearch("") }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            <div className="relative">
                              <Label className="text-xs font-bold text-gray-500 tracking-wider mb-2 block">Search Regular Walk-in</Label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                  placeholder="Search by name or phone..."
                                  value={studentSearch}
                                  onChange={(e) => setStudentSearch(e.target.value)}
                                  className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 text-gray-700"
                                />
                              </div>
                              {matchedWalkIns.length > 0 && (
                                <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-100 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="max-h-[220px] overflow-y-auto p-1.5 pt-0">
                                    <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">Matching Customers</div>
                                    {matchedWalkIns.map((customer) => (
                                      <button
                                        key={customer.id}
                                        className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-primary/5 text-left transition-colors border border-transparent hover:border-primary/10 mb-1"
                                        onClick={() => {
                                          setSelectedStudent(customer)
                                          setStudentSearch("")
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600">
                                            {customer.name.charAt(0)}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-800 leading-tight">{customer.name}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{customer.phone || "N/A"}</p>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="walkInName" className="text-xs font-bold text-gray-500 tracking-wider">Customer Name (New)</Label>
                                <Input 
                                  id="walkInName" 
                                  placeholder="Ex. Jane Doe" 
                                  value={walkInName}
                                  onChange={(e) => setWalkInName(e.target.value)}
                                  className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 text-gray-700"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="walkInPhone" className="text-xs font-bold text-gray-500 tracking-wider">Phone number (New)</Label>
                                <Input 
                                  id="walkInPhone" 
                                  placeholder="Ex. +91 9876543210" 
                                  value={walkInPhone}
                                  onChange={(e) => setWalkInPhone(e.target.value)}
                                  className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 text-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Search */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Add Products</CardTitle>
                    <CardDescription>Search by name or product code</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Type product name or code..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9"
                      />
                      {matchedProducts.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg max-h-[240px] overflow-y-auto">
                          {matchedProducts.map((product) => (
                            <button
                              key={product.id}
                              className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-muted text-left"
                              onClick={() => addToCart(product.id)}
                            >
                              <div>
                                <p className="font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.productCode} | Stock: {product.currentStock}</p>
                              </div>
                              <span className="font-medium text-foreground">₹{product.sellingPrice}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Items */}
                {cart.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Cart Items ({cart.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">GST</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(item.productId, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(item.productId, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{item.gstRate}%</TableCell>
                              <TableCell className="text-right font-medium">₹{item.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.productId)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-2">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-base">Invoice Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {selectedStudent && (
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          <p className="font-medium text-foreground">{selectedStudent.name}</p>
                          <p className="text-muted-foreground">{selectedStudent.schoolName}</p>
                          {school && <p className="text-muted-foreground">Commission: {school.commissionPercentage}%</p>}
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">Discount (₹)</span>
                        <Input
                          type="number"
                          min="0"
                          max={subtotal}
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="h-8 text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">GST</span>
                        <span className="font-medium text-foreground">₹{gstAmount.toFixed(2)}</span>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">₹{totalAmount.toFixed(2)}</span>
                      </div>

                      {school && (
                        <div className="flex items-center justify-between text-sm rounded-lg bg-muted p-2">
                          <span className="text-muted-foreground">Commission ({school.commissionPercentage}%)</span>
                          <span className="font-medium text-primary">₹{commissionAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-2">
                        <Label className="text-xs font-bold text-gray-500 tracking-wider">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "cash", label: "Cash" },
                            { id: "upi", label: "UPI" },
                            { id: "card", label: "Card" },
                            { id: "bank_transfer", label: "Bank" }
                          ].map((method) => (
                            <Button
                              key={method.id}
                              variant={paymentMethod === method.id ? "default" : "outline"}
                              size="sm"
                              className="h-9 text-xs font-semibold rounded-lg"
                              onClick={() => setPaymentMethod(method.id as any)}
                            >
                              {method.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <Label className="text-xs font-bold text-gray-500 tracking-wider">Invoice Status</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "paid", label: "Paid" },
                            { id: "unpaid", label: "Unpaid" },
                            { id: "partial", label: "Partial" }
                          ].map((status) => (
                            <Button
                              key={status.id}
                              variant={posPaymentStatus === status.id ? "default" : "outline"}
                              size="sm"
                              className="h-9 text-xs font-semibold rounded-lg"
                              onClick={() => setPosPaymentStatus(status.id as any)}
                            >
                              {status.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-2 font-medium">Commission calculated on base amount (excl. GST)</p>

                      <Button 
                        className="mt-4 w-full h-12 text-sm font-bold tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90" 
                        size="lg" 
                        onClick={handleGenerateInvoice} 
                        disabled={(customerMode === "student" && !selectedStudent) || (customerMode === "walk-in" && !walkInName) || cart.length === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {editingInvoice ? "Update Invoice" : "Generate Invoice"}
                      </Button>
                      
                      {editingInvoice && (
                        <Button 
                          variant="ghost" 
                          className="mt-2 w-full h-10 text-xs font-bold text-gray-500"
                          onClick={() => {
                            setEditingInvoice(null)
                            setCart([])
                            setSelectedStudent(null)
                            setWalkInName("")
                            setDiscount(0)
                          }}
                        >
                          Cancel Editing
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice {viewingInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>Invoice details</DialogDescription>
          </DialogHeader>
          {viewingInvoice && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium text-foreground">{viewingInvoice.studentName} ({viewingInvoice.rollNumber})</p>
                </div>
                <div>
                  <p className="text-muted-foreground">School</p>
                  <p className="font-medium text-foreground">{viewingInvoice.schoolName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{viewingInvoice.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Invoice No.</p>
                  <p className="font-mono font-medium text-foreground">{viewingInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={viewingInvoice.paymentStatus === "paid" ? "secondary" : "destructive"}>{viewingInvoice.paymentStatus}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Mode</p>
                  <p className="font-medium text-foreground capitalize">{viewingInvoice.paymentMethod.replace("_", " ")}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingInvoice.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                      <TableCell className="text-right">{item.gstRate}%</TableCell>
                      <TableCell className="text-right font-medium">₹{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-8">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-foreground">₹{viewingInvoice.subtotal.toFixed(2)}</span>
                </div>
                {viewingInvoice.discount > 0 && (
                  <div className="flex gap-8">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-destructive">-₹{viewingInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex gap-8">
                  <span className="text-muted-foreground">GST:</span>
                  <span className="font-medium text-foreground">₹{viewingInvoice.gstAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-1 w-48" />
                <div className="flex gap-8 text-base">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-foreground">₹{viewingInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-8 text-xs mt-1">
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="font-medium text-primary">₹{viewingInvoice.commissionAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
