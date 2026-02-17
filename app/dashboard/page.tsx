"use client"

import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  GraduationCap,
  Users,
  Package,
  Layers,
  Truck,
  ShoppingCart,
  Warehouse,
  Receipt,
  BarChart3,
  BadgePercent,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from "lucide-react"

const management = [
  {
    title: "Schools",
    description: "Manage school profiles and commissions",
    href: "/dashboard/schools",
    icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  {
    title: "Students",
    description: "Manage student database and assignments",
    href: "/dashboard/students",
    icon: Users,
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  {
    title: "Categories",
    description: "Manage product categories",
    href: "/dashboard/categories",
    icon: Layers,
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10",
    text: "text-pink-500",
  },
  {
    title: "Products",
    description: "Manage product inventory and pricing",
    href: "/dashboard/products",
    icon: Package,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
  },
  {
    title: "Suppliers",
    description: "Manage supplier information and contacts",
    href: "/dashboard/suppliers",
    icon: Truck,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
]

const operations = [
  {
    title: "Purchases",
    description: "Create and manage purchase orders",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-500/10",
    text: "text-teal-500",
  },
  {
    title: "Inventory",
    description: "View stock levels and valuation",
    href: "/dashboard/inventory", 
    icon: Warehouse,
    gradient: "from-amber-400 to-yellow-500",
    bg: "bg-amber-400/10",
    text: "text-amber-500",
  },
  {
    title: "Invoices (POS)",
    description: "Generate invoices and manage sales",
    href: "/dashboard/invoices",
    icon: Receipt,
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    text: "text-sky-500",
  },
]

const reports = [
  {
    title: "Commissions",
    description: "Track and settle school commissions",
    href: "/dashboard/commissions",
    icon: BadgePercent,
    gradient: "from-fuchsia-500 to-pink-600",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-500",
  },
  {
    title: "Dashboard",
    description: "View key performance indicators",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
    gradient: "from-primary to-primary/80",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  {
    title: "Reports",
    description: "Detailed analytics and charts",
    href: "/dashboard/reports",
    icon: BarChart3,
    gradient: "from-indigo-500 to-blue-600", 
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="flex flex-col gap-8 p-6 animate-in fade-in duration-500">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-lg">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-32 animate-pulse"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
             <div>
               <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
                 <Sparkles className="h-4 w-4" />
                 <span className="text-sm font-medium">{currentDate}</span>
               </div>
               <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome !</h1>
               <p className="text-primary-foreground/90 max-w-xl text-lg">
                 Manage your entire stationery business from one central hub. Select a module below to get started.
               </p>
             </div>
             
             {/* Quick Stats or Actions could go here, for now just a decorative visual or secondary info */}
           </div>
        </div>

        {/* Management Section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
             <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Management</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {management.map((item) => (
              <Link href={item.href} key={item.title} className="group outline-none">
                <Card className="h-full border-muted/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 overflow-hidden relative bg-card/50 backdrop-blur-sm">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div 
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner ${item.bg} ${item.text}`}
                    >
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">{item.description}</CardDescription>
                    <span className="flex items-center text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Open Module <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Operations Section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
             <div className="h-8 w-1 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full"></div>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Operations</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {operations.map((item) => (
              <Link href={item.href} key={item.title} className="group outline-none">
                <Card className="h-full border-muted/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 overflow-hidden relative bg-card/50 backdrop-blur-sm">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div 
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner ${item.bg} ${item.text}`}
                    >
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">{item.description}</CardDescription>
                    <span className="flex items-center text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Open Module <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Reports Section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
             <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-600 rounded-full"></div>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Reports</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {reports.map((item) => (
              <Link href={item.href} key={item.title} className="group outline-none">
                <Card className="h-full border-muted/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 overflow-hidden relative bg-card/50 backdrop-blur-sm">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div 
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner ${item.bg} ${item.text}`}
                    >
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">{item.description}</CardDescription>
                    <span className="flex items-center text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      View Insights <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
