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
  Link as LinkIcon,
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

// Product form initial state
const initialProductState = {
  name: "",
  description: "",
  price: "",
  size: "",
  product_category: "",
  instagram_link: "",
  image: "",
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedTab, setSelectedTab] = useState("products");
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editingProductData, setEditingProductData] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({});

  // Fetch data from the backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/api/products/"),
        api.get("/api/product-categories/"),
      ]);
      setProducts(productsRes.data);
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

  // Category CRUD operations - memoized to prevent unnecessary re-creations
  const handleAddCategory = useCallback(async () => {
    if (!newCategory.name.trim()) return;

    try {
      await api.post("/api/product-categories/", newCategory);
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
        await api.put(`/api/product-categories/${id}/`, editingCategoryData);
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
        await api.delete(`/api/product-categories/${id}/`);
        fetchData();
      } catch (err) {
        setError("Failed to delete category. Please try again.");
      }
    },
    [fetchData]
  );

  // Product CRUD operations - memoized to prevent unnecessary re-creations
  const handleAddProduct = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate required fields
      if (
        !newProduct.name ||
        !newProduct.price ||
        !newProduct.product_category
      ) {
        setError("Please fill in all required fields.");
        return;
      }

      try {
        await api.post("/api/products/", newProduct);
        setNewProduct(initialProductState);
        fetchData();
      } catch (err) {
        setError("Failed to add product. Please try again.");
      }
    },
    [newProduct, fetchData]
  );

  const handleUpdateProduct = useCallback(
    async (id) => {
      try {
        await api.put(`/api/products/${id}/`, editingProductData);
        setEditingProduct(null);
        setEditingProductData({});
        fetchData();
      } catch (err) {
        setError("Failed to update product. Please try again.");
      }
    },
    [editingProductData, fetchData]
  );

  const handleDeleteProduct = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this product?"))
        return;

      try {
        await api.delete(`/api/products/${id}/`);
        fetchData();
      } catch (err) {
        setError("Failed to delete product. Please try again.");
      }
    },
    [fetchData]
  );

  // Filter products based on search - memoized to avoid recalculating on every render
  const filteredProducts = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return searchTerm
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTermLower) ||
            product.description.toLowerCase().includes(searchTermLower)
        )
      : products;
  }, [products, searchTerm]);

  // Memoize category lookup function to avoid recalculating on every render
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const getCategoryName = useCallback(
    (categoryId) => {
      return categoryMap[parseInt(categoryId)] || "Unknown Category";
    },
    [categoryMap]
  );

  // Activate edit mode for a product
  const activateEditMode = useCallback((product) => {
    setEditingProduct(product.id);
    setEditingProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      size: product.size,
      product_category: product.product_category,
      instagram_link: product.instagram_link,
      image: product.image,
    });
  }, []);

  // Handle product form input changes
  const handleProductInputChange = useCallback((e, field) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  // Handle editing product input changes
  const handleEditingProductChange = useCallback((e, field) => {
    setEditingProductData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  // Reset editing state
  const cancelEditing = useCallback(() => {
    setEditingProduct(null);
    setEditingProductData({});
  }, []);

  // ProductItem component for better code organization and reduced re-renders
  const ProductItem = useCallback(
    ({ product }) => (
      <Card key={product.id}>
        <CardContent className="p-4">
          {editingProduct === product.id ? (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={editingProductData.name || ""}
                  onChange={(e) => handleEditingProductChange(e, "name")}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={editingProductData.price || ""}
                  onChange={(e) => handleEditingProductChange(e, "price")}
                />
                <Select
                  value={editingProductData.product_category?.toString() || ""}
                  onValueChange={(value) =>
                    setEditingProductData((prev) => ({
                      ...prev,
                      product_category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Size (optional)"
                  value={editingProductData.size || ""}
                  onChange={(e) => handleEditingProductChange(e, "size")}
                />
                <Input
                  placeholder="Instagram link (optional)"
                  value={editingProductData.instagram_link || ""}
                  onChange={(e) =>
                    handleEditingProductChange(e, "instagram_link")
                  }
                />
                <Input
                  placeholder="Image URL"
                  value={editingProductData.image || ""}
                  onChange={(e) => handleEditingProductChange(e, "image")}
                />
              </div>
              <Textarea
                value={editingProductData.description || ""}
                onChange={(e) => handleEditingProductChange(e, "description")}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => handleUpdateProduct(product.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check size={16} />
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X size={16} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {getCategoryName(product.product_category)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ${parseFloat(product.price).toFixed(2)}
                  </p>
                  {product.size && (
                    <p className="text-sm text-gray-500">
                      Size: {product.size}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => activateEditMode(product)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex gap-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                    loading="lazy"
                  />
                )}
                {product.instagram_link && (
                  <a
                    href={product.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-pink-600 hover:text-pink-800"
                  >
                    <LinkIcon size={16} className="mr-1" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    ),
    [
      editingProduct,
      editingProductData,
      categories,
      handleEditingProductChange,
      handleUpdateProduct,
      cancelEditing,
      getCategoryName,
      activateEditMode,
      handleDeleteProduct,
    ]
  );

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Product Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Product name"
                        value={newProduct.name}
                        onChange={(e) => handleProductInputChange(e, "name")}
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) => handleProductInputChange(e, "price")}
                        required
                      />
                      <Select
                        value={newProduct.product_category}
                        onValueChange={(value) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            product_category: value,
                          }))
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Size (optional)"
                        value={newProduct.size}
                        onChange={(e) => handleProductInputChange(e, "size")}
                      />
                      <Input
                        placeholder="Instagram link (optional)"
                        value={newProduct.instagram_link}
                        onChange={(e) =>
                          handleProductInputChange(e, "instagram_link")
                        }
                      />
                      <Input
                        placeholder="Image URL"
                        value={newProduct.image}
                        onChange={(e) => handleProductInputChange(e, "image")}
                        required
                      />
                    </div>
                    <Textarea
                      placeholder="Product description"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleProductInputChange(e, "description")
                      }
                      required
                    />
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">No products found</div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductItem key={product.id} product={product} />
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
                <div className="text-center py-8">Loading...</div>
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
                              value={editingCategoryData.name || ""}
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
                                  products.filter(
                                    (p) => p.product_category === category.id
                                  ).length
                                }{" "}
                                products
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

export default ProductManagement;
