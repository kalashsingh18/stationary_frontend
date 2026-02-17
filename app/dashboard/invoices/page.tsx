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
import { Plus, Search, MoreHorizontal, Eye, Printer, X, Minus, ShoppingCart } from "lucide-react"
import type { Invoice, InvoiceItem, Student, School, Product } from "@/lib/types"
import { getInvoices, createInvoice } from "@/lib/api/invoices"
import { getStudents } from "@/lib/api/students"
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
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)

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

  const matchedStudents = studentSearch.length >= 2
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()),
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
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const gstAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.gstRate) / 100, 0)
  const totalAmount = subtotal - discount + gstAmount
  const school = selectedStudent ? schools.find((s) => s.id === selectedStudent.schoolId) : null
  const commissionAmount = school ? ((subtotal - discount) * school.commissionPercentage) / 100 : 0

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const existing = cart.find((c) => c.productId === productId)
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        toast.error("Insufficient stock")
        return
      }
      setCart((prev) =>
        prev.map((c) =>
          c.productId === productId
            ? {
                ...c,
                quantity: c.quantity + 1,
                gstAmount: ((c.quantity + 1) * c.unitPrice * c.gstRate) / 100,
                total: (c.quantity + 1) * c.unitPrice + ((c.quantity + 1) * c.unitPrice * c.gstRate) / 100,
              }
            : c,
        ),
      )
    } else {
      const gst = (product.sellingPrice * product.gstRate) / 100
      setCart((prev) => [
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
      ])
    }
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
    if (!selectedStudent) {
      toast.error("Please select a student")
      return
    }
    if (cart.length === 0) {
      toast.error("Please add items to cart")
      return
    }

    try {
        const payload = {
            student: selectedStudent.id,
            items: cart.map(item => ({
                product: item.productId,
                quantity: item.quantity
            })),
            discount: discount
        }

        const newInvoice = await createInvoice(payload)
        
        // Use returned invoice data, which should be populated or partially populated
        // If not populated fully, we might need to manually attach names for immediate display
        if(!newInvoice.studentName) {
            newInvoice.studentName = selectedStudent.name
            newInvoice.rollNumber = selectedStudent.rollNumber
            newInvoice.schoolName = selectedStudent.schoolName
        }
        
        // For items, API util createInvoice returns items as is from backend. 
        // Backend `createInvoice` populates items.product?
        // Let's assume it does or we refresh the list. 
        // Actually locally updating `invoices` with `newInvoice` is fastest.
        // We can also rely on fetchData() to refresh everything if we want 100% truth, but that's slower.
        // Let's trust the API return + manual patches if needed for UI smoothness.

        setInvoices((prev) => [newInvoice, ...prev])
        setCart([])
        setSelectedStudent(null)
        setStudentSearch("")
        setDiscount(0)
        setActiveTab("invoices")
        toast.success(`Invoice ${newInvoice.invoiceNumber} generated successfully`)

    } catch (error) {
        toast.error("Failed to generate invoice")
        console.error(error)
    }
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
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
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
                            <TableCell className="text-muted-foreground">{inv.schoolName}</TableCell>
                            <TableCell className="text-right">₹{inv.subtotal.toLocaleString("en-IN")}</TableCell>
                            <TableCell className="text-right">₹{inv.gstAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
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
                {/* Student Search */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Select Student</CardTitle>
                    <CardDescription>Search by name or roll number</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent ? (
                      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div>
                          <p className="font-medium text-foreground">{selectedStudent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudent.rollNumber} | {selectedStudent.schoolName} | Class {selectedStudent.class}-{selectedStudent.section}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedStudent(null); setStudentSearch("") }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Type student name or roll number..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="pl-9"
                        />
                        {matchedStudents.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg max-h-[200px] overflow-y-auto">
                            {matchedStudents.map((student) => (
                              <button
                                key={student.id}
                                className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-muted text-left"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setStudentSearch("")
                                }}
                              >
                                <div>
                                  <p className="font-medium text-foreground">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.schoolName}</p>
                                </div>
                                <Badge variant="secondary" className="ml-2">{student.rollNumber}</Badge>
                              </button>
                            ))}
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

                      <p className="text-xs text-muted-foreground">Commission calculated on base amount (excl. GST)</p>

                      <Button className="mt-2 w-full" size="lg" onClick={handleGenerateInvoice} disabled={!selectedStudent || cart.length === 0}>
                        Generate Invoice
                      </Button>
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
                  <p className="font-medium text-foreground">{viewingInvoice.schoolName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{viewingInvoice.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Invoice No.</p>
                  <p className="font-mono font-medium text-foreground">{viewingInvoice.invoiceNumber}</p>
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
