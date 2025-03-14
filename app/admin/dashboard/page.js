"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  Users,
  FileText,
  Package,
  Briefcase,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/dashboard-summary/");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Process data for the charts
  const applicationChartData = dashboardData
    ? [
        { name: "Approved", value: dashboardData.application_stats.approved },
        { name: "Rejected", value: dashboardData.application_stats.rejected },
        { name: "Pending", value: dashboardData.application_stats.pending },
      ]
    : [];

  const orderChartData = dashboardData
    ? [
        { name: "Pending", value: dashboardData.order_stats.pending },
        { name: "Shipped", value: dashboardData.order_stats.shipped },
        { name: "Delivered", value: dashboardData.order_stats.delivered },
      ]
    : [];

  const jobChartData = dashboardData
    ? [
        { name: "Open", value: dashboardData.job_stats.open },
        { name: "In Progress", value: dashboardData.job_stats.in_progress },
        { name: "Completed", value: dashboardData.job_stats.completed },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.visitor_stats.total_visits}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.visitor_stats.unique_visitors} unique visitors
            </p>
            <p className="text-xs text-muted-foreground">
              Avg.{" "}
              {Math.floor(
                dashboardData?.visitor_stats.avg_duration_seconds / 60
              )}{" "}
              min {dashboardData?.visitor_stats.avg_duration_seconds % 60} sec
              duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.application_stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.application_stats.approved} approved,{" "}
              {dashboardData?.application_stats.rejected} rejected
            </p>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.application_stats.pending} pending applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.order_stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.order_stats.pending} pending,{" "}
              {dashboardData?.order_stats.shipped} shipped
            </p>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.order_stats.delivered} orders delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.job_stats.open +
                dashboardData?.job_stats.in_progress +
                dashboardData?.job_stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.job_stats.open} open,{" "}
              {dashboardData?.job_stats.in_progress} in progress
            </p>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.job_stats.completed} jobs completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Summary Overview</CardTitle>
                <CardDescription>
                  A high-level view of all activity across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Visitors",
                          total: dashboardData?.visitor_stats.total_visits,
                          unique: dashboardData?.visitor_stats.unique_visitors,
                        },
                        {
                          name: "Applications",
                          approved: dashboardData?.application_stats.approved,
                          rejected: dashboardData?.application_stats.rejected,
                          pending: dashboardData?.application_stats.pending,
                        },
                        {
                          name: "Orders",
                          pending: dashboardData?.order_stats.pending,
                          shipped: dashboardData?.order_stats.shipped,
                          delivered: dashboardData?.order_stats.delivered,
                        },
                        {
                          name: "Jobs",
                          open: dashboardData?.job_stats.open,
                          in_progress: dashboardData?.job_stats.in_progress,
                          completed: dashboardData?.job_stats.completed,
                        },
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884d8" />
                      <Bar dataKey="unique" fill="#82ca9d" />
                      <Bar dataKey="approved" fill="#4CAF50" />
                      <Bar dataKey="rejected" fill="#F44336" />
                      <Bar dataKey="pending" fill="#FFC107" />
                      <Bar dataKey="shipped" fill="#2196F3" />
                      <Bar dataKey="delivered" fill="#9C27B0" />
                      <Bar dataKey="open" fill="#FF9800" />
                      <Bar dataKey="in_progress" fill="#607D8B" />
                      <Bar dataKey="completed" fill="#3F51B5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
                <CardDescription>
                  Most frequent search terms used on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.popular_searches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p>No search data available yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Search Term</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData?.popular_searches.map((search, index) => (
                        <TableRow key={index}>
                          <TableCell>{search.term}</TableCell>
                          <TableCell className="text-right">
                            {search.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitor Statistics</CardTitle>
                <CardDescription>
                  Details about site visitors and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Visits</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.visitor_stats.total_visits}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Unique Visitors</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.visitor_stats.unique_visitors}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Average Duration
                    </span>
                    <span className="text-lg font-bold">
                      {Math.floor(
                        dashboardData?.visitor_stats.avg_duration_seconds / 60
                      )}
                      m {dashboardData?.visitor_stats.avg_duration_seconds % 60}
                      s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-lg font-bold">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Application Statistics</CardTitle>
                <CardDescription>
                  Overview of all application statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={applicationChartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
                <CardDescription>
                  Current application status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Applications
                    </span>
                    <span className="text-lg font-bold">
                      {dashboardData?.application_stats.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardData?.application_stats.approved}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="text-lg font-bold text-red-600">
                      {dashboardData?.application_stats.rejected}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-lg font-bold text-amber-600">
                      {dashboardData?.application_stats.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.application_stats.total > 0
                        ? (
                            (dashboardData?.application_stats.approved /
                              dashboardData?.application_stats.total) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>
                  Overview of order fulfillment status
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderChartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#9C27B0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Current order status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Orders</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.order_stats.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-lg font-bold text-amber-600">
                      {dashboardData?.order_stats.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Shipped</span>
                    <span className="text-lg font-bold text-blue-600">
                      {dashboardData?.order_stats.shipped}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Delivered</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardData?.order_stats.delivered}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Delivery Rate</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.order_stats.total > 0
                        ? (
                            (dashboardData?.order_stats.delivered /
                              dashboardData?.order_stats.total) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
                <CardDescription>Overview of job statuses</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jobChartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
                <CardDescription>Current job status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Jobs</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.job_stats.open +
                        dashboardData?.job_stats.in_progress +
                        dashboardData?.job_stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Open</span>
                    <span className="text-lg font-bold text-amber-600">
                      {dashboardData?.job_stats.open}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-lg font-bold text-blue-600">
                      {dashboardData?.job_stats.in_progress}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardData?.job_stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.job_stats.open +
                        dashboardData?.job_stats.in_progress +
                        dashboardData?.job_stats.completed >
                      0
                        ? (
                            (dashboardData?.job_stats.completed /
                              (dashboardData?.job_stats.open +
                                dashboardData?.job_stats.in_progress +
                                dashboardData?.job_stats.completed)) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
