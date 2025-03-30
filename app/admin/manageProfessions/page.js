"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Facebook,
  Twitter,
  Instagram,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import api from "@/utils/api";

const ServiceProviderManagement = () => {
  // State management
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

  // Form data state
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

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [providersRes, servicesRes, countiesRes, areasRes] = await Promise.all([
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
      toast.error(err.response?.data?.message || "Could not load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter areas based on selected county
  useEffect(() => {
    if (formData.county) {
      const filtered = areas.filter(area => area.county.toString() === formData.county.toString());
      setFilteredAreas(filtered);
    } else {
      setFilteredAreas([]);
    }
  }, [formData.county, areas]);

  // Handle file selection for provider photo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous object URL to prevent memory leaks
      if (previewURL) URL.revokeObjectURL(previewURL);
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  // Reset form data
  const resetForm = () => {
    if (previewURL) URL.revokeObjectURL(previewURL);
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

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push("Name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push("Valid email is required");
    if (!/^\+254\d{9}$/.test(formData.phone_number)) errors.push("Phone must be +254 followed by 9 digits");
    if (!formData.county) errors.push("County is required");
    if (!formData.specific_area) errors.push("Specific area is required");
    if (formData.services.length === 0) errors.push("At least one service is required");
    if (!formData.professional_level) errors.push("Professional level is required");
    if (!formData.twitter_link && !formData.tiktok_link && !formData.facebook_link && !formData.instagram_link) {
      errors.push("At least one social link is required");
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }
    return true;
  };

  // Prepare FormData for submission
  const prepareFormData = () => {
    const formDataToSend = new FormData();
    
    // Append all fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'services') {
        value.forEach(serviceId => formDataToSend.append('services', serviceId));
      } else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });

    // Append photo if selected
    if (selectedFile) {
      formDataToSend.append('photo', selectedFile);
    }

    return formDataToSend;
  };

  // Handle provider creation
  const handleAddProvider = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formDataToSend = prepareFormData();

      await api.post("/api/service-providers/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Provider added successfully");
      resetForm();
      setIsAddDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add provider");
    } finally {
      setLoading(false);
    }
  };

  // Handle provider update
  const handleEditProvider = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formDataToSend = prepareFormData();

      await api.put(`/api/service-providers/${currentProvider.id}/`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Provider updated successfully");
      resetForm();
      setIsEditDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update provider");
    } finally {
      setLoading(false);
    }
  };

  // Handle provider deletion
  const handleDeleteProvider = async (id) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      setLoading(true);
      await api.delete(`/api/service-providers/${id}/`);
      toast.success("Provider deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete provider");
    } finally {
      setLoading(false);
    }
  };

  // Initialize edit form
  const initializeEditForm = (provider) => {
    setCurrentProvider(provider);
    if (previewURL) URL.revokeObjectURL(previewURL);

    setFormData({
      name: provider.name,
      email: provider.email,
      phone_number: provider.phone_number,
      description: provider.description,
      county: provider.county?.toString(),
      specific_area: provider.specific_area?.toString(),
      twitter_link: provider.twitter_link,
      tiktok_link: provider.tiktok_link,
      facebook_link: provider.facebook_link,
      instagram_link: provider.instagram_link,
      services: provider.services?.map(s => s.toString()) || [],
      professional_level: provider.professional_level,
      is_verified: provider.is_verified,
      is_active: provider.is_active,
    });

    setPreviewURL(provider.photo || null);
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  // Memoized filtered providers for performance
  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    const term = searchTerm.toLowerCase();
    return providers.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.email.toLowerCase().includes(term) ||
      p.phone_number.includes(searchTerm)
    );
  }, [providers, searchTerm]);

  // Get initials for avatar fallback
  const getInitials = useCallback((name) => {
    if (!name) return "SP";
    const names = name.split(" ");
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }, []);

  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.title : "Unknown Service";
  };

  // Get county name by ID
  const getCountyName = (countyId) => {
    const county = counties.find(c => c.id === countyId);
    return county ? county.name : "Unknown County";
  };

  // Get area name by ID
  const getAreaName = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : "Unknown Area";
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main card */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Service Provider Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading providers...</p>
            </div>
          ) : /* Empty state */ filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <Search size={40} className="mx-auto text-gray-400 mb-2" />
              <p>{searchTerm ? "No matching providers" : "No providers found"}</p>
            </div>
          ) : /* Provider cards */ (
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
                        <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/40"
                          onClick={() => initializeEditForm(provider)}>
                          <Pencil size={16} className="text-white" />
                        </Button>
                        <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/40"
                          onClick={() => handleDeleteProvider(provider.id)}>
                          <Trash2 size={16} className="text-white" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-12 p-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold truncate">{provider.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {provider.services.map(serviceId => (
                            <Badge key={serviceId} variant="secondary" className="text-xs">
                              {getServiceName(serviceId)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-sm">
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Level:</span>
                          <span className="ml-2">{provider.professional_level}</span>
                        </p>
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Location:</span>
                          <span className="ml-2">
                            {getAreaName(provider.specific_area)}, {getCountyName(provider.county)}
                          </span>
                        </p>
                        <p className="flex items-center text-gray-500 truncate">
                          <span className="font-medium">Email:</span>
                          <span className="ml-2 truncate">{provider.email}</span>
                        </p>
                        <p className="flex items-center text-gray-500">
                          <span className="font-medium">Phone:</span>
                          <span className="ml-2">{provider.phone_number}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {provider.facebook_link && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={provider.facebook_link} target="_blank" rel="noopener noreferrer">
                              <Facebook size={16} />
                            </a>
                          </Button>
                        )}
                        {provider.twitter_link && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={provider.twitter_link} target="_blank" rel="noopener noreferrer">
                              <Twitter size={16} />
                            </a>
                          </Button>
                        )}
                        {provider.instagram_link && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={provider.instagram_link} target="_blank" rel="noopener noreferrer">
                              <Instagram size={16} />
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 justify-between">
                        <Badge variant={provider.is_verified ? "success" : "outline"} className="text-xs">
                          {provider.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={provider.is_active ? "default" : "destructive"} className="text-xs">
                          {provider.is_active ? "Active" : "Inactive"}
                        </Badge>
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
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProvider} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label>Name*</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Email*</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Phone*</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +254XXXXXXXXX</p>
                </div>

                <div>
                  <Label>Professional Level*</Label>
                  <Select
                    value={formData.professional_level}
                    onValueChange={(value) => setFormData({...formData, professional_level: value})}
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
                  <Label>County*</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      county: value,
                      specific_area: ""
                    })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county.id} value={county.id.toString()}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Specific Area*</Label>
                  <Select
                    value={formData.specific_area}
                    onValueChange={(value) => setFormData({...formData, specific_area: value})}
                    disabled={!formData.county}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.county ? "Select area" : "Select county first"} />
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

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label>Profile Photo</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                        {previewURL ? (
                          <img src={previewURL} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="block">
                      <Button type="button" variant="outline" onClick={() => document.getElementById("photo-upload").click()}>
                        Change
                      </Button>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Services*</Label>
                  <div className="border rounded-md p-3 mt-1 max-h-32 overflow-y-auto">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id.toString())}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              services: checked
                                ? [...formData.services, service.id.toString()]
                                : formData.services.filter(id => id !== service.id.toString())
                            });
                          }}
                        />
                        <label htmlFor={`service-${service.id}`} className="text-sm font-medium">
                          {service.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links*</Label>
                  <p className="text-xs text-gray-500">At least one required</p>
                  
                  <div className="flex items-center space-x-2">
                    <Facebook size={18} className="text-blue-600" />
                    <Input
                      placeholder="Facebook URL"
                      value={formData.facebook_link}
                      onChange={(e) => setFormData({...formData, facebook_link: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Twitter size={18} className="text-blue-400" />
                    <Input
                      placeholder="Twitter URL"
                      value={formData.twitter_link}
                      onChange={(e) => setFormData({...formData, twitter_link: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Instagram size={18} className="text-pink-600" />
                    <Input
                      placeholder="Instagram URL"
                      value={formData.instagram_link}
                      onChange={(e) => setFormData({...formData, instagram_link: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="h-20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProvider} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label>Name*</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Email*</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Phone*</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +254XXXXXXXXX</p>
                </div>

                <div>
                  <Label>Professional Level*</Label>
                  <Select
                    value={formData.professional_level}
                    onValueChange={(value) => setFormData({...formData, professional_level: value})}
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
                  <Label>County*</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      county: value,
                      specific_area: ""
                    })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county.id} value={county.id.toString()}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Specific Area*</Label>
                  <Select
                    value={formData.specific_area}
                    onValueChange={(value) => setFormData({...formData, specific_area: value})}
                    disabled={!formData.county}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.county ? "Select area" : "Select county first"} />
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

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label>Profile Photo</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                        {previewURL ? (
                          <img src={previewURL} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="block">
                      <Button type="button" variant="outline" onClick={() => document.getElementById("edit-photo-upload").click()}>
                        Change
                      </Button>
                      <input
                        id="edit-photo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Services*</Label>
                  <div className="border rounded-md p-3 mt-1 max-h-32 overflow-y-auto">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`edit-service-${service.id}`}
                          checked={formData.services.includes(service.id.toString())}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              services: checked
                                ? [...formData.services, service.id.toString()]
                                : formData.services.filter(id => id !== service.id.toString())
                            });
                          }}
                        />
                        <label htmlFor={`edit-service-${service.id}`} className="text-sm font-medium">
                          {service.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links*</Label>
                  <p className="text-xs text-gray-500">At least one required</p>
                  
                  <div className="flex items-center space-x-2">
                    <Facebook size={18} className="text-blue-600" />
                    <Input
                      placeholder="Facebook URL"
                      value={formData.facebook_link}
                      onChange={(e) => setFormData({...formData, facebook_link: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Twitter size={18} className="text-blue-400" />
                    <Input
                      placeholder="Twitter URL"
                      value={formData.twitter_link}
                      onChange={(e) => setFormData({...formData, twitter_link: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Instagram size={18} className="text-pink-600" />
                    <Input
                      placeholder="Instagram URL"
                      value={formData.instagram_link}
                      onChange={(e) => setFormData({...formData, instagram_link: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="h-20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
