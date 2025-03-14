"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { formatDistance } from "date-fns";
import api from "@/utils/api";
import { debounce } from "lodash"; // For debouncing search input

const JobListings = React.memo(() => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposal, setProposal] = useState({
    provider_name: "",
    provider_email: "",
    provider_phone: "",
    cover_letter: "",
    proposed_budget: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [categories, setCategories] = useState([]);
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [jobsRes, categoriesRes, countiesRes, areasRes] =
          await Promise.all([
            api.get("/api/job-postings/?status=open"),
            api.get("/api/service-categories/"),
            api.get("/api/counties/"),
            api.get("/api/specific-areas/"),
          ]);
        setJobs(jobsRes.data);
        setCategories(categoriesRes.data);
        setCounties(countiesRes.data);
        setSpecificAreas(areasRes.data);
      } catch (err) {
        toast.error("Failed to load job listings. Please refresh the page.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Get location string based on county and specific area IDs
  const getLocationString = useCallback(
    (job) => {
      if (!job) return "Location not specified";

      // For county
      let countyName = "Unknown County";
      if (job.county) {
        if (typeof job.county === "object" && job.county?.name) {
          countyName = job.county.name;
        } else {
          const county = counties.find((c) => c.id == job.county);
          if (county) countyName = county.name;
        }
      }

      // For specific area
      let areaName = "";
      if (job.specific_area) {
        if (typeof job.specific_area === "object" && job.specific_area?.name) {
          areaName = job.specific_area.name;
        } else {
          const area = specificAreas.find((a) => a.id == job.specific_area);
          if (area) areaName = area.name;
        }
      }

      if (areaName) {
        return `${countyName}, ${areaName}`;
      }
      return countyName;
    },
    [counties, specificAreas]
  );

  // Apply filters
  const filterJobs = useMemo(() => {
    if (!jobs.length) return [];

    let filteredJobs = [...jobs];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filteredJobs = filteredJobs.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(term)) ||
          (job.description && job.description.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filteredJobs = filteredJobs.filter((job) => {
        if (typeof job.service_category === "object") {
          return job.service_category?.id?.toString() === selectedCategory;
        }
        return job.service_category?.toString() === selectedCategory;
      });
    }

    // Filter by county
    if (selectedCounty) {
      filteredJobs = filteredJobs.filter((job) => {
        if (typeof job.county === "object") {
          return job.county?.id?.toString() === selectedCounty;
        }
        return job.county?.toString() === selectedCounty;
      });
    }

    return filteredJobs;
  }, [jobs, searchTerm, selectedCategory, selectedCounty]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCounty("");
  }, []);

  // Validate proposal form
  const validateProposal = useCallback(() => {
    const newErrors = {};

    if (!proposal.provider_name.trim()) {
      newErrors.provider_name = "Your name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(proposal.provider_email)) {
      newErrors.provider_email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+254\d{9}$/;
    if (!phoneRegex.test(proposal.provider_phone)) {
      newErrors.provider_phone =
        "Please enter a valid Kenyan phone number (+254XXXXXXXXX)";
    }

    if (!proposal.cover_letter.trim()) {
      newErrors.cover_letter = "Cover letter is required";
    }

    if (
      !proposal.proposed_budget ||
      isNaN(parseFloat(proposal.proposed_budget)) ||
      parseFloat(proposal.proposed_budget) <= 0
    ) {
      newErrors.proposed_budget = "Please enter a valid budget amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [proposal]);

  // Handle proposal submission
  const handleProposalSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateProposal()) {
        return;
      }

      if (!selectedJob) {
        toast.error("No job selected. Please try again.");
        return;
      }

      setSubmitting(true);

      try {
        await api.post("/api/job-proposals/", {
          ...proposal,
          job: selectedJob.id,
          proposed_budget: parseFloat(proposal.proposed_budget),
          status: "pending",
        });

        toast.success("Proposal submitted successfully!");

        // Reset form and close modal
        setProposal({
          provider_name: "",
          provider_email: "",
          provider_phone: "",
          cover_letter: "",
          proposed_budget: "",
        });
        setErrors({});
        setSelectedJob(null);
      } catch (err) {
        console.error("Submission error:", err);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit proposal. Please try again.";
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
    [proposal, selectedJob, validateProposal]
  );

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setProposal((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // Status badge styling
  const getStatusBadge = useCallback((status) => {
    const styles = {
      open: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      completed:
        "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    };
    return (
      styles[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    );
  }, []);

  // Get category name
  const getCategoryName = useCallback(
    (job) => {
      if (!job) return "Not specified";

      if (
        typeof job.service_category === "object" &&
        job.service_category?.name
      ) {
        return job.service_category.name;
      }

      if (job.service_category) {
        const category = categories.find((c) => c.id == job.service_category);
        return category?.name || "Not specified";
      }

      return "Not specified";
    },
    [categories]
  );

  // Debounced search input
  const handleSearchChange = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-400">
        Available Job Opportunities
      </h1>

      {/* Filters */}
      <Card className="border-blue-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-700 dark:text-blue-400">
            Find Your Perfect Job
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Search Jobs
              </label>
              <Input
                placeholder="Search by title or description..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                County
              </label>
              <select
                className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
              >
                <option value="">All Counties</option>
                {counties.map((county) => (
                  <option key={county.id} value={county.id.toString()}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading job listings...</p>
          </div>
        ) : filterJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No job postings found matching your criteria.
            </p>
          </div>
        ) : (
          filterJobs.map((job) => (
            <Card
              key={job.id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
            >
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-400">
                          {job.title}
                        </h2>
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status?.replace("_", " ").toUpperCase() ||
                            "OPEN"}
                        </Badge>
                      </div>
                      <br />
                      <div className="mt-4">
                        <p className="line-clamp-3 text-gray-600 dark:text-gray-300">
                          {job.description}
                        </p>
                      </div>
                      <br />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-800 dark:text-blue-100">
                          {getCategoryName(job)}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          {getLocationString(job)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-700 dark:text-green-400 text-lg">
                        {job.budget
                          ? `KES ${job.budget.toLocaleString()}`
                          : "Budget: Not specified"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Posted{" "}
                        {formatDistance(new Date(job.created_at), new Date(), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center bg-gray-50 p-4 border-t dark:bg-gray-700">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedJob(job)}
                        className="bg-blue-600 hover:bg-blue-700 px-6 dark:bg-blue-800 dark:hover:bg-blue-900"
                      >
                        Apply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto dark:bg-gray-800 dark:text-gray-100">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-blue-800 dark:text-blue-400">
                          {job.title}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg dark:bg-gray-700">
                          <div>
                            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                              Category
                            </h3>
                            <p>{getCategoryName(job)}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                              Budget
                            </h3>
                            <p className="font-semibold text-green-700 dark:text-green-400">
                              {job.budget
                                ? `KES ${job.budget.toLocaleString()}`
                                : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                              Location
                            </h3>
                            <p>{getLocationString(job)}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                              Posted
                            </h3>
                            <p>
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Job Description
                          </h3>
                          <div className="p-4 border rounded bg-gray-50 whitespace-pre-line dark:bg-gray-700 dark:border-gray-600">
                            {job.description}
                          </div>
                        </div>

                        <div className="pt-4 border-t dark:border-gray-700">
                          <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-400">
                            Submit Your Proposal
                          </h3>
                          <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor="provider_name"
                                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                                >
                                  Your Name *
                                </label>
                                <Input
                                  id="provider_name"
                                  placeholder="Enter your full name"
                                  value={proposal.provider_name}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "provider_name",
                                      e.target.value
                                    )
                                  }
                                  className={
                                    errors.provider_name
                                      ? "border-red-500"
                                      : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                  }
                                />
                                {errors.provider_name && (
                                  <span className="text-sm text-red-500">
                                    {errors.provider_name}
                                  </span>
                                )}
                              </div>

                              <div>
                                <label
                                  htmlFor="provider_email"
                                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                                >
                                  Email *
                                </label>
                                <Input
                                  id="provider_email"
                                  type="email"
                                  placeholder="Enter your email address"
                                  value={proposal.provider_email}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "provider_email",
                                      e.target.value
                                    )
                                  }
                                  className={
                                    errors.provider_email
                                      ? "border-red-500"
                                      : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                  }
                                />
                                {errors.provider_email && (
                                  <span className="text-sm text-red-500">
                                    {errors.provider_email}
                                  </span>
                                )}
                              </div>

                              <div>
                                <label
                                  htmlFor="provider_phone"
                                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                                >
                                  Phone Number *
                                </label>
                                <Input
                                  id="provider_phone"
                                  placeholder="Phone Number (+254XXXXXXXXX)"
                                  value={proposal.provider_phone}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "provider_phone",
                                      e.target.value
                                    )
                                  }
                                  className={
                                    errors.provider_phone
                                      ? "border-red-500"
                                      : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                  }
                                />
                                {errors.provider_phone && (
                                  <span className="text-sm text-red-500">
                                    {errors.provider_phone}
                                  </span>
                                )}
                              </div>

                              <div>
                                <label
                                  htmlFor="proposed_budget"
                                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                                >
                                  Your Proposed Budget (KES) *
                                </label>
                                <Input
                                  id="proposed_budget"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter your proposed amount"
                                  value={proposal.proposed_budget}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "proposed_budget",
                                      e.target.value
                                    )
                                  }
                                  className={
                                    errors.proposed_budget
                                      ? "border-red-500"
                                      : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                  }
                                />
                                {errors.proposed_budget && (
                                  <span className="text-sm text-red-500">
                                    {errors.proposed_budget}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="cover_letter"
                                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                              >
                                Cover Letter *
                              </label>
                              <Textarea
                                id="cover_letter"
                                placeholder="Explain why you're the right person for this job"
                                value={proposal.cover_letter}
                                onChange={(e) =>
                                  handleInputChange(
                                    "cover_letter",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors.cover_letter
                                    ? "border-red-500"
                                    : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                }
                                rows={5}
                              />
                              {errors.cover_letter && (
                                <span className="text-sm text-red-500">
                                  {errors.cover_letter}
                                </span>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={handleProposalSubmit}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                        >
                          {submitting ? "Submitting..." : "Submit Proposal"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
});

JobListings.displayName = "JobListings";

export default JobListings;
