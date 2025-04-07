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
import { MapPin, Home, Bed, Bath, Ruler, Maximize2, Instagram, Facebook, Twitter, Youtube, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";
import PropertyBookingDialog from "./PropertyBookingDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyImage = ({ src, alt, className, onClick }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount < 1 && !imgSrc.includes('placeholder')) {
      setImgSrc('/images/placeholder-property.jpg');
      setErrorCount(prev => prev + 1);
    }
  };

  return (
    <div className="relative w-full h-full group">
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
        onClick={onClick}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center cursor-pointer">
        <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

const SocialMediaLink = ({ url, icon: Icon, className = "" }) => {
  if (!url) return null;
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`text-muted-foreground hover:text-primary transition-colors ${className}`}
    >
      <Icon className="h-5 w-5" />
    </a>
  );
};

const PropertyListingView = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [viewedImage, setViewedImage] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [viewMode, setViewMode] = useState('details');
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, typesRes, countiesRes, areasRes] = await Promise.all([
        api.get("/api/properties/"),
        api.get("/api/property-types/"),
        api.get("/api/counties/"),
        api.get("/api/specific-areas/"),
      ]);
      
      const processedProperties = propertiesRes.data.map(property => ({
        ...property,
        photo: property.photo ? getImageUrl(property.photo) : '/images/placeholder-property.jpg',
        additionalPhotos: property.additional_photos?.map(photo => getImageUrl(photo)) || [],
        specificAreaName: getSpecificAreaName(property.specific_area),
        countyName: getCountyName(property.county)
      }));
      
      setProperties(processedProperties);
      setFilteredProperties(processedProperties);
      setPropertyTypes(typesRes.data);
      setCounties(countiesRes.data);
      setSpecificAreas(areasRes.data);
    } catch (error) {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '/images/placeholder-property.jpg';
    if (photoPath.startsWith("http")) return photoPath;
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    let normalizedPath = photoPath
      .replace(/^\/+/, '')
      .replace(/^media\/+/, '')
      .replace(/^property_photos\/+/, '');
    
    return `${backendUrl}/media/property_photos/${normalizedPath}`;
  };

  useEffect(() => {
    filterProperties();
  }, [searchTerm, selectedType, selectedCounty, selectedArea, minPrice, maxPrice, properties]);

  const filterProperties = () => {
    let results = [...properties];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (property) =>
          property.title.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower) ||
          property.specificAreaName.toLowerCase().includes(searchLower) ||
          property.countyName.toLowerCase().includes(searchLower)
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

    if (selectedArea && selectedArea !== "all") {
      results = results.filter(
        (property) => property.specific_area.toString() === selectedArea
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

  const getFilteredAreas = () => {
    if (selectedCounty === "all") return specificAreas;
    return specificAreas.filter(area => area.county.toString() === selectedCounty);
  };

  const handleBookVisit = (property) => {
    setSelectedProperty(property);
    setShowBookingDialog(true);
  };

  const handleViewProperty = (property, mode = 'details') => {
    setSelectedProperty(property);
    setViewedImage(property.photo);
    setViewMode(mode);
    setShowImageDialog(true);
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

  const getSpecificAreaName = (areaId) => {
    const area = specificAreas.find((a) => a.id === areaId);
    return area ? area.name : "Unknown Area";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCounty("all");
    setSelectedArea("all");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-20 bg-background pb-4 pt-2 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Find Your Perfect Property</h1>
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={() => setFilterModalOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
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
            onValueChange={(value) => {
              setSelectedCounty(value);
              setSelectedArea("all"); // Reset area when county changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="County" />
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

          <Select
            value={selectedArea}
            onValueChange={(value) => setSelectedArea(value)}
            disabled={selectedCounty === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {getFilteredAreas().map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredProperties.length} of {properties.length} properties
        </div>
        {(selectedType !== "all" || selectedCounty !== "all" || selectedArea !== "all" || minPrice || maxPrice) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-primary"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Mobile Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Properties</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">County</label>
              <Select
                value={selectedCounty}
                onValueChange={(value) => {
                  setSelectedCounty(value);
                  setSelectedArea("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Counties" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Area</label>
              <Select
                value={selectedArea}
                onValueChange={(value) => setSelectedArea(value)}
                disabled={selectedCounty === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {getFilteredAreas().map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Input
                  placeholder="Min"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex flex-col items-center justify-center space-y-4">
              <Search className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No properties found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
              <CardHeader className="p-0 relative">
                <div className="w-full h-48 relative cursor-pointer">
                  <PropertyImage
                    src={property.photo}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onClick={() => handleViewProperty(property, 'image')}
                  />
                </div>
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge
                    variant="secondary"
                    className="capitalize backdrop-blur-sm bg-white/30 dark:bg-black/30"
                  >
                    {property.status}
                  </Badge>
                  <Badge 
                    variant="default" 
                    className="backdrop-blur-sm bg-white/30 dark:bg-black/30"
                  >
                    KES {parseFloat(property.price).toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg mb-2 line-clamp-1">{property.title}</CardTitle>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {getSpecificAreaName(property.specific_area)}, {getCountyName(property.county)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Home className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{getPropertyTypeName(property.property_type)}</span>
                </div>

                <p className="text-sm line-clamp-3 mb-4">
                  {property.description}
                </p>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{property.size} sqft</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4 items-center">
                  <span className="text-sm text-muted-foreground">Social:</span>
                  <div className="flex gap-2">
                    <SocialMediaLink url={property.facebook_link} icon={Facebook} />
                    <SocialMediaLink url={property.instagram_link} icon={Instagram} />
                    <SocialMediaLink url={property.twitter_link} icon={Twitter} />
                    <SocialMediaLink url={property.tiktok_link} icon={Youtube} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProperty(property, 'details')}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleBookVisit(property)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Book Visit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Property Details Dialog */}
      {selectedProperty && (
        <>
          <PropertyBookingDialog
            property={selectedProperty}
            open={showBookingDialog}
            onOpenChange={setShowBookingDialog}
            onSuccess={handleBookingSuccess}
          />

          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {viewMode === 'image' ? (
                <>
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{selectedProperty.title}</DialogTitle>
                    <DialogDescription>
                      {getSpecificAreaName(selectedProperty.specific_area)}, {getCountyName(selectedProperty.county)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="w-full flex justify-center">
                    <img
                      src={viewedImage || '/images/placeholder-property.jpg'}
                      alt={selectedProperty.title}
                      className="max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                  {selectedProperty.additionalPhotos?.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 p-4 border-t">
                      <div
                        className={`relative h-20 cursor-pointer rounded-md overflow-hidden ${
                          viewedImage === selectedProperty.photo ? 'ring-2 ring-primary' : 'ring-1 ring-border'
                        }`}
                        onClick={() => setViewedImage(selectedProperty.photo)}
                      >
                        <img
                          src={selectedProperty.photo}
                          alt="Main property photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {selectedProperty.additionalPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className={`relative h-20 cursor-pointer rounded-md overflow-hidden ${
                            viewedImage === photo ? 'ring-2 ring-primary' : 'ring-1 ring-border'
                          }`}
                          onClick={() => setViewedImage(photo)}
                        >
                          <img
                            src={photo}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setViewMode('details')}
                    >
                      View Full Details
                    </Button>
                    <Button onClick={() => handleBookVisit(selectedProperty)}>
                      Book a Visit
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{selectedProperty.title}</DialogTitle>
                    <DialogDescription>
                      {getSpecificAreaName(selectedProperty.specific_area)}, {getCountyName(selectedProperty.county)}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="w-full h-64 relative rounded-lg overflow-hidden mb-4">
                    <PropertyImage
                      src={selectedProperty.photo}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setViewMode('image')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedProperty.description}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Property Type</h3>
                        <p className="text-sm text-muted-foreground">
                          {getPropertyTypeName(selectedProperty.property_type)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p className="text-sm text-muted-foreground">
                          {getSpecificAreaName(selectedProperty.specific_area)}, {getCountyName(selectedProperty.county)}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Social Media</h3>
                        <div className="flex gap-4 mt-2">
                          <SocialMediaLink 
                            url={selectedProperty.facebook_link} 
                            icon={Facebook} 
                            className="h-6 w-6" 
                          />
                          <SocialMediaLink 
                            url={selectedProperty.instagram_link} 
                            icon={Instagram} 
                            className="h-6 w-6" 
                          />
                          <SocialMediaLink 
                            url={selectedProperty.twitter_link} 
                            icon={Twitter} 
                            className="h-6 w-6" 
                          />
                          <SocialMediaLink 
                            url={selectedProperty.tiktok_link} 
                            icon={Youtube} 
                            className="h-6 w-6" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProperty.bedrooms && (
                          <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                            <Bed className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.bedrooms}</span>
                            <span className="text-xs text-muted-foreground">Beds</span>
                          </div>
                        )}
                        
                        {selectedProperty.bathrooms && (
                          <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                            <Bath className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.bathrooms}</span>
                            <span className="text-xs text-muted-foreground">Baths</span>
                          </div>
                        )}
                        
                        {selectedProperty.size && (
                          <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                            <Ruler className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.size}</span>
                            <span className="text-xs text-muted-foreground">sqft</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold">Price</h3>
                        <p className="text-2xl font-bold text-primary">
                          KES {parseFloat(selectedProperty.price).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold">Status</h3>
                        <Badge variant="secondary" className="capitalize mt-1">
                          {selectedProperty.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedProperty.additionalPhotos?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Gallery</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[selectedProperty.photo, ...selectedProperty.additionalPhotos].map((photo, index) => (
                          <div
                            key={index}
                            className="relative h-32 rounded-md overflow-hidden cursor-pointer"
                            onClick={() => {
                              setViewedImage(photo);
                              setViewMode('image');
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setViewMode('image')}
                    >
                      View Photos
                    </Button>
                    <Button onClick={() => handleBookVisit(selectedProperty)}>
                      Book Visit
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default PropertyListingView;
