"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Share2,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { debounce } from "lodash";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/recurent/StarRating";
import { Skeleton } from "@/components/ui/skeleton";

const ServiceProviderPage = () => {
  // State management
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeProvider, setActiveProvider] = useState(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const professionalLevels = ["Beginner", "Intermediate", "Expert", "Master"];

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    reviewer_name: "",
    service_provider: null,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Enhanced data fetching with proper relationships
  const fetchData = async () => {
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
      setSpecificAreas(areasRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get filtered areas based on selected county
  const filteredAreas = specificAreas.filter(
    (area) => selectedCounty === "all" || area.county.toString() === selectedCounty
  );

  // Enhanced provider filtering with proper relationships
  const filteredProviders = providers.filter((provider) => {
    // Find service names for this provider
    const providerServiceNames = provider.services
      ?.map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        return service?.title || "";
      })
      .filter(name => name) || [];

    const matchesSearch =
      provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      providerServiceNames.some(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesService =
      selectedService === "all" ||
      (provider.services && provider.services.includes(parseInt(selectedService)));

    const matchesCounty =
      selectedCounty === "all" ||
      (provider.county && provider.county.toString() === selectedCounty);

    const matchesArea =
      selectedArea === "all" ||
      (provider.specific_area && provider.specific_area.toString() === selectedArea);

    const matchesLevel =
      selectedLevel === "all" ||
      (provider.professional_level &&
        provider.professional_level.toLowerCase() === selectedLevel.toLowerCase());

    return matchesSearch && matchesService && matchesCounty && matchesArea && matchesLevel;
  });

  // Enhanced location string with proper area names
  const getLocationString = (provider) => {
    if (!provider) return "Location not specified";
    
    const countyName = counties.find(c => c.id === provider.county)?.name || "Unknown County";
    const areaName = specificAreas.find(a => a.id === provider.specific_area)?.name || "Unknown Area";

    if (provider.specific_area && provider.county) {
      return `${areaName}, ${countyName}`;
    } else if (provider.county) {
      return countyName;
    }
    return "Location not specified";
  };

  // Enhanced service display for a provider
  const getProviderServices = (provider) => {
    if (!provider.services || !services.length) return [];
    return provider.services
      .map(serviceId => services.find(s => s.id === serviceId))
      .filter(service => service); // Remove undefined
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "SP";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Get social links
  const getSocialLinks = (provider) => {
    const links = [];
    if (provider.instagram_link) links.push({
      url: provider.instagram_link,
      icon: <Instagram className="h-4 w-4" />,
      name: "Instagram",
    });
    if (provider.facebook_link) links.push({
      url: provider.facebook_link,
      icon: <Facebook className="h-4 w-4" />,
      name: "Facebook",
    });
    if (provider.twitter_link) links.push({
      url: provider.twitter_link,
      icon: <Twitter className="h-4 w-4" />,
      name: "Twitter",
    });
    if (provider.tiktok_link) links.push({
      url: provider.tiktok_link,
      icon: <Share2 className="h-4 w-4" />,
      name: "TikTok",
    });
    return links;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with search */}
      <header className="bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">Service Providers</h1>
            
            <div className="flex w-full md:w-auto items-center gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Search providers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setFilterModalOpen(true)}
                aria-label="Filter"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Desktop Filters */}
        <Card className="mb-6 hidden md:block">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filters</span>
            </div>

            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedCounty}
              onValueChange={setSelectedCounty}
            >
              <SelectTrigger className="w-[180px]">
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

            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
              disabled={selectedCounty === "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {filteredAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {professionalLevels.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-6">
          <Badge variant="outline" className="py-2 px-4">
            Showing {filteredProviders.length} of {providers.length} providers
          </Badge>
        </div>

        {/* Provider grid */}
        {filteredProviders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                No service providers found. Try changing your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProviders.map((provider) => {
              const providerServices = getProviderServices(provider);
              return (
                <Card
                  key={provider.id}
                  className="hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(provider.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold truncate">
                          {provider.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {getLocationString(provider)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {provider.description || "No description provided"}
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1 mb-4">
                        {providerServices.slice(0, 3).map((service) => (
                          <Badge
                            key={service.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service.title}
                          </Badge>
                        ))}
                        {providerServices.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{providerServices.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline">
                          {provider.professional_level || "Not specified"}
                        </Badge>
                        {provider.is_verified && (
                          <Badge className="bg-green-500 text-white">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <Button
                        onClick={() => {
                          setActiveProvider(provider);
                          setProviderModalOpen(true);
                        }}
                        className="w-full"
                      >
                        View Profile <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Provider Details Modal */}
      <Dialog 
        open={providerModalOpen} 
        onOpenChange={setProviderModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {activeProvider && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials(activeProvider.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">
                      {activeProvider.name}
                    </DialogTitle>
                    {activeProvider.is_verified && (
                      <Badge className="bg-green-500 text-white mt-2">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="profile" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="profile" className="w-full">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="w-full">
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Contact Information</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {activeProvider.phone_number || "Not provided"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{activeProvider.email || "Not provided"}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                            <span>{getLocationString(activeProvider)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Social Media</h3>
                        </CardHeader>
                        <CardContent>
                          {getSocialLinks(activeProvider).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {getSocialLinks(activeProvider).map((link, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => window.open(link.url, "_blank")}
                                >
                                  {link.icon}
                                  <span>{link.name}</span>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              No social media links provided
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Professional Level</h3>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="text-base px-3 py-1">
                            {activeProvider.professional_level || "Not specified"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">About</h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {activeProvider.description ||
                              "No description provided"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Services Offered</h3>
                        </CardHeader>
                        <CardContent>
                          {getProviderServices(activeProvider).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {getProviderServices(activeProvider).map((service) => (
                                <Card key={service.id}>
                                  <CardContent className="p-4">
                                    <h4 className="font-medium">
                                      {service.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                      {service.description || "No description"}
                                    </p>
                                    {service.price && (
                                      <p className="mt-3 text-primary font-medium">
                                        Ksh. {parseFloat(service.price).toLocaleString()}
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No services listed
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold">Write a Review</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Rating
                            </label>
                            <StarRating
                              rating={reviewForm.rating}
                              size={6}
                              interactive={true}
                              onChange={(rating) =>
                                setReviewForm((prev) => ({ ...prev, rating }))
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Your Name
                            </label>
                            <Input
                              value={reviewForm.reviewer_name}
                              onChange={(e) =>
                                setReviewForm((prev) => ({
                                  ...prev,
                                  reviewer_name: e.target.value,
                                }))
                              }
                              placeholder="Enter your name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Review
                            </label>
                            <Textarea
                              value={reviewForm.comment}
                              onChange={(e) =>
                                setReviewForm((prev) => ({
                                  ...prev,
                                  comment: e.target.value,
                                }))
                              }
                              placeholder="Write your review here..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button
                          onClick={async () => {
                            if (!reviewForm.comment || !reviewForm.reviewer_name) {
                              toast.error("Please fill in all fields");
                              return;
                            }

                            setIsSubmittingReview(true);
                            try {
                              const response = await api.post("/api/reviews/", {
                                ...reviewForm,
                                service_provider: activeProvider.id,
                              });
                              setReviews([response.data, ...reviews.slice(0, 4)]);
                              setReviewForm({
                                rating: 5,
                                comment: "",
                                reviewer_name: "",
                                service_provider: activeProvider.id,
                              });
                              toast.success("Review submitted successfully");
                            } catch (error) {
                              console.error("Failed to submit review", error);
                              toast.error("Failed to submit review");
                            } finally {
                              setIsSubmittingReview(false);
                            }
                          }}
                          disabled={isSubmittingReview}
                        >
                          {isSubmittingReview ? (
                            "Submitting..."
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Review
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold">
                          Latest Reviews ({reviews.length})
                        </h3>
                      </CardHeader>
                      <CardContent>
                        {loadingReviews ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        ) : reviews.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">
                            No reviews yet. Be the first to review!
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <Card key={review.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-primary text-primary-foreground">
                                            {review.reviewer_name
                                              ?.charAt(0)
                                              .toUpperCase() || "A"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">
                                          {review.reviewer_name || "Anonymous"}
                                        </span>
                                      </div>
                                      <div className="mt-2">
                                        <StarRating rating={review.rating} />
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        review.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Separator className="my-3" />
                                  <p className="text-sm">{review.comment}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Providers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">County</label>
              <Select
                value={selectedCounty}
                onValueChange={setSelectedCounty}
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Specific Area
              </label>
              <Select
                value={selectedArea}
                onValueChange={setSelectedArea}
                disabled={selectedCounty === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {filteredAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Professional Level
              </label>
              <Select
                value={selectedLevel}
                onValueChange={setSelectedLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {professionalLevels.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderPage;
