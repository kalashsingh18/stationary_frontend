"use client"

import { useState, useRef } from "react"
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Upload, FileSpreadsheet } from "lucide-react"
import { students as initialStudents, schools, classOptions, sectionOptions } from "@/lib/mock-data"
import type { Student } from "@/lib/types"
import { toast } from "sonner"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState("")
  const [schoolFilter, setSchoolFilter] = useState<string>("all")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [uploadSchoolId, setUploadSchoolId] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSchool = schoolFilter === "all" || student.schoolId === schoolFilter
    const matchesClass = classFilter === "all" || student.class === classFilter
    return matchesSearch && matchesSchool && matchesClass
  })

  function handleAddStudent(formData: FormData) {
    const schoolId = formData.get("schoolId") as string
    const school = schools.find((s) => s.id === schoolId)
    const newStudent: Student = {
      id: `st${Date.now()}`,
      rollNumber: formData.get("rollNumber") as string,
      name: formData.get("name") as string,
      class: formData.get("class") as string,
      section: formData.get("section") as string,
      phone: (formData.get("phone") as string) || undefined,
      schoolId,
      schoolName: school?.name || "",
    }
    setStudents((prev) => [...prev, newStudent])
    setIsAddOpen(false)
    toast.success("Student added successfully")
  }

  function handleBulkUpload() {
    if (!uploadSchoolId || !uploadFile) {
      toast.error("Please select a school and upload a file")
      return
    }
    const school = schools.find((s) => s.id === uploadSchoolId)
    // Simulate bulk upload with mock data
    const mockUploaded: Student[] = [
      { id: `st${Date.now()}-1`, rollNumber: `${school?.name.substring(0, 2).toUpperCase()}-100`, name: "Uploaded Student 1", class: "5", section: "A", schoolId: uploadSchoolId, schoolName: school?.name || "" },
      { id: `st${Date.now()}-2`, rollNumber: `${school?.name.substring(0, 2).toUpperCase()}-101`, name: "Uploaded Student 2", class: "5", section: "B", schoolId: uploadSchoolId, schoolName: school?.name || "" },
      { id: `st${Date.now()}-3`, rollNumber: `${school?.name.substring(0, 2).toUpperCase()}-102`, name: "Uploaded Student 3", class: "6", section: "A", schoolId: uploadSchoolId, schoolName: school?.name || "" },
    ]
    setStudents((prev) => [...prev, ...mockUploaded])
    setIsUploadOpen(false)
    setUploadSchoolId("")
    setUploadFile(null)
    toast.success(`3 students uploaded successfully for ${school?.name}`)
  }

  function handleDeleteStudent(id: string) {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    toast.success("Student deleted successfully")
  }

  return (
    <>
      <PageHeader
        title="Students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Students</DialogTitle>
                  <DialogDescription>
                    Upload an Excel file with student data. Select the school first.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Select School</Label>
                    <Select value={uploadSchoolId} onValueChange={setUploadSchoolId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.filter((s) => s.status === "active").map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Excel File</Label>
                    <div
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      {uploadFile ? (
                        <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">.xlsx, .xls files supported</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-foreground mb-1">Expected Excel Format:</p>
                    <p className="text-xs text-muted-foreground">Roll Number | Student Name | Class | Section | Phone (optional)</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button onClick={handleBulkUpload}>Upload Students</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form action={handleAddStudent}>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>Enter student details.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="schoolId">School</Label>
                      <select name="schoolId" id="schoolId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select school</option>
                        {schools.filter((s) => s.status === "active").map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rollNumber">Roll Number</Label>
                        <Input id="rollNumber" name="rollNumber" required placeholder="e.g. DPS-001" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="studentName">Student Name</Label>
                        <Input id="studentName" name="name" required placeholder="Full name" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="class">Class</Label>
                        <select name="class" id="class" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <option value="">Select</option>
                          {classOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="section">Section</Label>
                        <select name="section" id="section" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <option value="">Select</option>
                          {sectionOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Student</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm font-medium">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.class}</Badge>
                      </TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell className="text-muted-foreground">{student.schoolName}</TableCell>
                      <TableCell className="font-mono text-sm">{student.phone || "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)} className="text-destructive">
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

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form action={(formData) => {
            if (!editingStudent) return
            setStudents((prev) =>
              prev.map((s) =>
                s.id === editingStudent.id
                  ? {
                      ...s,
                      rollNumber: formData.get("rollNumber") as string,
                      name: formData.get("name") as string,
                      class: formData.get("class") as string,
                      section: formData.get("section") as string,
                      phone: (formData.get("phone") as string) || undefined,
                    }
                  : s,
              ),
            )
            setEditingStudent(null)
            toast.success("Student updated successfully")
          }}>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-rollNumber">Roll Number</Label>
                  <Input id="edit-rollNumber" name="rollNumber" defaultValue={editingStudent?.rollNumber} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" name="name" defaultValue={editingStudent?.name} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-class">Class</Label>
                  <select name="class" id="edit-class" defaultValue={editingStudent?.class} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {classOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-section">Section</Label>
                  <select name="section" id="edit-section" defaultValue={editingStudent?.section} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {sectionOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingStudent?.phone} placeholder="Optional" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
