"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Eye, CheckCircle, Trash2, X } from "lucide-react"
import { purchaseOrders as initialPurchases, suppliers, products } from "@/lib/mock-data"
import type { PurchaseOrder, PurchaseItem } from "@/lib/types"
import { toast } from "sonner"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(initialPurchases)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseOrder | null>(null)

  // New purchase form state
  const [newSupplierId, setNewSupplierId] = useState("")
  const [newItems, setNewItems] = useState<PurchaseItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedQty, setSelectedQty] = useState(1)
  const [selectedPrice, setSelectedPrice] = useState(0)

  const filteredPurchases = purchases.filter((po) => {
    const matchesSearch =
      po.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || po.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  function addItemToNewPO() {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return
    const existing = newItems.find((i) => i.productId === selectedProductId)
    if (existing) {
      setNewItems((prev) =>
        prev.map((i) =>
          i.productId === selectedProductId
            ? { ...i, quantity: i.quantity + selectedQty, total: (i.quantity + selectedQty) * i.unitPrice }
            : i,
        ),
      )
    } else {
      setNewItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: selectedQty,
          unitPrice: selectedPrice || product.purchasePrice,
          total: selectedQty * (selectedPrice || product.purchasePrice),
        },
      ])
    }
    setSelectedProductId("")
    setSelectedQty(1)
    setSelectedPrice(0)
  }

  function removeItemFromNewPO(productId: string) {
    setNewItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function handleCreatePO() {
    if (!newSupplierId || newItems.length === 0) {
      toast.error("Please select a supplier and add at least one item")
      return
    }
    const supplier = suppliers.find((s) => s.id === newSupplierId)
    const totalAmount = newItems.reduce((sum, i) => sum + i.total, 0)
    const newPO: PurchaseOrder = {
      id: `po${Date.now()}`,
      purchaseNumber: `PO-2026-${String(purchases.length + 1).padStart(3, "0")}`,
      supplierId: newSupplierId,
      supplierName: supplier?.name || "",
      date: new Date().toISOString().split("T")[0],
      items: newItems,
      totalAmount,
      paymentStatus: "pending",
    }
    setPurchases((prev) => [newPO, ...prev])
    setIsAddOpen(false)
    setNewSupplierId("")
    setNewItems([])
    toast.success("Purchase order created successfully")
  }

  function markAsPaid(id: string) {
    setPurchases((prev) =>
      prev.map((po) => (po.id === id ? { ...po, paymentStatus: "paid" as const } : po)),
    )
    toast.success("Payment status updated")
  }

  return (
    <>
      <PageHeader
        title="Purchases"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchases" },
        ]}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Add items and submit a new purchase order.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Supplier</Label>
                  <Select value={newSupplierId} onValueChange={setNewSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-3">Add Items</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Product</Label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value)
                          const p = products.find((pr) => pr.id === e.target.value)
                          if (p) setSelectedPrice(p.purchasePrice)
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select product</option>
                        {products.filter((p) => p.status === "active").map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" value={selectedQty} onChange={(e) => setSelectedQty(Number(e.target.value))} />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input type="number" min="0" step="0.01" value={selectedPrice} onChange={(e) => setSelectedPrice(Number(e.target.value))} />
                    </div>
                    <Button type="button" onClick={addItemToNewPO} disabled={!selectedProductId}>Add</Button>
                  </div>

                  {newItems.length > 0 && (
                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newItems.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                            <TableCell className="text-right font-medium">₹{item.total.toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItemFromNewPO(item.productId)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                          <TableCell className="text-right font-bold">₹{newItems.reduce((sum, i) => sum + i.total, 0).toLocaleString("en-IN")}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePO}>Create Purchase Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PO number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-sm font-medium">{po.purchaseNumber}</TableCell>
                      <TableCell>{po.supplierName}</TableCell>
                      <TableCell className="text-muted-foreground">{po.date}</TableCell>
                      <TableCell className="text-right">{po.items.length}</TableCell>
                      <TableCell className="text-right font-medium">₹{po.totalAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant={po.paymentStatus === "paid" ? "default" : "secondary"}>
                          {po.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingPurchase(po)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {po.paymentStatus === "pending" && (
                              <DropdownMenuItem onClick={() => markAsPaid(po.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
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

      {/* View PO Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingPurchase?.purchaseNumber}</DialogTitle>
            <DialogDescription>Purchase order details</DialogDescription>
          </DialogHeader>
          {viewingPurchase && (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{viewingPurchase.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{viewingPurchase.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={viewingPurchase.paymentStatus === "paid" ? "default" : "secondary"}>
                    {viewingPurchase.paymentStatus}
                  </Badge>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingPurchase.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                      <TableCell className="text-right font-medium">₹{item.total.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">₹{viewingPurchase.totalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
