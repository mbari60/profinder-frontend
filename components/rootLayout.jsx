"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser } from "@/app/context/userContext";
import {
  Menu,
  Home,
  ShoppingCart,
  MessageCircle,
  Bell,
  ListChecks,
  Package,
  Briefcase,
  UserPlus,
  Tags,
  Users,
  Settings,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SiteLayout = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Use the authentication context
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useUser();

  // Handle login button click
  const handleLoginClick = () => {
    router.push("/login");
  };

  // Handle logout button click
  const handleLogoutClick = () => {
    logout();
    router.push("/");
  };

  // This effect checks if we're trying to access admin routes while not logged in
  useEffect(() => {
    const handleRouteCheck = () => {
      // Get current path
      const path = window.location.pathname;

      // Check if trying to access admin routes without being logged in or not being admin
      if (path.startsWith("/admin/") && (!isAuthenticated() || !isAdmin())) {
        router.push("/login?returnUrl=" + encodeURIComponent(path));
      }
    };

    // Check on initial load
    handleRouteCheck();

    // This would need to be adapted to your routing system
    window.addEventListener("popstate", handleRouteCheck);

    return () => {
      window.removeEventListener("popstate", handleRouteCheck);
    };
  }, [isAuthenticated, isAdmin, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem>
                <Link href="/" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/products" className="flex items-center">
                  <Package className="mr-2 h-4 w-4" /> Shop Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" /> Find Professional
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/applications" className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" /> Become a ProFinder
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/postjob" className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" /> Post a Job
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/viewjobs" className="flex items-center">
                  <ListChecks className="mr-2 h-4 w-4" /> View Jobs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/flash-sales" className="flex items-center">
                  <Tags className="mr-2 h-4 w-4" /> Flash Sales
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/community" className="flex items-center">
                  <MessageCircle className="mr-2 h-4 w-4" /> Community Chat
                </Link>
              </DropdownMenuItem>

              {/* Only show login/account option in mobile menu */}
              {!isAuthenticated() ? (
                <DropdownMenuItem onClick={handleLoginClick}>
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                  </div>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/account" className="flex items-center">
                      <User className="mr-2 h-4 w-4" /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logo */}
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">ProFinder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <Link href="/services" className="px-4 py-2">
                  Services
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/products" className="px-4 py-2">
                  Shop
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/applications"
                  className="px-4 py-2 whitespace-nowrap"
                >
                  Become a ProFinder
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/postjob" className="px-4 py-2">
                  Post a Job
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/viewjobs" className="px-4 py-2">
                  View Jobs
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/properties" className="px-4 py-2">
                  House Hunting
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/chat" className="px-4 py-2">
                  Community Chat
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Icons */}
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* Admin Menu - Only visible to logged-in admins */}
            {isAuthenticated() && isAdmin() && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>
                    <Link href="/admin/manageProducts" className="flex w-full">
                      Manage Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageServices" className="flex w-full">
                      Manage Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageareas" className="flex w-full">
                      Manage Counties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/admin/manageApplications"
                      className="flex w-full"
                    >
                      Manage Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/admin/manageProfessions"
                      className="flex w-full"
                    >
                      Manage Profinders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageUsers" className="flex w-full">
                      Manage Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageBookings" className="flex w-full">
                      Manage Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageProperties" className="flex w-full">
                     Manage Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageTypes" className="flex w-full">
                      Manage Types
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/manageOrders" className="flex w-full">
                      Manage Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/dashboard" className="flex w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAuthenticated() && isSuperAdmin() && (<DropdownMenuItem>
                    <Link href="/admin/manageDeletes" className="flex w-full">
                      Manage Deletes
                    </Link>
                  </DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Login/Account Button */}
            {!isAuthenticated() ? (
              <Button
                onClick={handleLoginClick}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline"></span>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>
                    <Link href="/account" className="flex w-full">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default SiteLayout;
