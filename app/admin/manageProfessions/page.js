"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Link as LinkIcon,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Assuming you have an api service configured
import api from "@/utils/api";

const ServiceProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [counties, setCounties] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "+254",
    description: "",
    county: "",
    specific_area: "",
    twitter_link: "",
    tiktok_link: "",
    facebook_link: "",
    instagram_link: "",
    services: [],
    professional_level: "",
    is_verified: false,
    is_active: true,
  });

  // Fetch data from the backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [providersRes, servicesRes, countiesRes, areasRes] =
        await Promise.all([
          api.get("/api/service-providers/"),
          api.get("/api/services/"),
          api.get("/api/counties/"),
          api.get("/api/specific-areas/"),
        ]);
      setProviders(providersRes.data);
      setServices(servicesRes.data);
      setCounties(countiesRes.data);
      setAreas(areasRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "Could not load necessary data. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Replace the filtered areas useMemo with a useEffect that updates the existing state
  useEffect(() => {
    if (formData.county) {
      const countyId = parseInt(formData.county);
      setFilteredAreas(areas.filter((area) => area.county === countyId));
    } else {
      setFilteredAreas([]);
    }
  }, [formData.county, areas]);

  // Handle file selection for provider photo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous object URL to prevent memory leaks
      if (previewURL && previewURL.startsWith("blob:")) {
        URL.revokeObjectURL(previewURL);
      }
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  // Reset form data - improved with a single state update
  const resetForm = () => {
    // Clean up object URL when resetting
    if (previewURL && previewURL.startsWith("blob:")) {
      URL.revokeObjectURL(previewURL);
    }

    setFormData({
      name: "",
      email: "",
      phone_number: "+254",
      description: "",
      county: "",
      specific_area: "",
      twitter_link: "",
      tiktok_link: "",
      facebook_link: "",
      instagram_link: "",
      services: [],
      professional_level: "",
      is_verified: false,
      is_active: true,
    });

    setSelectedFile(null);
    setPreviewURL(null);
  };

  // Optimized form validation
  const validateForm = () => {
    const errors = [];

    // Validate at least one social link is present
    const hasSocialLink =
      formData.twitter_link ||
      formData.tiktok_link ||
      formData.facebook_link ||
      formData.instagram_link;

    if (!hasSocialLink) {
      errors.push("At least one social media link must be provided.");
    }

    // Validate phone number format
    if (
      !formData.phone_number.startsWith("+254") ||
      formData.phone_number.length !== 13
    ) {
      errors.push(
        "Phone number must start with +254 and be 13 characters long."
      );
    }

    // Validate services selection
    if (formData.services.length === 0) {
      errors.push("At least one service must be selected.");
    }

    // Display errors if any
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors[0], // Show first error
      });
      return false;
    }

    return true;
  };

  // Helper function to prepare FormData - reduces code duplication
  const prepareFormData = () => {
    const providerData = new FormData();

    // Add text fields
    providerData.append("name", formData.name);
    providerData.append("email", formData.email);
    providerData.append("phone_number", formData.phone_number);
    providerData.append("description", formData.description || "");

    // Convert numeric fields
    providerData.append("county", parseInt(formData.county));
    providerData.append("specific_area", parseInt(formData.specific_area));

    providerData.append("professional_level", formData.professional_level);
    providerData.append("facebook_link", formData.facebook_link || "");
    providerData.append("twitter_link", formData.twitter_link || "");
    providerData.append("instagram_link", formData.instagram_link || "");
    providerData.append("tiktok_link", formData.tiktok_link || "");

    // Handle boolean values
    providerData.append("is_active", formData.is_active);
    providerData.append("is_verified", formData.is_verified);

    // Handle services array correctly
    formData.services.forEach((serviceId) => {
      providerData.append("services", parseInt(serviceId));
    });

    // Add photo if selected
    if (selectedFile) {
      providerData.append("photo", selectedFile);
    }

    return providerData;
  };

  // Add new service provider - simplified
  const handleAddProvider = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const providerData = prepareFormData();

      await api.post("/api/service-providers/", providerData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Service provider added successfully",
      });

      resetForm();
      setIsAddDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error adding provider:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err.response?.data?.message ||
          "Failed to add service provider. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit service provider - simplified
  const handleEditProvider = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const formDataToSend = prepareFormData();

      await api.put(
        `/api/service-providers/${currentProvider.id}/`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast({
        title: "Success",
        description: "Service provider updated successfully",
      });

      resetForm();
      setIsEditDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error updating provider:", err);
      console.error("Backend Error:", err.response?.data);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err.response?.data?.message ||
          "Failed to update service provider. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete service provider - with confirmation optimized
  const handleDeleteProvider = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this service provider?")
    )
      return;

    try {
      setLoading(true);
      await api.delete(`/api/service-providers/${id}/`);
      toast({
        title: "Success",
        description: "Service provider deleted successfully",
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting provider:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service provider. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize edit form - memoized helper function
  const initializeEditForm = (provider) => {
    setCurrentProvider(provider);

    // Clean up previous object URL
    if (previewURL && previewURL.startsWith("blob:")) {
      URL.revokeObjectURL(previewURL);
    }

    setFormData({
      name: provider.name || "",
      email: provider.email || "",
      phone_number: provider.phone_number || "+254",
      description: provider.description || "",
      county: provider.county ? provider.county.toString() : "",
      specific_area: provider.specific_area
        ? provider.specific_area.toString()
        : "",
      twitter_link: provider.twitter_link || "",
      tiktok_link: provider.tiktok_link || "",
      facebook_link: provider.facebook_link || "",
      instagram_link: provider.instagram_link || "",
      services: provider.services || [],
      professional_level: provider.professional_level || "",
      is_verified: provider.is_verified || false,
      is_active: provider.is_active || true,
    });

    // Set preview URL if provider has photo
    setPreviewURL(provider.photo || null);
    setIsEditDialogOpen(true);
  };

  // Memoize filtered providers for better performance
  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    const term = searchTerm.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(term) ||
        provider.email.toLowerCase().includes(term) ||
        provider.phone_number.includes(searchTerm)
    );
  }, [providers, searchTerm]);

  // Memoized lookup functions for better performance
  const serviceNameMap = useMemo(() => {
    const map = {};
    services.forEach((service) => {
      map[service.id] = service.title;
    });
    return map;
  }, [services]);

  const countyNameMap = useMemo(() => {
    const map = {};
    counties.forEach((county) => {
      map[county.id] = county.name;
    });
    return map;
  }, [counties]);

  const areaNameMap = useMemo(() => {
    const map = {};
    areas.forEach((area) => {
      map[area.id] = area.name;
    });
    return map;
  }, [areas]);

  // Get service name by ID - using map for O(1) lookup
  const getServiceName = (serviceId) =>
    serviceNameMap[serviceId] || "Unknown Service";

  // Get county name by ID - using map for O(1) lookup
  const getCountyName = (countyId) =>
    countyNameMap[countyId] || "Unknown County";

  // Get area name by ID - using map for O(1) lookup
  const getAreaName = (areaId) => areaNameMap[areaId] || "Unknown Area";

  // Get initials for avatar - memoized for performance
  const getInitials = useCallback((name) => {
    if (!name) return "SP";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Service Provider Management
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search providers by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search size={40} className="mx-auto" />
              </div>
              {searchTerm ? (
                <p>No service providers match your search criteria</p>
              ) : (
                <p>No service providers found. Add your first provider!</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-20"></div>
                      <div className="absolute -bottom-10 left-4">
                        <Avatar className="h-16 w-16 border-4 border-white">
                          <AvatarImage src={provider.photo} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(provider.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/20 hover:bg-white/40"
                          onClick={() => initializeEditForm(provider)}
                        >
                          <Pencil size={16} className="text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/20 hover:bg-white/40"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 size={16} className="text-white" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-12 p-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold truncate">
                          {provider.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {provider.services.map((serviceId) => (
                            <Badge
                              key={serviceId}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getServiceName(serviceId)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-sm">
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Level:</span>
                          <span className="ml-2">
                            {provider.professional_level}
                          </span>
                        </p>
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Location:</span>
                          <span className="ml-2">
                            {getAreaName(provider.specific_area)},{" "}
                            {getCountyName(provider.county)}
                          </span>
                        </p>
                        <p className="flex items-center text-gray-500 truncate">
                          <span className="font-medium">Email:</span>
                          <span className="ml-2 truncate">
                            {provider.email}
                          </span>
                        </p>
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Phone:</span>
                          <span className="ml-2">{provider.phone_number}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {provider.facebook_link && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="h-8 w-8 rounded-full"
                          >
                            <a
                              href={provider.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Facebook size={16} />
                            </a>
                          </Button>
                        )}
                        {provider.twitter_link && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="h-8 w-8 rounded-full"
                          >
                            <a
                              href={provider.twitter_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter size={16} />
                            </a>
                          </Button>
                        )}
                        {provider.instagram_link && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="h-8 w-8 rounded-full"
                          >
                            <a
                              href={provider.instagram_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram size={16} />
                            </a>
                          </Button>
                        )}
                        {provider.tiktok_link && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="h-8 w-8 rounded-full"
                          >
                            <a
                              href={provider.tiktok_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.42 0 .83.09 1.2.26V9.67a6.31 6.31 0 0 0-1.2-.12A6.33 6.33 0 0 0 3.85 18a6.33 6.33 0 0 0 11-4.33V8.49a8.32 8.32 0 0 0 4.77 1.52v-3.32z" />
                              </svg>
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 justify-between">
                        <div className="flex items-center">
                          <Badge
                            variant={
                              provider.is_verified ? "success" : "outline"
                            }
                            className="text-xs"
                          >
                            {provider.is_verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Badge
                            variant={
                              provider.is_active ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {provider.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProvider} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Phone Number (Format: +254...)"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must start with +254 and be 13 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="level">Professional Level</Label>
                  <Select
                    value={formData.professional_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professional_level: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        county: value,
                        specific_area: "", // Reset area when county changes
                      });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem
                          key={county.id}
                          value={county.id.toString()}
                        >
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="area">Specific Area</Label>
                  <Select
                    value={formData.specific_area}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specific_area: value })
                    }
                    disabled={!formData.county}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.county
                            ? "Select area"
                            : "Select county first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo">Profile Photo</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                        {previewURL ? (
                          <img
                            src={previewURL}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="block">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("photo-upload").click()
                        }
                      >
                        Change
                      </Button>
                      <input
                        id="photo-upload"
                        name="photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Services</Label>
                  <div className="border rounded-md p-3 mt-1 max-h-32 overflow-y-auto">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                services: [...formData.services, service.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                services: formData.services.filter(
                                  (id) => id !== service.id
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    At least one service must be selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links</Label>
                  <p className="text-xs text-gray-500">
                    At least one social link is required
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Facebook size={18} className="text-blue-600" />
                      <Input
                        placeholder="Facebook URL"
                        value={formData.facebook_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facebook_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Twitter size={18} className="text-blue-400" />
                      <Input
                        placeholder="Twitter URL"
                        value={formData.twitter_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            twitter_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Instagram size={18} className="text-pink-600" />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.instagram_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instagram_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-black"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.42 0 .83.09 1.2.26V9.67a6.31 6.31 0 0 0-1.2-.12A6.33 6.33 0 0 0 3.85 18a6.33 6.33 0 0 0 11-4.33V8.49a8.32 8.32 0 0 0 4.77 1.52v-3.32z" />
                      </svg>
                      <Input
                        placeholder="TikTok URL"
                        value={formData.tiktok_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tiktok_link: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provider description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="h-20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Provider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProvider} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Phone Number (Format: +254...)"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must start with +254 and be 13 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="level">Professional Level</Label>
                  <Select
                    value={formData.professional_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professional_level: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        county: value,
                        specific_area: "", // Reset area when county changes
                      });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem
                          key={county.id}
                          value={county.id.toString()}
                        >
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="area">Specific Area</Label>
                  <Select
                    value={formData.specific_area}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specific_area: value })
                    }
                    disabled={!formData.county}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.county
                            ? "Select area"
                            : "Select county first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo">Profile Photo</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                        {previewURL ? (
                          <img
                            src={previewURL}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="block">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("photo-upload").click()
                        }
                      >
                        Change
                      </Button>
                      <input
                        id="photo-upload"
                        name="photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Services</Label>
                  <div className="border rounded-md p-3 mt-1 max-h-32 overflow-y-auto">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                services: [...formData.services, service.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                services: formData.services.filter(
                                  (id) => id !== service.id
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    At least one service must be selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links</Label>
                  <p className="text-xs text-gray-500">
                    At least one social link is required
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Facebook size={18} className="text-blue-600" />
                      <Input
                        placeholder="Facebook URL"
                        value={formData.facebook_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facebook_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Twitter size={18} className="text-blue-400" />
                      <Input
                        placeholder="Twitter URL"
                        value={formData.twitter_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            twitter_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Instagram size={18} className="text-pink-600" />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.instagram_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instagram_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-black"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.42 0 .83.09 1.2.26V9.67a6.31 6.31 0 0 0-1.2-.12A6.33 6.33 0 0 0 3.85 18a6.33 6.33 0 0 0 11-4.33V8.49a8.32 8.32 0 0 0 4.77 1.52v-3.32z" />
                      </svg>
                      <Input
                        placeholder="TikTok URL"
                        value={formData.tiktok_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tiktok_link: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provider description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="h-20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Provider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderManagement;
