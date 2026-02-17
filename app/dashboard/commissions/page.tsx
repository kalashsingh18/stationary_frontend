"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BadgePercent,
  IndianRupee,
  CheckCircle2,
  Clock,
  Search,
  MoreHorizontal,
  CreditCard,
  Eye,
  Download,
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
} from "recharts"
import type { Commission, School } from "@/lib/types" // Import School type
import { getCommissions, settleCommission } from "@/lib/api/commissions"
import { getSchools } from "@/lib/api/schools"
import { toast } from "sonner"

const COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(158, 64%, 52%)",
  "hsl(30, 90%, 56%)",
  "hsl(340, 75%, 55%)",
  "hsl(270, 60%, 55%)",
]

export default function CommissionsPage() {
  const [commissionsList, setCommissionsList] = useState<Commission[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [settlingCommission, setSettlingCommission] = useState<Commission | null>(null)
  const [viewingCommission, setViewingCommission] = useState<Commission | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [commissionsData, schoolsData] = await Promise.all([
        getCommissions(),
        getSchools()
      ])
      setCommissionsList(commissionsData)
      setSchools(schoolsData)
    } catch (error) {
      toast.error("Failed to fetch commissions data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const totalCommission = commissionsList.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingCommissions = commissionsList.filter((c) => c.status === "pending")
  const settledCommissions = commissionsList.filter((c) => c.status === "settled")
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const totalSettled = settledCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

  const months = [...new Set(commissionsList.map((c) => c.month))]

  const filteredCommissions = commissionsList.filter((c) => {
    const matchesSearch = c.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    const matchesMonth = monthFilter === "all" || c.month === monthFilter
    return matchesSearch && matchesStatus && matchesMonth
  })

  // Data for school-wise commission breakdown chart
  const schoolCommissionData = schools
    .filter((s) => s.status === "active")
    .map((s) => {
      const schoolCommissions = commissionsList.filter((c) => c.schoolId === s.id)
      const total = schoolCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
      return { name: s.name.split(" ")[0], total, rate: s.commissionPercentage }
    })
    .filter((s) => s.total > 0)

  // Data for monthly commission trend
  const monthlyTrend = months.map((month) => {
    const monthCommissions = commissionsList.filter((c) => c.month === month)
    const pending = monthCommissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    const settled = monthCommissions
      .filter((c) => c.status === "settled")
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    return { month: month.split(" ")[0].substring(0, 3), pending, settled }
  })

  async function handleSettleCommission(formData: FormData) {
    if (!settlingCommission) return
    const reference = formData.get("reference") as string
    const settledDate = formData.get("settledDate") as string
    
    try {
        await settleCommission(settlingCommission.id, {
            reference,
            settledDate
        })

        setCommissionsList((prev) =>
          prev.map((c) =>
            c.id === settlingCommission.id
              ? { ...c, status: "settled" as const, settledDate, reference }
              : c,
          ),
        )
        setSettleDialogOpen(false)
        setSettlingCommission(null)
        toast.success(`Commission for ${settlingCommission.schoolName} marked as settled`)
    } catch (error) {
        toast.error("Failed to settle commission")
    }
  }

  function openSettleDialog(commission: Commission) {
    setSettlingCommission(commission)
    setSettleDialogOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Commissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Commissions" },
        ]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Commission report exported")}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Commission"
            value={`₹${totalCommission.toLocaleString("en-IN")}`}
            description="All time"
            icon={BadgePercent}
          />
          <StatCard
            title="Pending Settlements"
            value={`₹${totalPending.toLocaleString("en-IN")}`}
            description={`${pendingCommissions.length} pending`}
            icon={Clock}
          />
          <StatCard
            title="Settled Amount"
            value={`₹${totalSettled.toLocaleString("en-IN")}`}
            description={`${settledCommissions.length} settlements`}
            icon={CheckCircle2}
          />
          <StatCard
            title="Avg. Commission Rate"
            value={`${(commissionsList.reduce((sum, c) => sum + c.commissionRate, 0) / commissionsList.length).toFixed(1)}%`}
            description="Across all schools"
            icon={IndianRupee}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Monthly Commission Breakdown</CardTitle>
              <CardDescription>Pending vs settled commission by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
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

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">School-wise Commission</CardTitle>
              <CardDescription>Commission distribution by school</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={schoolCommissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="total"
                    paddingAngle={4}
                  >
                    {schoolCommissionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Commission"]}
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
                {schoolCommissionData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {s.name} ({s.rate}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: All / Pending / Settled */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({commissionsList.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCommissions.length})</TabsTrigger>
              <TabsTrigger value="settled">Settled ({settledCommissions.length})</TabsTrigger>
            </TabsList>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {["all", "pending", "settled"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Total Sales</TableHead>
                        <TableHead className="text-right">Base Amount</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions
                        .filter((c) => tab === "all" || c.status === tab)
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No commission records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCommissions
                          .filter((c) => tab === "all" || c.status === tab)
                          .map((commission) => (
                            <TableRow key={commission.id}>
                              <TableCell className="font-medium">{commission.schoolName}</TableCell>
                              <TableCell className="text-muted-foreground">{commission.month}</TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                ₹{commission.totalSales.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                ₹{commission.baseAmount.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">{commission.commissionRate}%</TableCell>
                              <TableCell className="text-right font-medium font-mono">
                                ₹{commission.commissionAmount.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={commission.status === "settled" ? "default" : "secondary"}
                                  className={
                                    commission.status === "pending"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                  }
                                >
                                  {commission.status === "settled" ? (
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                  ) : (
                                    <Clock className="mr-1 h-3 w-3" />
                                  )}
                                  {commission.status}
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
                                    <DropdownMenuItem onClick={() => setViewingCommission(commission)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    {commission.status === "pending" && (
                                      <DropdownMenuItem onClick={() => openSettleDialog(commission)}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Mark as Settled
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
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Settle Commission Dialog */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form action={handleSettleCommission}>
            <DialogHeader>
              <DialogTitle>Settle Commission</DialogTitle>
              <DialogDescription>
                Mark commission as paid for {settlingCommission?.schoolName} - {settlingCommission?.month}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Base Amount</p>
                    <p className="font-medium font-mono">
                      ₹{settlingCommission?.baseAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="font-medium">{settlingCommission?.commissionRate}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Commission Amount</p>
                    <p className="text-xl font-bold text-foreground font-mono">
                      ₹{settlingCommission?.commissionAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="settledDate">Settlement Date</Label>
                <Input
                  id="settledDate"
                  name="settledDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reference">Payment Reference (UTR / Cheque No.)</Label>
                <Input
                  id="reference"
                  name="reference"
                  required
                  placeholder="e.g. UTR-98765432"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Settlement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Commission Details Dialog */}
      <Dialog open={!!viewingCommission} onOpenChange={() => setViewingCommission(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Commission Details</DialogTitle>
            <DialogDescription>
              {viewingCommission?.schoolName} - {viewingCommission?.month}
            </DialogDescription>
          </DialogHeader>
          {viewingCommission && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="font-medium font-mono">₹{viewingCommission.totalSales.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Amount (excl. GST)</p>
                  <p className="font-medium font-mono">₹{viewingCommission.baseAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="font-medium">{viewingCommission.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission Amount</p>
                  <p className="font-medium font-mono">₹{viewingCommission.commissionAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    className={
                      viewingCommission.status === "pending"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                    }
                  >
                    {viewingCommission.status === "settled" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {viewingCommission.status}
                  </Badge>
                </div>
                {viewingCommission.status === "settled" && (
                  <>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Settled Date</span>
                      <span className="text-sm font-medium">{viewingCommission.settledDate}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reference</span>
                      <span className="text-sm font-mono font-medium">{viewingCommission.reference}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Commission is calculated on the base amount (excluding GST) at {viewingCommission.commissionRate}%.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
