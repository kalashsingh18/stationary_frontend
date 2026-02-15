"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { suppliers as initialSuppliers } from "@/lib/mock-data"
import type { Supplier } from "@/lib/types"
import { toast } from "sonner"

export default function SuppliersPage() {
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(initialSuppliers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const filteredSuppliers = suppliersList.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleAddSupplier(formData: FormData) {
    const newSupplier: Supplier = {
      id: `sup${Date.now()}`,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      gstin: formData.get("gstin") as string,
      paymentTerms: formData.get("paymentTerms") as string,
      address: formData.get("address") as string,
    }
    setSuppliersList((prev) => [...prev, newSupplier])
    setIsAddOpen(false)
    toast.success("Supplier added successfully")
  }

  function handleDeleteSupplier(id: string) {
    setSuppliersList((prev) => prev.filter((s) => s.id !== id))
    toast.success("Supplier deleted successfully")
  }

  return (
    <>
      <PageHeader
        title="Suppliers"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Suppliers" },
        ]}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form action={handleAddSupplier}>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>Enter supplier details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Supplier Name</Label>
                    <Input id="name" name="name" required placeholder="Company name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required placeholder="10-digit number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input id="gstin" name="gstin" required placeholder="e.g. 07AAACN1234A1Z5" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <select name="paymentTerms" id="paymentTerms" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select</option>
                      <option value="COD">COD</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required placeholder="Full address" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Supplier</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell className="font-mono text-sm">{supplier.phone}</TableCell>
                      <TableCell className="font-mono text-sm">{supplier.gstin}</TableCell>
                      <TableCell>{supplier.paymentTerms}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{supplier.address}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="text-destructive">
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

      {/* Edit Supplier Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form action={(formData) => {
            if (!editingSupplier) return
            setSuppliersList((prev) =>
              prev.map((s) =>
                s.id === editingSupplier.id
                  ? {
                      ...s,
                      name: formData.get("name") as string,
                      phone: formData.get("phone") as string,
                      gstin: formData.get("gstin") as string,
                      paymentTerms: formData.get("paymentTerms") as string,
                      address: formData.get("address") as string,
                    }
                  : s,
              ),
            )
            setEditingSupplier(null)
            toast.success("Supplier updated successfully")
          }}>
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
              <DialogDescription>Update supplier information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Supplier Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingSupplier?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingSupplier?.phone} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gstin">GSTIN</Label>
                  <Input id="edit-gstin" name="gstin" defaultValue={editingSupplier?.gstin} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentTerms">Payment Terms</Label>
                <select name="paymentTerms" id="edit-paymentTerms" defaultValue={editingSupplier?.paymentTerms} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="COD">COD</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" name="address" defaultValue={editingSupplier?.address} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
