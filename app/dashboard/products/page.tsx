"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { products as initialProducts, categories, suppliers } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  function handleAddProduct(formData: FormData) {
    const categoryId = formData.get("categoryId") as string
    const category = categories.find((c) => c.id === categoryId)
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: formData.get("name") as string,
      productCode: formData.get("productCode") as string,
      barcode: formData.get("barcode") as string,
      categoryId,
      categoryName: category?.name || "",
      purchasePrice: Number(formData.get("purchasePrice")),
      sellingPrice: Number(formData.get("sellingPrice")),
      gstRate: Number(formData.get("gstRate")),
      currentStock: Number(formData.get("currentStock")),
      reorderLevel: Number(formData.get("reorderLevel")),
      supplier: formData.get("supplier") as string,
      status: "active",
    }
    setProducts((prev) => [...prev, newProduct])
    setIsAddOpen(false)
    toast.success("Product added successfully")
  }

  function handleDeleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success("Product deleted successfully")
  }

  return (
    <>
      <PageHeader
        title="Products"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products" },
        ]}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form action={handleAddProduct}>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Enter product details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required placeholder="e.g. Single Line Notebook 200pg" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productCode">Product Code</Label>
                      <Input id="productCode" name="productCode" required placeholder="NB-001" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input id="barcode" name="barcode" required placeholder="8901234560001" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <select name="categoryId" id="categoryId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                      <Input id="purchasePrice" name="purchasePrice" type="number" required min="0" step="0.01" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                      <Input id="sellingPrice" name="sellingPrice" type="number" required min="0" step="0.01" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gstRate">GST Rate (%)</Label>
                      <select name="gstRate" id="gstRate" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input id="currentStock" name="currentStock" type="number" required min="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <Input id="reorderLevel" name="reorderLevel" type="number" required min="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <select name="supplier" id="supplier" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Product</Button>
                </DialogFooter>
              </form>
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
              placeholder="Search by name or product code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Purchase (₹)</TableHead>
                  <TableHead className="text-right">Selling (₹)</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {product.currentStock <= product.reorderLevel && (
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{product.purchasePrice}</TableCell>
                      <TableCell className="text-right font-medium">₹{product.sellingPrice}</TableCell>
                      <TableCell className="text-right">{product.gstRate}%</TableCell>
                      <TableCell className="text-right">
                        <span className={product.currentStock <= product.reorderLevel ? "text-destructive font-medium" : ""}>
                          {product.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status}
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
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <form action={(formData) => {
            if (!editingProduct) return
            setProducts((prev) =>
              prev.map((p) =>
                p.id === editingProduct.id
                  ? {
                      ...p,
                      name: formData.get("name") as string,
                      sellingPrice: Number(formData.get("sellingPrice")),
                      purchasePrice: Number(formData.get("purchasePrice")),
                      gstRate: Number(formData.get("gstRate")),
                      reorderLevel: Number(formData.get("reorderLevel")),
                    }
                  : p,
              ),
            )
            setEditingProduct(null)
            toast.success("Product updated successfully")
          }}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingProduct?.name} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-purchasePrice">Purchase Price (₹)</Label>
                  <Input id="edit-purchasePrice" name="purchasePrice" type="number" defaultValue={editingProduct?.purchasePrice} required min="0" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-sellingPrice">Selling Price (₹)</Label>
                  <Input id="edit-sellingPrice" name="sellingPrice" type="number" defaultValue={editingProduct?.sellingPrice} required min="0" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gstRate">GST Rate (%)</Label>
                  <select name="gstRate" id="edit-gstRate" defaultValue={editingProduct?.gstRate} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input id="edit-reorderLevel" name="reorderLevel" type="number" defaultValue={editingProduct?.reorderLevel} required min="0" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
