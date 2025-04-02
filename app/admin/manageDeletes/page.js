"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2, CheckCircle, MapPin, ShoppingCart, 
         MessageSquare, Eye, Search, Briefcase, Home, ClipboardList, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'react-toastify';
import api from "@/utils/api";

const BulkDeleteManager = () => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const deleteActions = [
    { 
      id: "applications", 
      label: "Applications", 
      description: "Delete all service provider applications",
      icon: <ClipboardList className="h-4 w-4" />,
      endpoint: "delete_applications"
    },
    { 
      id: "service_providers", 
      label: "Service Providers", 
      description: "Delete all service provider profiles",
      icon: <Users className="h-4 w-4" />,
      endpoint: "delete_service_providers"
    },
    { 
      id: "services", 
      label: "Services", 
      description: "Delete all services",
      icon: <Briefcase className="h-4 w-4" />,
      endpoint: "delete_services"
    },
    { 
      id: "service_categories", 
      label: "Service Categories", 
      description: "Delete all service categories",
      icon: <Briefcase className="h-4 w-4" />,
      endpoint: "delete_service_categories"
    },
    { 
      id: "products", 
      label: "Products", 
      description: "Delete all products",
      icon: <ShoppingCart className="h-4 w-4" />,
      endpoint: "delete_products"
    },
    { 
      id: "product_categories", 
      label: "Product Categories", 
      description: "Delete all product categories",
      icon: <ShoppingCart className="h-4 w-4" />,
      endpoint: "delete_product_categories"
    },
    { 
      id: "locations", 
      label: "Locations", 
      description: "Delete all counties and specific areas",
      icon: <MapPin className="h-4 w-4" />,
      endpoint: "delete_locations"
    },
    { 
      id: "chats", 
      label: "Chat Messages", 
      description: "Delete all chat messages",
      icon: <MessageSquare className="h-4 w-4" />,
      endpoint: "delete_chats"
    },
    { 
      id: "visits", 
      label: "User Visits", 
      description: "Delete all user visit tracking data",
      icon: <Eye className="h-4 w-4" />,
      endpoint: "delete_visits"
    },
    { 
      id: "searches", 
      label: "Search Queries", 
      description: "Delete all search query history",
      icon: <Search className="h-4 w-4" />,
      endpoint: "delete_searches"
    },
    { 
      id: "orders", 
      label: "Orders", 
      description: "Delete all orders and order items",
      icon: <ShoppingCart className="h-4 w-4" />,
      endpoint: "delete_orders"
    },
    { 
      id: "reviews", 
      label: "Reviews", 
      description: "Delete all product and service reviews",
      icon: <MessageSquare className="h-4 w-4" />,
      endpoint: "delete_reviews"
    },
    { 
      id: "jobs", 
      label: "Jobs", 
      description: "Delete all job postings and proposals",
      icon: <Briefcase className="h-4 w-4" />,
      endpoint: "delete_jobs"
    },
    { 
      id: "properties", 
      label: "Properties", 
      description: "Delete all property listings and visits",
      icon: <Home className="h-4 w-4" />,
      endpoint: "delete_properties"
    },
    { 
      id: "all_except_users", 
      label: "EVERYTHING (Except Users)", 
      description: "Delete all data except user accounts",
      icon: <Trash2 className="h-4 w-4" />,
      endpoint: "delete_all_except_users",
      variant: "destructive"
    },
  ];

//   const handleDelete = async (endpoint) => {
//     if (!window.confirm("Are you absolutely sure you want to delete ALL records of this type? This action cannot be undone.")) {
//       return;
//     }

//     setLoading(endpoint);
//     setError(null);
//     setSuccess(null);

//     try {
//       const response = await api.post(`/api/bulk-delete/${endpoint}/`);
//       setSuccess(response.data.status);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to delete records");
//     } finally {
//       setLoading(null);
//     }
//   };
const handleDelete = async (endpoint) => {
    if (!window.confirm("Are you absolutely sure you want to delete ALL records of this type? This action cannot be undone.")) {
      return;
    }

    setLoading(endpoint);
    setError(null);
    setSuccess(null);

    const actionLabel = deleteActions.find(a => a.endpoint === endpoint)?.label;
    const toastId = toast.loading(`Deleting ${actionLabel}...`);

    try {
      const response = await api.post(`/api/bulk-delete/${endpoint}/`);
      toast.update(toastId, {
        render: response.data.status,
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
      setSuccess(response.data.status);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to delete records";
      toast.update(toastId, {
        render: errorMsg,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
      setError(errorMsg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Bulk Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              These actions will permanently delete ALL records of each type. 
              This cannot be undone. Use with extreme caution. User accounts will not be affected.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deleteActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={action.variant || "destructive"}
                  size="sm"
                  onClick={() => handleDelete(action.endpoint)}
                  disabled={loading === action.endpoint}
                  className="w-full"
                >
                  {loading === action.endpoint ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete All
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkDeleteManager;
