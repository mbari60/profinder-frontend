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
import { MapPin, Home, Bed, Bath, Ruler, Maximize2, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [viewedImage, setViewedImage] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [viewMode, setViewMode] = useState('details');
  const [specificAreas, setSpecificAreas] = useState([]);
  

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
        api.get("api/specific-areas/"),
      ]);
      
      // const processedProperties = propertiesRes.data.map(property => ({
      //   ...property,
      //   photo: property.photo ? getImageUrl(property.photo) : '/images/placeholder-property.jpg',
      //   additionalPhotos: property.additional_photos?.map(photo => getImageUrl(photo)) || []
      // }));

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
  }, [searchTerm, selectedType, selectedCounty, minPrice, maxPrice, properties]);

  const filterProperties = () => {
    let results = [...properties];

    // if (searchTerm) {
    //   results = results.filter(
    //     (property) =>
    //       property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //       property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //       property.location.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
    // }
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
                  {getSpecificAreaName(property.specific_area)}, {getCountyName(property.county)}
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Home className="h-4 w-4 mr-1" />
                  {getPropertyTypeName(property.property_type)}
                </div>

                <p className="text-sm line-clamp-3 mb-4">
                  {property.description}
                </p>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} beds
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} baths
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-1" />
                      {property.size} sqft
                    </div>
                  )}
                </div>

                {/* Social Media Links in Card */}
                <div className="flex gap-3 mt-4">
                  <p>View posts social media on</p>
                  <SocialMediaLink url={property.facebook_link} icon={Facebook} />
                  <SocialMediaLink url={property.instagram_link} icon={Instagram} />
                  <SocialMediaLink url={property.twitter_link} icon={Twitter} />
                  <SocialMediaLink url={property.tiktok_link} icon={Youtube} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProperty(property, 'details')}
                >
                  View Property
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
                  </DialogHeader>
                  <div className="w-full flex justify-center">
                    <img
                      src={viewedImage || '/images/placeholder-property.jpg'}
                      alt={selectedProperty.title}
                      className="max-h-[70vh] object-contain"
                    />
                  </div>
                  {selectedProperty.additionalPhotos?.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 p-4 border-t">
                      <div
                        className={`relative h-20 cursor-pointer ${viewedImage === selectedProperty.photo ? 'ring-2 ring-primary' : ''}`}
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
                          className={`relative h-20 cursor-pointer ${viewedImage === photo ? 'ring-2 ring-primary' : ''}`}
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
                  <Button 
                    className="mt-4"
                    onClick={() => setViewMode('details')}
                  >
                    View Full Property Details
                  </Button>
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

                      {/* Social Media Links in Details View */}
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
                          <div className="flex flex-col items-center">
                            <Bed className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.bedrooms}</span>
                            <span className="text-xs text-muted-foreground">Beds</span>
                          </div>
                        )}
                        
                        {selectedProperty.bathrooms && (
                          <div className="flex flex-col items-center">
                            <Bath className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.bathrooms}</span>
                            <span className="text-xs text-muted-foreground">Baths</span>
                          </div>
                        )}
                        
                        {selectedProperty.size && (
                          <div className="flex flex-col items-center">
                            <Ruler className="h-6 w-6 mb-1" />
                            <span className="text-sm font-medium">{selectedProperty.size}</span>
                            <span className="text-xs text-muted-foreground">sqft</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Price</h3>
                        <p className="text-lg font-bold text-primary">
                          KES {parseFloat(selectedProperty.price).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Status</h3>
                        <Badge variant="secondary" className="capitalize">
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
