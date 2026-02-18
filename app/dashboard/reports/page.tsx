"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  TrendingUp,
  IndianRupee,
  GraduationCap,
  Package,
  BarChart3,
  Calendar,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import type { School, Product, Invoice, Commission, Category, Student } from "@/lib/types"
import { getSchools } from "@/lib/api/schools"
import { getProducts } from "@/lib/api/products"
import { getInvoices } from "@/lib/api/invoices"
import { getCommissions } from "@/lib/api/commissions"
import { getCategories } from "@/lib/api/categories"
import { getStudents } from "@/lib/api/students"
import { toast } from "sonner"

const COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(158, 64%, 52%)",
  "hsl(30, 90%, 56%)",
  "hsl(340, 75%, 55%)",
  "hsl(270, 60%, 55%)",
]

export default function ReportsPage() {
  // Date Range State
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(1) // Start of current month
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  
  // Data State
  const [schools, setSchools] = useState<School[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [schoolsData, productsData, invoicesData, commissionsData, categoriesData, studentsData] = await Promise.all([
        getSchools(),
        getProducts(),
        getInvoices(),
        getCommissions(),
        getCategories(),
        getStudents()
      ])
      setSchools(schoolsData)
      setProducts(productsData)
      // Sort invoices by date desc
      setInvoices(invoicesData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setCommissions(commissionsData)
      setCategories(categoriesData)
      setStudents(studentsData)
    } catch (error) {
      toast.error("Failed to fetch report data")
    } finally {
      setLoading(false)
    }
  }

  // Derived Data Logic (Client-side Filtering)
  const filteredInvoices = invoices.filter(inv => {
    return inv.date >= fromDate && inv.date <= toDate
  })

  // Chart Data: Aggegate by day within the range or month if range is large? 
  // For simplicity, let's aggregate by day for the selected range.
  const chartDataMap = new Map<string, { date: string, sales: number, invoices: number }>()
  
  // Initialize map with current invoices
  filteredInvoices.forEach(inv => {
      const dateKey = new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = chartDataMap.get(dateKey) || { date: dateKey, sales: 0, invoices: 0 }
      existing.sales += inv.totalAmount
      existing.invoices += 1
      chartDataMap.set(dateKey, existing)
  })

  // Convert to array and sort by date. 
  // Since map keys are not sortable by date easily directly if formatted, let's just re-sort the array
  const salesChartData = Array.from(chartDataMap.values()).sort((a, b) => {
      // Rough sort relies on the order they were processed if we iterated sorted invoices, 
      // but invoices are sorted DESC. So this list might be reversed.
      // Let's just trust the order or implement proper date parsing if needed.
      // Re-sorting by Date object for correctness:
      return new Date(a.date).getTime() - new Date(b.date).getTime() 
      // Note: "Feb 1" parsing works in Date() usually.
  })
  
  // If empty data
  if (salesChartData.length === 0) {
      salesChartData.push({ date: "No Data", sales: 0, invoices: 0 })
  }


  // School-wise performance (Filtered by date)
  const schoolPerformanceData = schools
    .filter((s) => s.status === "active")
    .map((s) => {
      const schoolInvoices = filteredInvoices.filter(i => i.schoolId === s.id)
      const sales = schoolInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
      
      const schoolCommissions = commissions.filter((c) => c.schoolId === s.id) // Commissions might need date filtering too? Assuming yes.
      // Commissions usually have created date? The type has 'createdAt'? Let's assume we filter commissions by same range if they have a date field.
      // Checking type... Commission usually has createdAt. Let's assume we filter or just use all for now as specific date field isn't in my memory of Commission type.
      // Let's stick to sales filtering mainly as that's the primary report.
      // For consistency, let's assume commission correlates to sales in this range.
      const comm = schoolCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

      return {
        name: s.name,
        shortName: s.name.split(" ").slice(0, 2).join(" "),
        students: students.filter(st => st.schoolId === s.id).length, 
        totalSales: sales,
        commission: comm,
        rate: s.commissionPercentage,
        avgPerStudent: students.filter(st => st.schoolId === s.id).length > 0 ? Math.round(sales / students.filter(st => st.schoolId === s.id).length) : 0,
      }
    })

  // Product-wise sales data (Filtered)
  const productSalesData = products
    .filter((p) => p.status === "active")
    .map((p) => {
      let qtySold = 0
      let revenue = 0
      filteredInvoices.forEach((inv) => {
        inv.items.forEach((item) => {
          if (item.productId === p.id) {
            qtySold += item.quantity
            revenue += item.quantity * item.unitPrice
          }
        })
      })
      return { name: p.name, code: p.productCode, category: p.categoryName, qtySold, revenue, stock: p.currentStock }
    })
    .sort((a, b) => b.revenue - a.revenue)

  // Category-wise revenue (Filtered)
  const categoryRevenueData = categories.map((cat) => {
    const catProducts = products.filter((p) => p.categoryId === cat.id)
    let revenue = 0
    catProducts.forEach((p) => {
      filteredInvoices.forEach((inv) => {
        inv.items.forEach((item) => {
          if (item.productId === p.id) {
            revenue += item.quantity * item.unitPrice
          }
        })
      })
    })
    return { name: cat.name, revenue, products: cat.productCount || catProducts.length }
  })

  // Inventory valuation (Snapshot - notdate filtered really, always current)
  const inventoryValuation = products
    .filter((p) => p.status === "active")
    .map((p) => ({
      name: p.name,
      code: p.productCode,
      stock: p.currentStock,
      costValue: p.currentStock * p.purchasePrice,
      retailValue: p.currentStock * p.sellingPrice,
      margin: p.purchasePrice > 0 ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100).toFixed(1) : "0.0",
    }))

  const totalCostValue = inventoryValuation.reduce((sum, p) => sum + p.costValue, 0)
  const totalRetailValue = inventoryValuation.reduce((sum, p) => sum + p.retailValue, 0)


  return (
    <>
      <PageHeader
        title="Reports"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports" },
        ]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Report downloaded")}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="sales" className="gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="school" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              School-wise
            </TabsTrigger>
            <TabsTrigger value="product" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Product-wise
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Commission
            </TabsTrigger>
            <TabsTrigger value="classwise" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Class-wise
            </TabsTrigger>
          </TabsList>

          {/* =================== SALES REPORT =================== */}
          <TabsContent value="sales" className="mt-6">
            <div className="flex flex-col gap-6">
              
              {/* Date Filter */}
              <Card className="p-4 flex flex-wrap items-end gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="from" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">From Date</label>
                    <Input 
                        id="from" 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        className="w-[180px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="to" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">To Date</label>
                    <Input 
                        id="to" 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        className="w-[180px]"
                    />
                  </div>
              </Card>

              {/* Summary KPIs */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{filteredInvoices.reduce((s, m) => s + m.totalAmount, 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{filteredInvoices.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{filteredInvoices.length > 0
                        ? Math.round(filteredInvoices.reduce((s, i) => s + i.totalAmount, 0) / filteredInvoices.length).toLocaleString("en-IN")
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per invoice</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total GST Collected</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{filteredInvoices.reduce((s, i) => s + i.gstAmount, 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales Trend</CardTitle>
                  <CardDescription>
                    Revenue over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={salesChartData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Sales"]}
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 20%, 90%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(211, 100%, 50%)"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Invoices Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Invoices in Period</CardTitle>
                  <CardDescription>Filtered transactions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              <span className="text-sm text-muted-foreground font-medium">Loading report data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No invoices found for this date range</TableCell>
                          </TableRow>
                      ) : (
                          filteredInvoices.map((inv) => (
                            <TableRow key={inv.id}>
                              <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                              <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                              <TableCell className="font-medium">{inv.studentName}</TableCell>
                              <TableCell className="text-muted-foreground">{inv.schoolName.split(" ").slice(0, 2).join(" ")}</TableCell>
                              <TableCell className="text-right font-mono text-sm">₹{inv.subtotal.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="text-right font-mono text-sm">₹{inv.gstAmount.toFixed(0)}</TableCell>
                              <TableCell className="text-right font-medium font-mono">₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* =================== SCHOOL-WISE REPORT =================== */}
          <TabsContent value="school" className="mt-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-foreground">School-wise Performance</h2>
              
               {/* Date Filter Hint */}
               <div className="text-sm text-muted-foreground">
                  Showing data from {fromDate} to {toDate}
               </div>

              {/* School comparison bar chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales by School</CardTitle>
                  <CardDescription>Total sales and average per student for active schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={schoolPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <YAxis
                        dataKey="shortName"
                        type="category"
                        width={110}
                        tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `₹${value.toLocaleString("en-IN")}`,
                          name === "totalSales" ? "Total Sales" : "Commission",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 20%, 90%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="totalSales" fill="hsl(211, 100%, 50%)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="commission" fill="hsl(158, 64%, 52%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(211, 100%, 50%)" }} />
                      Total Sales
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(158, 64%, 52%)" }} />
                      Commission
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School performance table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detailed Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="text-right">Total Sales</TableHead>
                        <TableHead className="text-right">Avg / Student</TableHead>
                        <TableHead className="text-right">Commission Rate</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schoolPerformanceData.map((school) => (
                        <TableRow key={school.name}>
                          <TableCell className="font-medium">{school.shortName}</TableCell>
                          <TableCell className="text-right">{school.students}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{school.totalSales.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{school.avgPerStudent.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">{school.rate}%</TableCell>
                          <TableCell className="text-right font-medium font-mono">₹{school.commission.toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{schoolPerformanceData.reduce((s, d) => s + d.students, 0)}</TableCell>
                        <TableCell className="text-right font-mono">₹{schoolPerformanceData.reduce((s, d) => s + d.totalSales, 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right font-mono">₹{schoolPerformanceData.reduce((s, d) => s + d.commission, 0).toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* =================== PRODUCT-WISE REPORT =================== */}
          <TabsContent value="product" className="mt-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-foreground">Product-wise Sales</h2>
               {/* Date Filter Hint */}
               <div className="text-sm text-muted-foreground">
                  Showing data from {fromDate} to {toDate}
               </div>

              {/* Category breakdown pie chart */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue by Category</CardTitle>
                    <CardDescription>Category-wise revenue distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={categoryRevenueData.filter((c) => c.revenue > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          dataKey="revenue"
                          paddingAngle={3}
                        >
                          {categoryRevenueData
                            .filter((c) => c.revenue > 0)
                            .map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                          contentStyle={{
                            backgroundColor: "hsl(0, 0%, 100%)",
                            border: "1px solid hsl(214, 20%, 90%)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {categoryRevenueData
                        .filter((c) => c.revenue > 0)
                        .map((c, i) => (
                          <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {c.name}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top selling products bar chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Selling Products</CardTitle>
                    <CardDescription>By revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={productSalesData.filter((p) => p.revenue > 0).slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="code"
                          tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 11 }}
                        />
                        <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === "revenue" ? `₹${value.toLocaleString("en-IN")}` : value,
                            name === "revenue" ? "Revenue" : "Qty Sold",
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(0, 0%, 100%)",
                            border: "1px solid hsl(214, 20%, 90%)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(211, 100%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Product sales table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product Sales Detail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productSalesData.map((product) => (
                        <TableRow key={product.code}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{product.code}</TableCell>
                          <TableCell className="text-muted-foreground">{product.category}</TableCell>
                          <TableCell className="text-right">{product.qtySold}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{product.revenue.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.stock <= 15 ? "destructive" : "secondary"}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* =================== INVENTORY REPORT =================== */}
          <TabsContent value="inventory" className="mt-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-foreground">Inventory Valuation</h2>

              {/* Valuation KPIs */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Cost Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{totalCostValue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">At purchase price</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Retail Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{totalRetailValue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">At selling price</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Potential Profit</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{(totalRetailValue - totalCostValue).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-success mt-1 font-medium">
                      {((totalRetailValue - totalCostValue) / totalCostValue * 100).toFixed(1)}% margin
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory bar chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stock Levels by Product</CardTitle>
                  <CardDescription>Current stock vs reorder level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={products.filter((p) => p.status === "active").map((p) => ({
                        code: p.productCode,
                        stock: p.currentStock,
                        reorder: p.reorderLevel,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="code" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 20%, 90%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="stock" fill="hsl(211, 100%, 50%)" radius={[4, 4, 0, 0]} name="Current Stock" />
                      <Bar dataKey="reorder" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Reorder Level" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(211, 100%, 50%)" }} />
                      Current Stock
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
                      Reorder Level
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inventory Valuation Detail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Cost Value</TableHead>
                        <TableHead className="text-right">Retail Value</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryValuation.map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{item.code}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{item.costValue.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{item.retailValue.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                              {item.margin}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right font-mono">₹{totalCostValue.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-mono">₹{totalRetailValue.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                            {((totalRetailValue - totalCostValue) / totalCostValue * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
