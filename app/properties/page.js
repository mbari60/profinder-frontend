"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Bed, Bath, Ruler } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";
import PropertyBookingDialog from "./PropertyBookingDialog";

const ImageWithFallback = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount < 1 && !imgSrc.includes('placeholder')) {
      setImgSrc('/images/placeholder-property.jpg');
      setErrorCount(prev => prev + 1);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

const PropertyListingView = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, typesRes, countiesRes] = await Promise.all([
        api.get("/api/properties/"),
        api.get("/api/property-types/"),
        api.get("/api/counties/"),
      ]);
      setProperties(propertiesRes.data);
      setFilteredProperties(propertiesRes.data);
      setPropertyTypes(typesRes.data);
      setCounties(countiesRes.data);
    } catch (error) {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProperties();
  }, [searchTerm, selectedType, selectedCounty, minPrice, maxPrice, properties]);

  const filterProperties = () => {
    let results = [...properties];

    if (searchTerm) {
      results = results.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType && selectedType !== "all") {
      results = results.filter(
        (property) => property.property_type.toString() === selectedType
      );
    }

    if (selectedCounty && selectedCounty !== "all") {
      results = results.filter(
        (property) => property.county.toString() === selectedCounty
      );
    }

    if (minPrice) {
      results = results.filter(
        (property) => parseFloat(property.price) >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      results = results.filter(
        (property) => parseFloat(property.price) <= parseFloat(maxPrice)
      );
    }

    setFilteredProperties(results);
  };

  const handleBookVisit = (property) => {
    setSelectedProperty(property);
    setShowBookingDialog(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingDialog(false);
    setSelectedProperty(null);
    fetchData();
  };

  const getPropertyTypeName = (typeId) => {
    const type = propertyTypes.find((t) => t.id === typeId);
    return type ? type.name : "Unknown";
  };

  const getCountyName = (countyId) => {
    const county = counties.find((c) => c.id === countyId);
    return county ? county.name : "Unknown";
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    
    // If it's already a full URL, use it directly
    if (photoPath.startsWith("http")) return photoPath;
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Normalize the path
    let normalizedPath = photoPath
      .replace(/^\/+/, '')  // Remove leading slashes
      .replace(/^media\/+/, '')  // Remove leading media/
      .replace(/^property_photos\/+/, '');  // Remove leading property_photos/
    
    return `${backendUrl}/media/property_photos/${normalizedPath}`;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <Card className="sticky top-0 z-10">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Find Your Perfect Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search by title, description or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCounty}
              onValueChange={(value) => setSelectedCounty(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by county" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map((county) => (
                  <SelectItem key={county.id} value={county.id.toString()}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="Min price"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                placeholder="Max price"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredProperties.length} of {properties.length} properties
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-lg">No properties match your search criteria</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedCounty("all");
                setMinPrice("");
                setMaxPrice("");
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 relative">
                <div className="w-full h-48 relative rounded-t-lg overflow-hidden">
                  <ImageWithFallback
                    src={property.photo.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 capitalize"
                >
                  {property.status}
                </Badge>
                <Badge variant="default" className="absolute top-2 right-2">
                  KES {parseFloat(property.price).toLocaleString()}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg mb-2">{property.title}</CardTitle>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}, {getCountyName(property.county)}
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Home className="h-4 w-4 mr-1" />
                  {getPropertyTypeName(property.property_type)}
                </div>

                <p className="text-sm line-clamp-3 mb-4">
                  {property.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com?q=${property.location}`,
                      "_blank"
                    )
                  }
                >
                  View Map
                </Button>
                <Button size="sm" onClick={() => handleBookVisit(property)}>
                  Book Visit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyBookingDialog
          property={selectedProperty}
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default PropertyListingView;