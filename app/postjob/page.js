"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { debounce } from "lodash"; 

const JobPostingForm = React.memo(() => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    budget: "",
    county: "",
    specific_area: "",
    service_category: "",
    posted_by: "",
    contact_email: "",
    contact_phone: "",
  });

  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch initial data (counties and service categories)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countiesRes, categoriesRes] = await Promise.all([
          api.get("/api/counties/"),
          api.get("/api/service-categories/"),
        ]);
        setCounties(countiesRes.data);
        setServiceCategories(categoriesRes.data);
      } catch (err) {
        toast.error("Failed to load form data. Please refresh the page.");
      }
    };

    fetchData();
  }, []);

  // Debounced function to fetch specific areas when county changes
  const fetchSpecificAreas = useCallback(
    debounce(async (countyId) => {
      try {
        const response = await api.get(
          `/api/specific-areas/?county=${countyId}`
        );
        setSpecificAreas(response.data);
      } catch (err) {
        toast.error("Failed to load areas for selected county.");
        setSpecificAreas([]);
      }
    }, 300), // 300ms debounce delay
    []
  );

  // Fetch specific areas when county changes
  useEffect(() => {
    if (jobData.county) {
      fetchSpecificAreas(jobData.county);
    } else {
      setSpecificAreas([]);
    }
  }, [jobData.county, fetchSpecificAreas]);

  // Validate form fields
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!jobData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!jobData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (jobData.budget && isNaN(parseFloat(jobData.budget))) {
      newErrors.budget = "Budget must be a valid number";
    }

    if (!jobData.county) {
      newErrors.county = "Please select a county";
    }

    if (!jobData.specific_area) {
      newErrors.specific_area = "Please select a specific area";
    }

    if (!jobData.service_category) {
      newErrors.service_category = "Please select a service category";
    }

    if (!jobData.posted_by.trim()) {
      newErrors.posted_by = "Your name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(jobData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+254\d{9}$/;
    if (!phoneRegex.test(jobData.contact_phone)) {
      newErrors.contact_phone =
        "Please enter a valid Kenyan phone number (+254XXXXXXXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [jobData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }

      setLoading(true);

      try {
        const formattedData = {
          ...jobData,
          budget: jobData.budget ? parseFloat(jobData.budget) : null,
          status: "awaiting",
        };

        await api.post("/api/job-postings/", formattedData);

        toast.success("Job posted successfully!");

        // Reset form
        setJobData({
          title: "",
          description: "",
          budget: "",
          county: "",
          specific_area: "",
          service_category: "",
          posted_by: "",
          contact_email: "",
          contact_phone: "",
        });
        setErrors({});
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to post job. Please try again.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [jobData, validateForm, errors]
  );

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));

    // Reset specific area if county changes
    if (field === "county") {
      setJobData((prev) => ({ ...prev, specific_area: "" }));
    }
  }, []);

  // Memoized form fields to prevent unnecessary re-renders
  const renderFormFields = useMemo(() => {
    return (
      <>
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Job Title
          </label>
          <Input
            id="title"
            placeholder="Enter job title"
            value={jobData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <span className="text-sm text-red-500">{errors.title}</span>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Job Description
          </label>
          <Textarea
            id="description"
            placeholder="Provide detailed information about the job"
            value={jobData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={errors.description ? "border-red-500" : ""}
            rows={5}
          />
          {errors.description && (
            <span className="text-sm text-red-500">{errors.description}</span>
          )}
        </div>

        {/* Budget and Service Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1">
              Budget (KES)
            </label>
            <Input
              id="budget"
              placeholder="Enter your budget (optional)"
              value={jobData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              className={errors.budget ? "border-red-500" : ""}
              type="number"
              min="0"
              step="0.01"
            />
            {errors.budget && (
              <span className="text-sm text-red-500">{errors.budget}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="service_category"
              className="block text-sm font-medium mb-1"
            >
              Service Category
            </label>
            <Select
              value={jobData.service_category}
              onValueChange={(value) =>
                handleInputChange("service_category", value)
              }
            >
              <SelectTrigger
                id="service_category"
                className={errors.service_category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_category && (
              <span className="text-sm text-red-500">
                {errors.service_category}
              </span>
            )}
          </div>
        </div>

        {/* County and Specific Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="county" className="block text-sm font-medium mb-1">
              County
            </label>
            <Select
              value={jobData.county}
              onValueChange={(value) => handleInputChange("county", value)}
            >
              <SelectTrigger
                id="county"
                className={errors.county ? "border-red-500" : ""}
              >
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
            {errors.county && (
              <span className="text-sm text-red-500">{errors.county}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="specific_area"
              className="block text-sm font-medium mb-1"
            >
              Specific Area
            </label>
            <Select
              value={jobData.specific_area}
              onValueChange={(value) =>
                handleInputChange("specific_area", value)
              }
              disabled={!jobData.county}
            >
              <SelectTrigger
                id="specific_area"
                className={errors.specific_area ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select specific area" />
              </SelectTrigger>
              <SelectContent>
                {specificAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specific_area && (
              <span className="text-sm text-red-500">
                {errors.specific_area}
              </span>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-semibold mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="posted_by"
                className="block text-sm font-medium mb-1"
              >
                Your Name
              </label>
              <Input
                id="posted_by"
                placeholder="Enter your full name"
                value={jobData.posted_by}
                onChange={(e) => handleInputChange("posted_by", e.target.value)}
                className={errors.posted_by ? "border-red-500" : ""}
              />
              {errors.posted_by && (
                <span className="text-sm text-red-500">{errors.posted_by}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="contact_email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <Input
                id="contact_email"
                type="email"
                placeholder="Enter your email address"
                value={jobData.contact_email}
                onChange={(e) =>
                  handleInputChange("contact_email", e.target.value)
                }
                className={errors.contact_email ? "border-red-500" : ""}
              />
              {errors.contact_email && (
                <span className="text-sm text-red-500">
                  {errors.contact_email}
                </span>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="contact_phone"
                className="block text-sm font-medium mb-1"
              >
                Phone Number
              </label>
              <Input
                id="contact_phone"
                placeholder="Phone Number (+254XXXXXXXXX)"
                value={jobData.contact_phone}
                onChange={(e) =>
                  handleInputChange("contact_phone", e.target.value)
                }
                className={errors.contact_phone ? "border-red-500" : ""}
              />
              {errors.contact_phone && (
                <span className="text-sm text-red-500">
                  {errors.contact_phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }, [
    jobData,
    errors,
    counties,
    specificAreas,
    serviceCategories,
    handleInputChange,
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderFormFields}
            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Posting Job..." : "Post Job"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

JobPostingForm.displayName = "JobPostingForm";

export default JobPostingForm;
