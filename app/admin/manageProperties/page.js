"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Home } from "lucide-react";
import api from "@/utils/api";

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProperty, setCurrentProperty] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    county: "",
    specific_area: "",
    property_type: "",
    status: "available",
    photo: null,
    tiktok_link: "",
    instagram_link: "",
    facebook_link: "",
    twitter_link: "",
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, countiesRes, typesRes] = await Promise.all([
        api.get("/api/properties/"),
        api.get("/api/counties/"),
        api.get("/api/property-types/"),
      ]);
      setProperties(propertiesRes.data);
      setCounties(countiesRes.data);
      setPropertyTypes(typesRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const fetchSpecificAreas = async (countyId) => {
    try {
      const response = await api.get(`/api/specific-areas/?county=${countyId}`);
      setSpecificAreas(response.data);
    } catch (error) {
      toast.error("Failed to fetch specific areas");
    }
  };

  const handleCountyChange = (countyId) => {
    setCurrentProperty({
      ...currentProperty,
      county: countyId,
      specific_area: "",
    });
    fetchSpecificAreas(countyId);
  };

  const handleInputChange = (field, value) => {
    setCurrentProperty({ ...currentProperty, [field]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setCurrentProperty({
      title: "",
      description: "",
      price: "",
      location: "",
      county: "",
      specific_area: "",
      property_type: "",
      status: "available",
      photo: null,
      tiktok_link: "",
      instagram_link: "",
      facebook_link: "",
      twitter_link: "",
    });
    setPhotoFile(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", currentProperty.title);
      formData.append("description", currentProperty.description);
      formData.append("price", currentProperty.price);
      formData.append("location", currentProperty.location);
      formData.append("county", currentProperty.county);
      formData.append("specific_area", currentProperty.specific_area);
      formData.append("property_type", currentProperty.property_type);
      formData.append("status", currentProperty.status);
      formData.append("tiktok_link", currentProperty.tiktok_link);
      formData.append("instagram_link", currentProperty.instagram_link);
      formData.append("facebook_link", currentProperty.facebook_link);
      formData.append("twitter_link", currentProperty.twitter_link);
      
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isEditing && currentProperty.id) {
        await api.patch(`/api/properties/${currentProperty.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Property updated successfully");
      } else {
        await api.post("/api/properties/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Property added successfully");
      }

      fetchData();
      resetForm();
    } catch (error) {
      toast.error("Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setCurrentProperty({
      ...property,
      county: property.county,
      specific_area: property.specific_area,
      property_type: property.property_type,
    });
    setIsEditing(true);
    fetchSpecificAreas(property.county);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/properties/${id}/`);
      setProperties(properties.filter((prop) => prop.id !== id));
      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error("Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Home className="h-5 w-5" /> Property Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Property Title"
                  value={currentProperty.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Price (KES)"
                  type="number"
                  value={currentProperty.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
            </div>

            <Textarea
              placeholder="Description"
              value={currentProperty.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Location"
                  value={currentProperty.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
              <div>
                <Select
                  value={currentProperty.county}
                  onValueChange={(value) => handleCountyChange(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select County" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={currentProperty.specific_area}
                  onValueChange={(value) => handleInputChange("specific_area", value)}
                  disabled={!currentProperty.county}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specific Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {specificAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={currentProperty.property_type}
                  onValueChange={(value) => handleInputChange("property_type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={currentProperty.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Facebook Link"
                value={currentProperty.facebook_link}
                onChange={(e) => handleInputChange("facebook_link", e.target.value)}
              />
              <Input
                placeholder="Instagram Link"
                value={currentProperty.instagram_link}
                onChange={(e) => handleInputChange("instagram_link", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Twitter Link"
                value={currentProperty.twitter_link}
                onChange={(e) => handleInputChange("twitter_link", e.target.value)}
              />
              <Input
                placeholder="TikTok Link"
                value={currentProperty.tiktok_link}
                onChange={(e) => handleInputChange("tiktok_link", e.target.value)}
              />
            </div>

            <CardFooter className="flex justify-end gap-2 px-0 pb-0">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {isEditing ? "Update Property" : "Add Property"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Properties List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => {
                const type = propertyTypes.find(t => t.id === property.property_type);
                return (
                  <TableRow key={property.id}>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{type?.name || "N/A"}</TableCell>
                    <TableCell>KES {property.price}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        property.status === "available" 
                          ? "bg-green-100 text-green-800" 
                          : property.status === "booked" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                      }`}>
                        {property.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(property)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(property.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyManagement;
