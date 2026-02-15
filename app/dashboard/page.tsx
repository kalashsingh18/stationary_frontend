"use client"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Receipt,
  GraduationCap,
  Package,
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
  LineChart,
  Line,
} from "recharts"
import { schools, products, invoices, commissions } from "@/lib/mock-data"

const salesData = [
  { month: "Sep", sales: 45000 },
  { month: "Oct", sales: 62000 },
  { month: "Nov", sales: 78000 },
  { month: "Dec", sales: 55000 },
  { month: "Jan", sales: 92000 },
  { month: "Feb", sales: 48000 },
]

const schoolSalesData = schools
  .filter((s) => s.status === "active")
  .map((s) => ({ name: s.name.split(" ")[0], sales: s.totalSales }))

const COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(158, 64%, 52%)",
  "hsl(30, 90%, 56%)",
  "hsl(340, 75%, 55%)",
  "hsl(270, 60%, 55%)",
]

const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel)
const pendingCommissions = commissions.filter((c) => c.status === "pending")
const totalPendingCommission = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

const todaySales = invoices
  .filter((i) => i.date === "2026-02-15")
  .reduce((sum, i) => sum + i.totalAmount, 0)

const monthSales = invoices.reduce((sum, i) => sum + i.totalAmount, 0)

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="flex flex-col gap-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={`₹${todaySales.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
            description="from today's invoices"
            icon={IndianRupee}
            trend={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Month's Sales"
            value={`₹${monthSales.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
            description="Feb 2026"
            icon={TrendingUp}
            trend={{ value: "8.2%", positive: true }}
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockProducts.length.toString()}
            description="items need restocking"
            icon={AlertTriangle}
          />
          <StatCard
            title="Pending Commissions"
            value={`₹${totalPendingCommission.toLocaleString("en-IN")}`}
            description={`${pendingCommissions.length} settlements pending`}
            icon={Receipt}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Sales Trend */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Sales Trend</CardTitle>
              <CardDescription>Monthly sales over last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Sales"]}
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

          {/* School-wise Sales Pie */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">School-wise Sales</CardTitle>
              <CardDescription>Sales distribution by school</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={schoolSalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="sales"
                    paddingAngle={4}
                  >
                    {schoolSalesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Sales"]}
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
                {schoolSalesData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                <CardDescription>Products at or below reorder level</CardDescription>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products are well stocked.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Reorder</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.currentStock}</TableCell>
                        <TableCell className="text-right">{product.reorderLevel}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.currentStock <= product.reorderLevel / 2 ? "destructive" : "secondary"}>
                            {product.currentStock <= product.reorderLevel / 2 ? "Critical" : "Low"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Invoices</CardTitle>
                <CardDescription>Latest sales transactions</CardDescription>
              </div>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.schoolName.split(" ").slice(0, 2).join(" ")}</TableCell>
                      <TableCell className="text-right font-medium">₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* School Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">School Overview</CardTitle>
              <CardDescription>Active schools and their performance</CardDescription>
            </div>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Commission %</TableHead>
                  <TableHead className="text-right">Commission Earned</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="text-right">{school.totalStudents}</TableCell>
                    <TableCell className="text-right">₹{school.totalSales.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">{school.commissionPercentage}%</TableCell>
                    <TableCell className="text-right">₹{school.commissionEarned.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={school.status === "active" ? "default" : "secondary"}>
                        {school.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
