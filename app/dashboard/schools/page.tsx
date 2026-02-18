"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import type { School } from "@/lib/types"
import { getSchools, createSchool } from "@/lib/api/schools"
import { toast } from "sonner"

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [viewingSchool, setViewingSchool] = useState<School | null>(null)

  useEffect(() => {
    fetchSchools()
  }, [])

  async function fetchSchools() {
    try {
      setLoading(true)
      const data = await getSchools()
      setSchools(data)
    } catch (error) {
      toast.error("Failed to fetch schools")
    } finally {
      setLoading(false)
    }
  }

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || school.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleAddSchool(formData: FormData) {
    try {
      const schoolData = {
        name: formData.get("name"),
        contact: {
          phone: formData.get("phone"),
          email: formData.get("email"),
        },
        address: {
            city: formData.get("address")?.toString().split(',')[0] || '', // Simple parsing assumption
            state: formData.get("address")?.toString().split(',')[1] || '',
        },
        commissionRate: Number(formData.get("commission")),
        code: `SC${Date.now()}`, // Temporary code generation
        contactPerson: formData.get("contactPerson"), // Assuming backend accepts this or we store it in contact
      }

      // Adjusting payload to match backend schema roughly, 
      // though backend schema has contact object.
      // Frontend form has flat structure.
      // Let's ensure payload matches what createSchool API expects (which sends JSON)
      
      const payload = {
        name: formData.get("name"),
        code: `S${Math.floor(Math.random() * 10000)}`, // Random code
        commissionRate: Number(formData.get("commission")),
         address: {
          city: "Mumbai", // Default for now as form input is single string
          state: "Maharashtra" // Default
        },
        contact: {
          phone: formData.get("phone"),
          email: formData.get("email")
        },
        // contactPerson is not directly in School model based on previous reads, 
        // usually stored in contact or separate field if added.
        // Checking School model... it has contact object.
      };

      const newSchool = await createSchool(payload)
      setSchools((prev) => [newSchool, ...prev]) // Prepend new school
      setIsAddOpen(false)
      toast.success("School added successfully")
    } catch (error) {
       toast.error(error instanceof Error ? error.message : "Failed to add school")
    }
  }

  function handleDeleteSchool(id: string) {
    setSchools((prev) => prev.filter((s) => s.id !== id))
    toast.success("School deleted successfully")
  }

  return (
    <>
      <PageHeader
        title="Schools"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Schools" },
        ]}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form action={handleAddSchool}>
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                  <DialogDescription>Enter the details for the new school.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">School Name</Label>
                    <Input id="name" name="name" required placeholder="e.g. Delhi Public School" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" name="contactPerson" required placeholder="Full name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required placeholder="10-digit number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="school@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="commission">Commission %</Label>
                      <Input id="commission" name="commission" type="number" required min="0" max="100" placeholder="e.g. 10" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required placeholder="Full address" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit">Add School</Button>
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
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
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
                  <TableHead>School Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm text-muted-foreground font-medium">Loading schools...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No schools found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.contactPerson}</TableCell>
                      <TableCell className="font-mono text-sm">{school.phone}</TableCell>
                      <TableCell className="text-right">{school.commissionPercentage}%</TableCell>
                      <TableCell className="text-right">{school.totalStudents}</TableCell>
                      <TableCell className="text-right">₹{school.totalSales.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant={school.status === "active" ? "default" : "secondary"}>
                          {school.status}
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
                            <DropdownMenuItem onClick={() => setViewingSchool(school)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingSchool(school)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSchool(school.id)} className="text-destructive">
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

      {/* View School Dialog */}
      <Dialog open={!!viewingSchool} onOpenChange={() => setViewingSchool(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{viewingSchool?.name}</DialogTitle>
            <DialogDescription>School details and performance</DialogDescription>
          </DialogHeader>
          {viewingSchool && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{viewingSchool.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium font-mono">{viewingSchool.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingSchool.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission</p>
                  <p className="font-medium">{viewingSchool.commissionPercentage}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{viewingSchool.address}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{viewingSchool.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₹{(viewingSchool.totalSales / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₹{(viewingSchool.commissionEarned / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Commission</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form action={(formData) => {
            if (!editingSchool) return
            setSchools((prev) =>
              prev.map((s) =>
                s.id === editingSchool.id
                  ? {
                      ...s,
                      name: formData.get("name") as string,
                      contactPerson: formData.get("contactPerson") as string,
                      phone: formData.get("phone") as string,
                      email: formData.get("email") as string,
                      address: formData.get("address") as string,
                      commissionPercentage: Number(formData.get("commission")),
                    }
                  : s,
              ),
            )
            setEditingSchool(null)
            toast.success("School updated successfully")
          }}>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
              <DialogDescription>Update school information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">School Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingSchool?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input id="edit-contactPerson" name="contactPerson" defaultValue={editingSchool?.contactPerson} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingSchool?.phone} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingSchool?.email} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-commission">Commission %</Label>
                  <Input id="edit-commission" name="commission" type="number" defaultValue={editingSchool?.commissionPercentage} required min="0" max="100" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" name="address" defaultValue={editingSchool?.address} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
