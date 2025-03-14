"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Star,
  Send,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  User,
  MapPin,
  Share2,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
// import api from "@/utils/api"; // Assuming you have this utility
import api from "../../utils/api";

// Import shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/recurent/StarRating";

const ServiceProviderPage = () => {
  // State management
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]); // Changed from serviceCategories to services
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all"); // Changed from selectedCategory to selectedService
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeProvider, setActiveProvider] = useState(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Professional levels
  const professionalLevels = ["Beginner", "Intermediate", "Expert", "Master"];

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    reviewer_name: "",
    service_provider: null,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch providers, services, counties, and specific areas on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          providersResponse,
          servicesResponse, // Changed from categoriesResponse to servicesResponse
          countiesResponse,
          areasResponse,
        ] = await Promise.all([
          api.get("/api/service-providers/"),
          api.get("/api/services/"), // Changed from /api/service-categories/ to /api/services/
          api.get("/api/counties/"),
          api.get("/api/specific-areas/"),
        ]);

        setProviders(providersResponse.data);
        setServices(servicesResponse.data); // Changed from setServiceCategories to setServices
        setCounties(countiesResponse.data);
        setSpecificAreas(areasResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load service providers");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch provider reviews when activeProvider changes
  useEffect(() => {
    if (!activeProvider) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await api.get(
          `/api/reviews/?service_provider=${activeProvider.id}&limit=5`
        );
        setReviews(response.data);

        // Initialize review form with the active provider ID
        setReviewForm((prev) => ({
          ...prev,
          service_provider: activeProvider.id,
        }));
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [activeProvider]);

  // Get filtered areas based on selected county
  const filteredAreas = specificAreas.filter(
    (area) =>
      selectedCounty === "all" || area.county.toString() === selectedCounty
  );

  // Filter providers based on search, service, county, specific area, and professional level
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.services &&
        provider.services.some(
          (service) =>
            service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) // Safely check for service.title
        ));

    const matchesService =
      selectedService === "all" ||
      (provider.services &&
        provider.services.some(
          (service) => service?.id?.toString() === selectedService // Safely check for service.id
        ));

    const matchesCounty =
      selectedCounty === "all" ||
      (provider.county && provider.county.toString() === selectedCounty);

    const matchesArea =
      selectedArea === "all" ||
      (provider.specific_area &&
        provider.specific_area.toString() === selectedArea);

    const matchesLevel =
      selectedLevel === "all" ||
      (provider.professional_level &&
        provider.professional_level.toLowerCase() ===
          selectedLevel.toLowerCase());

    return (
      matchesSearch &&
      matchesService &&
      matchesCounty &&
      matchesArea &&
      matchesLevel
    );
  });

  // Handle provider details modal
  const openProviderDetails = (provider) => {
    setActiveProvider(provider);
    setProviderModalOpen(true);
  };

  // Handle review form submission
  const submitReview = async () => {
    if (isSubmittingReview) return;

    if (!reviewForm.comment || !reviewForm.reviewer_name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await api.post("/api/reviews/", reviewForm);

      // Add the new review to the reviews list
      setReviews([response.data, ...reviews.slice(0, 4)]); // Keep only 5 reviews

      // Reset form
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
  };

  // Reset area when county changes
  useEffect(() => {
    setSelectedArea("all");
  }, [selectedCounty]);

  // Star rating component
  // const StarRating = ({ rating, size = 4, interactive = false, onChange }) => {
  //   return (
  //     <div className="flex items-center">
  //       {[1, 2, 3, 4, 5].map((star) => (
  //         <Star
  //           key={star}
  //           className={`h-${size} w-${size} ${
  //             interactive ? "cursor-pointer" : ""
  //           }`}
  //           fill={star <= rating ? "#FFD700" : "none"}
  //           stroke={star <= rating ? "#FFD700" : "#D1D5DB"}
  //           onClick={interactive ? () => onChange(star) : undefined}
  //         />
  //       ))}
  //     </div>
  //   );
  // };

  const getSocialLinks = (provider) => {
    const links = [];

    if (provider.instagram_link) {
      links.push({
        url: provider.instagram_link,
        icon: <Instagram className="h-4 w-4" />,
        name: "Instagram",
      });
    }

    if (provider.facebook_link) {
      links.push({
        url: provider.facebook_link,
        icon: <Facebook className="h-4 w-4" />,
        name: "Facebook",
      });
    }

    if (provider.twitter_link) {
      links.push({
        url: provider.twitter_link,
        icon: <Twitter className="h-4 w-4" />,
        name: "Twitter",
      });
    }

    if (provider.tiktok_link) {
      links.push({
        url: provider.tiktok_link,
        icon: <Share2 className="h-4 w-4" />,
        name: "TikTok",
      });
    }

    return links;
  };

  // Get location string
  // After loading all data in useEffect
  const getLocationString = (provider) => {
    if (provider.specific_area && provider.county) {
      // Find the specific area name from your loaded data
      const areaName =
        specificAreas.find((area) => area.id === provider.specific_area)
          ?.name || "Unknown Area";
      // Find the county name from your loaded data
      const countyName =
        counties.find((county) => county.id === provider.county)?.name ||
        "Unknown County";
      return `${areaName}, ${countyName}`;
    } else if (provider.county) {
      const countyName =
        counties.find((county) => county.id === provider.county)?.name ||
        "Unknown County";
      return countyName;
    } else {
      return "Location not specified";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with search */}
      <header className="bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Providers </h1>

          <div className="flex space-x-4 items-center">
            {/* Search input (hidden on mobile) */}
            <div className="relative hidden md:block w-64">
              <Input
                type="text"
                placeholder="Search providers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>

            {/* Filter button (mobile) */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setFilterModalOpen(true)}
              aria-label="Filter"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="container mx-auto px-4 py-3 md:hidden">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search providers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Desktop Filters */}
        <div className="mb-8 hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Filter by:</span>
              </div>

              {/* Service Filter */}
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="w-full md:w-40">
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

              {/* County Filter */}
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="w-full md:w-40">
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

              {/* Specific Area Filter */}
              <Select
                value={selectedArea}
                onValueChange={setSelectedArea}
                disabled={selectedCounty === "all"}
              >
                <SelectTrigger className="w-full md:w-40">
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

              {/* Professional Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-40">
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

          <Badge variant="outline" className="py-2 px-4">
            Showing {filteredProviders.length} of {providers.length} providers
          </Badge>
        </div>

        {/* Provider grid */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No service providers found. Try changing your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-56 bg-muted relative cursor-pointer">
                  {provider.photo ? (
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                      onClick={() => openProviderDetails(provider)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100"
                      onClick={() => openProviderDetails(provider)}
                    >
                      <User className="h-20 w-20 text-slate-300" />
                    </div>
                  )}

                  {provider.is_verified && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      Verified
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-medium truncate">
                    {provider.name}
                  </h3>

                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">
                      {getLocationString(provider)}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm mt-2 h-12 overflow-hidden">
                    {provider.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {provider.services &&
                      provider.services.slice(0, 3).map(
                        (service) =>
                          service?.title && (
                            <Badge
                              key={service.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {service.title}
                            </Badge>
                          )
                      )}
                    {provider.services && provider.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Level: {provider.professional_level || "Not specified"}
                    </span>
                    <div className="flex gap-1">
                      {getSocialLinks(provider)
                        .slice(0, 3)
                        .map((link, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(link.url, "_blank");
                            }}
                            title={link.name}
                          >
                            {link.icon}
                          </Button>
                        ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => openProviderDetails(provider)}
                    className="w-full mt-4"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Provider Details Modal */}
      <Dialog open={providerModalOpen} onOpenChange={setProviderModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {activeProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {activeProvider.name}
                  {activeProvider.is_verified && (
                    <Badge className="ml-2 bg-green-500 text-white">
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="pt-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                      <div className="bg-muted rounded-lg overflow-hidden mb-4">
                        {activeProvider.photo ? (
                          <img
                            src={activeProvider.photo}
                            alt={activeProvider.name}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square flex items-center justify-center text-muted-foreground bg-slate-100">
                            <User className="h-24 w-24 text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
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
                      </div>

                      <h4 className="font-medium mb-2">Social Media</h4>
                      <div className="flex flex-wrap gap-2">
                        {getSocialLinks(activeProvider).map((link, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => window.open(link.url, "_blank")}
                          >
                            {link.icon}
                            <span>{link.name}</span>
                          </Button>
                        ))}
                        {getSocialLinks(activeProvider).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No social media links provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-2/3">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">About</h3>
                          <p className="text-muted-foreground">
                            {activeProvider.description ||
                              "No description provided"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Professional Level
                          </h3>
                          <Badge variant="outline" className="px-3 py-1">
                            {activeProvider.professional_level ||
                              "Not specified"}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Services Offered
                          </h3>
                          {activeProvider.services &&
                          activeProvider.services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeProvider.services.map(
                                (service) =>
                                  service?.title && (
                                    <Card
                                      key={service.id}
                                      className="overflow-hidden"
                                    >
                                      <CardContent className="p-3">
                                        <h4 className="font-medium">
                                          {service.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                          {service.description ||
                                            "No description"}
                                        </p>
                                        {service.price && (
                                          <p className="mt-2 text-primary font-medium">
                                            Ksh.
                                            {parseFloat(
                                              service.price
                                            ).toLocaleString()}
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No services listed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-4 space-y-6">
                  {/* Review form */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Write a Review
                      </h3>
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
                        onClick={submitReview}
                        disabled={isSubmittingReview}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Reviews list */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Latest Reviews ({reviews.length})
                    </h3>

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
                                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                      {review.reviewer_name
                                        ?.charAt(0)
                                        .toUpperCase() || "A"}
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
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Service Providers</DialogTitle>
            <DialogDescription>
              Filter by service, location, professional level or search by name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="w-full">
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
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full">
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
