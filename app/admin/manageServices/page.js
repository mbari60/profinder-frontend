"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Assuming you have an api service configured
import api from "@/utils/api";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [selectedTab, setSelectedTab] = useState("services");
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: "",
    service_category: "",
  });
  const [editingServiceData, setEditingServiceData] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({});

  // Fetch data from the backend - memoized with useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get("/api/services/"),
        api.get("/api/service-categories/"),
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Category CRUD operations - memoized with useCallback
  const handleAddCategory = useCallback(async () => {
    if (!newCategory.name.trim()) return;

    try {
      await api.post("/api/service-categories/", newCategory);
      setNewCategory({ name: "" });
      setShowAddCategory(false);
      fetchData();
    } catch (err) {
      setError("Failed to add category. Please try again.");
    }
  }, [newCategory, fetchData]);

  const handleUpdateCategory = useCallback(
    async (id) => {
      if (!editingCategoryData.name?.trim()) return;

      try {
        await api.put(`/api/service-categories/${id}/`, editingCategoryData);
        setEditingCategory(null);
        setEditingCategoryData({});
        fetchData();
      } catch (err) {
        setError("Failed to update category. Please try again.");
      }
    },
    [editingCategoryData, fetchData]
  );

  const handleDeleteCategory = useCallback(
    async (id) => {
      try {
        await api.delete(`/api/service-categories/${id}/`);
        fetchData();
      } catch (err) {
        setError("Failed to delete category. Please try again.");
      }
    },
    [fetchData]
  );

  // Service CRUD operations - memoized with useCallback
  const handleAddService = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newService.title.trim() || !newService.service_category) return;

      try {
        await api.post("/api/services/", newService);
        setNewService({
          title: "",
          description: "",
          price: "",
          service_category: "",
        });
        fetchData();
      } catch (err) {
        setError("Failed to add service. Please try again.");
      }
    },
    [newService, fetchData]
  );

  const handleUpdateService = useCallback(
    async (id) => {
      if (!editingServiceData.title?.trim()) return;

      try {
        await api.put(`/api/services/${id}/`, editingServiceData);
        setEditingService(null);
        setEditingServiceData({});
        fetchData();
      } catch (err) {
        setError("Failed to update service. Please try again.");
      }
    },
    [editingServiceData, fetchData]
  );

  const handleDeleteService = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this service?"))
        return;

      try {
        await api.delete(`/api/services/${id}/`);
        fetchData();
      } catch (err) {
        setError("Failed to delete service. Please try again.");
      }
    },
    [fetchData]
  );

  // Filter services based on search term - memoized with useMemo
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;

    const searchTermLower = searchTerm.toLowerCase();
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(searchTermLower) ||
        service.description.toLowerCase().includes(searchTermLower)
    );
  }, [services, searchTerm]);

  // Get category name by ID - memoized with useCallback
  const getCategoryName = useCallback(
    (categoryId) => {
      const category = categories.find((c) => c.id === parseInt(categoryId));
      return category ? category.name : "Unknown Category";
    },
    [categories]
  );

  // Activate edit mode for a service - memoized with useCallback
  const activateEditMode = useCallback((service) => {
    setEditingService(service.id);
    setEditingServiceData({
      title: service.title,
      description: service.description,
      price: service.price,
      service_category: service.service_category,
    });
  }, []);

  // Handle input change for new service - memoized with useCallback
  const handleNewServiceChange = useCallback((field, value) => {
    setNewService((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle input change for editing service - memoized with useCallback
  const handleEditServiceChange = useCallback((field, value) => {
    setEditingServiceData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Create memoized category items for select components
  const categoryItems = useMemo(
    () =>
      categories.map((category) => (
        <SelectItem key={category.id} value={category.id.toString()}>
          {category.name}
        </SelectItem>
      )),
    [categories]
  );

  // Create memoized components for better performance
  const ErrorAlert = useMemo(
    () =>
      error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ),
    [error]
  );

  const LoadingState = useMemo(
    () => <div className="text-center py-8">Loading...</div>,
    []
  );

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {ErrorAlert}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Service Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Service title"
                        value={newService.title}
                        onChange={(e) =>
                          handleNewServiceChange("title", e.target.value)
                        }
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={newService.price}
                        onChange={(e) =>
                          handleNewServiceChange("price", e.target.value)
                        }
                      />
                      <Select
                        value={newService.service_category}
                        onValueChange={(value) =>
                          handleNewServiceChange("service_category", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>{categoryItems}</SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Service description"
                      value={newService.description}
                      onChange={(e) =>
                        handleNewServiceChange("description", e.target.value)
                      }
                      required
                    />
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {loading ? (
                LoadingState
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8">No services found</div>
              ) : (
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        {editingService === service.id ? (
                          <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={editingServiceData.title}
                                onChange={(e) =>
                                  handleEditServiceChange(
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={editingServiceData.price}
                                onChange={(e) =>
                                  handleEditServiceChange(
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                              <Select
                                value={String(
                                  editingServiceData.service_category
                                )}
                                onValueChange={(value) =>
                                  handleEditServiceChange(
                                    "service_category",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>{categoryItems}</SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              value={editingServiceData.description}
                              onChange={(e) =>
                                handleEditServiceChange(
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => handleUpdateService(service.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Check size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingService(null);
                                  setEditingServiceData({});
                                }}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                  {service.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Category:{" "}
                                  {getCategoryName(service.service_category)}
                                </p>
                                {service.price && (
                                  <p className="text-sm text-gray-500">
                                    Price: $
                                    {parseFloat(service.price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => activateEditMode(service)}
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteService(service.id)
                                  }
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-600">
                              {service.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full"
                >
                  <FolderPlus className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </div>

              {loading ? (
                LoadingState
              ) : categories.length === 0 ? (
                <div className="text-center py-8">No categories found</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        {editingCategory === category.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editingCategoryData.name}
                              onChange={(e) =>
                                setEditingCategoryData((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Category name"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() =>
                                  handleUpdateCategory(category.id)
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Check size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(null);
                                  setEditingCategoryData({});
                                }}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-2">
                                {
                                  services.filter(
                                    (s) => s.service_category === category.id
                                  ).length
                                }{" "}
                                services
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(category.id);
                                  setEditingCategoryData({
                                    name: category.name,
                                  });
                                }}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Category name"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCategory(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManagement;
