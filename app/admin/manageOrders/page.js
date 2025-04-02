"use client"

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, RefreshCw, Truck, CheckCircle, MoreVertical, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/utils/api";

const OrderManagement = () => {
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState({});
  const searchInputRef = useRef(null);

  // Status options
  const statusOptions = useMemo(() => [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "shipped", label: "Shipped", color: "bg-blue-500" },
    { value: "delivered", label: "Delivered", color: "bg-green-500" },
  ], []);

  // Fetch orders with error handling and cancellation
  const fetchOrders = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await api.get("/api/orders/", { params, signal });
      setOrders(response.data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.error || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Effect with cleanup
  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    
    return () => controller.abort();
  }, [fetchOrders]);

  // Update order status with optimistic UI updates
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    setIsUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      await api.post(`/api/orders/${orderId}/update_status/`, { status: newStatus });
      
      // Final update after confirmation
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update order status");
      // Revert optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: order.status } : order
      ));
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  }, []);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch = 
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm) ||
          order.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, searchTerm, statusFilter]);

  // Toggle order details expansion
  const toggleOrderExpansion = useCallback((orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId);
      return newSet;
    });
  }, []);

  // Status badge component
  const StatusBadge = useMemo(() => ({ status }) => {
    const option = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={`${option?.color || "bg-gray-500"} text-white`}>
        {option?.label || status}
      </Badge>
    );
  }, [statusOptions]);

  // Order row component
  const OrderRow = React.memo(({ order }) => {
    const isExpanded = expandedOrders.has(order.id);
    const isUpdating = isUpdatingStatus[order.id];
    
    return (
      <React.Fragment key={order.id}>
        <TableRow className="hover:bg-muted/50">
          <TableCell className="font-medium">#{order.id}</TableCell>
          <TableCell>{order.customer_name || "Anonymous"}</TableCell>
          <TableCell>
            <StatusBadge status={order.status} />
          </TableCell>
          <TableCell className="text-right">
            Ksh.{order.total_price}
          </TableCell>
          <TableCell className="text-right">
            {new Date(order.created_at).toLocaleDateString()}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleOrderExpansion(order.id)}
                aria-label={isExpanded ? "Collapse order" : "Expand order"}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isUpdating}>
                    {isUpdating ? <RefreshCw size={16} className="animate-spin" /> : <MoreVertical size={16} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {order.status !== "shipped" && (
                    <DropdownMenuItem
                      onClick={() => updateOrderStatus(order.id, "shipped")}
                      disabled={isUpdating}
                    >
                      <Truck size={16} className="mr-2" />
                      Mark as Shipped
                    </DropdownMenuItem>
                  )}
                  {order.status !== "delivered" && (
                    <DropdownMenuItem
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      disabled={isUpdating}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Mark as Delivered
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
        
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Email:</strong> {order.email || "N/A"}</p>
                      <p><strong>Phone:</strong> {order.phone_number || "N/A"}</p>
                      <p><strong>Address:</strong> {order.delivery_address || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity} × {item.product_name}</span>
                          <span>Ksh.{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  });

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                ref={searchInputRef}
                placeholder="Search orders by ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">
                    {statusOptions.find(opt => opt.value === statusFilter)?.label || "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  searchInputRef.current?.focus();
                }}
              >
                <X size={16} className="mr-2" />
                Clear
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fetchOrders()}
                disabled={loading}
              >
                <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm || statusFilter !== "all" ? (
                        <div className="space-y-2">
                          <p>No orders match your filters</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <p>No orders found</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderManagement;

