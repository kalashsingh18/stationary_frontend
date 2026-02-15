"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { schools, products, invoices, commissions, categories, students } from "@/lib/mock-data"
import { toast } from "sonner"

// --- Derived Report Data ---

const COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(158, 64%, 52%)",
  "hsl(30, 90%, 56%)",
  "hsl(340, 75%, 55%)",
  "hsl(270, 60%, 55%)",
]

// Daily sales data for the current month
const dailySalesData = [
  { day: "Feb 1", sales: 3200, invoices: 4 },
  { day: "Feb 3", sales: 4800, invoices: 6 },
  { day: "Feb 5", sales: 2100, invoices: 3 },
  { day: "Feb 7", sales: 6500, invoices: 8 },
  { day: "Feb 8", sales: 3800, invoices: 5 },
  { day: "Feb 10", sales: 7200, invoices: 9 },
  { day: "Feb 11", sales: 4100, invoices: 5 },
  { day: "Feb 12", sales: 5600, invoices: 7 },
  { day: "Feb 13", sales: 2900, invoices: 4 },
  { day: "Feb 14", sales: 8291, invoices: 10 },
  { day: "Feb 15", sales: 4806, invoices: 6 },
]

// Monthly trend data
const monthlySalesData = [
  { month: "Sep 25", sales: 145000, commission: 14500 },
  { month: "Oct 25", sales: 162000, commission: 16200 },
  { month: "Nov 25", sales: 198000, commission: 19800 },
  { month: "Dec 25", sales: 155000, commission: 15500 },
  { month: "Jan 26", sales: 292000, commission: 29200 },
  { month: "Feb 26", sales: 153700, commission: 15370 },
]

// Weekly summary
const weeklySalesData = [
  { week: "Week 1", sales: 18500, invoices: 22 },
  { week: "Week 2", sales: 24200, invoices: 31 },
  { week: "Week 3", sales: 0, invoices: 0 },
  { week: "Week 4", sales: 0, invoices: 0 },
]

// School-wise performance
const schoolPerformanceData = schools
  .filter((s) => s.status === "active")
  .map((s) => ({
    name: s.name,
    shortName: s.name.split(" ").slice(0, 2).join(" "),
    students: s.totalStudents,
    totalSales: s.totalSales,
    commission: s.commissionEarned,
    rate: s.commissionPercentage,
    avgPerStudent: s.totalStudents > 0 ? Math.round(s.totalSales / s.totalStudents) : 0,
  }))

// Product-wise sales data (top sellers)
const productSalesData = products
  .filter((p) => p.status === "active")
  .map((p) => {
    // Derive sales from invoices
    let qtySold = 0
    let revenue = 0
    invoices.forEach((inv) => {
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

// Category-wise revenue
const categoryRevenueData = categories.map((cat) => {
  const catProducts = products.filter((p) => p.categoryId === cat.id)
  let revenue = 0
  catProducts.forEach((p) => {
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (item.productId === p.id) {
          revenue += item.quantity * item.unitPrice
        }
      })
    })
  })
  return { name: cat.name, revenue, products: cat.productCount }
})

// Inventory valuation
const inventoryValuation = products
  .filter((p) => p.status === "active")
  .map((p) => ({
    name: p.name,
    code: p.productCode,
    stock: p.currentStock,
    costValue: p.currentStock * p.purchasePrice,
    retailValue: p.currentStock * p.sellingPrice,
    margin: ((p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100).toFixed(1),
  }))

const totalCostValue = inventoryValuation.reduce((sum, p) => sum + p.costValue, 0)
const totalRetailValue = inventoryValuation.reduce((sum, p) => sum + p.retailValue, 0)

// Class-wise analysis
const classWiseData = (() => {
  const classMap: Record<string, { class: string; students: number; sales: number }> = {}
  students.forEach((st) => {
    if (!classMap[st.class]) {
      classMap[st.class] = { class: st.class, students: 0, sales: 0 }
    }
    classMap[st.class].students++
    // derive sales from invoices for this student
    invoices.forEach((inv) => {
      if (inv.studentId === st.id) {
        classMap[st.class].sales += inv.totalAmount
      }
    })
  })
  const classOrder = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
  return classOrder
    .filter((c) => classMap[c])
    .map((c) => classMap[c])
})()

// Commission summary by school
const commissionSummary = schools
  .filter((s) => s.status === "active")
  .map((s) => {
    const schoolComm = commissions.filter((c) => c.schoolId === s.id)
    const totalCommAmt = schoolComm.reduce((sum, c) => sum + c.commissionAmount, 0)
    const pendingAmt = schoolComm.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.commissionAmount, 0)
    const settledAmt = schoolComm.filter((c) => c.status === "settled").reduce((sum, c) => sum + c.commissionAmount, 0)
    return { name: s.name, shortName: s.name.split(" ").slice(0, 2).join(" "), rate: s.commissionPercentage, total: totalCommAmt, pending: pendingAmt, settled: settledAmt }
  })

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly")

  const salesChartData = period === "daily" ? dailySalesData : period === "weekly" ? weeklySalesData : monthlySalesData

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
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
              {/* Period selector */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Sales Reports</h2>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary KPIs */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{monthlySalesData.reduce((s, m) => s + m.sales, 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{invoices.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{invoices.length > 0
                        ? Math.round(invoices.reduce((s, i) => s + i.totalAmount, 0) / invoices.length).toLocaleString("en-IN")
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per invoice</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total GST Collected</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ₹{invoices.reduce((s, i) => s + i.gstAmount, 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly"} Sales Trend
                  </CardTitle>
                  <CardDescription>
                    {period === "daily" ? "February 2026" : period === "weekly" ? "February 2026 by week" : "Last 6 months"}
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
                        dataKey={period === "daily" ? "day" : period === "weekly" ? "week" : "month"}
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
                  <CardTitle className="text-base">Recent Invoices</CardTitle>
                  <CardDescription>All invoices this period</CardDescription>
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
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                          <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                          <TableCell className="font-medium">{inv.studentName}</TableCell>
                          <TableCell className="text-muted-foreground">{inv.schoolName.split(" ").slice(0, 2).join(" ")}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{inv.subtotal.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{inv.gstAmount.toFixed(0)}</TableCell>
                          <TableCell className="text-right font-medium font-mono">₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                      ))}
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

          {/* =================== COMMISSION REPORT =================== */}
          <TabsContent value="commission" className="mt-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-foreground">Commission Reports</h2>

              {/* Commission summary chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Commission by School</CardTitle>
                  <CardDescription>Pending vs settled amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={commissionSummary}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="shortName" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `₹${value.toLocaleString("en-IN")}`,
                          name === "settled" ? "Settled" : "Pending",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 20%, 90%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="settled" fill="hsl(158, 64%, 52%)" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(158, 64%, 52%)" }} />
                      Settled
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
                      Pending
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">School Commission Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Total Commission</TableHead>
                        <TableHead className="text-right">Settled</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionSummary.map((school) => (
                        <TableRow key={school.name}>
                          <TableCell className="font-medium">{school.shortName}</TableCell>
                          <TableCell className="text-right">{school.rate}%</TableCell>
                          <TableCell className="text-right font-mono text-sm">₹{school.total.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-emerald-600">₹{school.settled.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-amber-600">₹{school.pending.toLocaleString("en-IN")}</TableCell>
                          <TableCell>
                            {school.pending > 0 ? (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Cleared</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right font-mono">₹{commissionSummary.reduce((s, d) => s + d.total, 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600">₹{commissionSummary.reduce((s, d) => s + d.settled, 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">₹{commissionSummary.reduce((s, d) => s + d.pending, 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* =================== CLASS-WISE REPORT =================== */}
          <TabsContent value="classwise" className="mt-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-foreground">Class-wise Sales Analysis</h2>

              {/* Class-wise chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales by Class</CardTitle>
                  <CardDescription>Revenue generated from each class</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classWiseData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="class" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === "sales" ? `₹${value.toLocaleString("en-IN")}` : value,
                          name === "sales" ? "Sales" : "Students",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 20%, 90%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="sales" fill="hsl(211, 100%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Class-wise table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Class-wise Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="text-right">Total Sales</TableHead>
                        <TableHead className="text-right">Avg per Student</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classWiseData.map((cls) => (
                        <TableRow key={cls.class}>
                          <TableCell className="font-medium">Class {cls.class}</TableCell>
                          <TableCell className="text-right">{cls.students}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{cls.sales > 0 ? cls.sales.toLocaleString("en-IN", { minimumFractionDigits: 0 }) : "0"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{cls.students > 0 ? Math.round(cls.sales / cls.students).toLocaleString("en-IN") : "0"}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{classWiseData.reduce((s, c) => s + c.students, 0)}</TableCell>
                        <TableCell className="text-right font-mono">₹{classWiseData.reduce((s, c) => s + c.sales, 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">-</TableCell>
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
