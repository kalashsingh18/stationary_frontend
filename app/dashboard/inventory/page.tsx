"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Package, AlertTriangle, TrendingDown, Warehouse } from "lucide-react"
import { products, categories } from "@/lib/mock-data"

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")

  const activeProducts = products.filter((p) => p.status === "active")
  const totalStock = activeProducts.reduce((sum, p) => sum + p.currentStock, 0)
  const lowStockItems = activeProducts.filter((p) => p.currentStock <= p.reorderLevel)
  const outOfStockItems = activeProducts.filter((p) => p.currentStock === 0)
  const inventoryValue = activeProducts.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.currentStock <= product.reorderLevel && product.currentStock > 0) ||
      (stockFilter === "out" && product.currentStock === 0) ||
      (stockFilter === "ok" && product.currentStock > product.reorderLevel)
    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <>
      <PageHeader
        title="Inventory"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Inventory" },
        ]}
      />

      <div className="flex flex-col gap-6 p-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Stock Units" value={totalStock.toLocaleString("en-IN")} description="across all products" icon={Package} />
          <StatCard title="Inventory Value" value={`₹${inventoryValue.toLocaleString("en-IN")}`} description="at purchase price" icon={Warehouse} />
          <StatCard title="Low Stock Items" value={lowStockItems.length.toString()} description="need restocking" icon={AlertTriangle} />
          <StatCard title="Out of Stock" value={outOfStockItems.length.toString()} description="no stock available" icon={TrendingDown} />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="ok">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
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
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead className="w-[180px]">Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const stockPercentage = product.reorderLevel > 0
                      ? Math.min((product.currentStock / (product.reorderLevel * 3)) * 100, 100)
                      : 100
                    const isLow = product.currentStock <= product.reorderLevel
                    const isOut = product.currentStock === 0
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            {isLow && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.categoryName}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={isOut ? "text-destructive" : isLow ? "text-warning" : ""}>
                            {product.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{product.reorderLevel}</TableCell>
                        <TableCell>
                          <Progress
                            value={stockPercentage}
                            className="h-2"
                          />
                        </TableCell>
                        <TableCell>
                          {isOut ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Low Stock</Badge>
                          ) : (
                            <Badge variant="default">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
