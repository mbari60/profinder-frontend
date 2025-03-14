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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
// import api from "@/utils/api";
import api from "../../utils/api";

import { debounce } from "lodash"; // For debouncing API calls

const ApplicationSubmission = React.memo(() => {
  const [newApplication, setNewApplication] = useState({
    name: "",
    email: "",
    phone_number: "",
    description: "",
    county: "",
    specific_area: "",
    services: [], // Keep as array for consistent format
    professional_level: "",
    photo: null,
  });
  const [counties, setCounties] = useState([]);
  const [specificAreas, setSpecificAreas] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countiesRes, servicesRes] = await Promise.all([
          api.get("/api/counties/"),
          api.get("/api/services/"),
        ]);
        setCounties(countiesRes.data);
        setServices(servicesRes.data);
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
    if (newApplication.county) {
      fetchSpecificAreas(newApplication.county);
    } else {
      setSpecificAreas([]);
    }
  }, [newApplication.county, fetchSpecificAreas]);

  // Validate form fields
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!newApplication.name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newApplication.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+254\d{9}$/;
    if (!phoneRegex.test(newApplication.phone_number)) {
      newErrors.phone_number =
        "Please enter a valid Kenyan phone number (+254XXXXXXXXX)";
    }

    if (!newApplication.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!newApplication.county) {
      newErrors.county = "Please select a county";
    }

    if (!newApplication.specific_area) {
      newErrors.specific_area = "Please select a specific area";
    }

    if (newApplication.services.length === 0) {
      newErrors.services = "Please select a service";
    }

    if (!newApplication.professional_level) {
      newErrors.professional_level = "Please select your professional level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newApplication]);

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
        const formData = new FormData();
        Object.entries(newApplication).forEach(([key, value]) => {
          if (key === "services") {
            value.forEach((service) => formData.append("services", service));
          } else if (key === "photo" && value) {
            formData.append("photo", value);
          } else {
            formData.append(key, value);
          }
        });

        await api.post("/api/applications/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Application submitted successfully!");

        // Reset form
        setNewApplication({
          name: "",
          email: "",
          phone_number: "",
          description: "",
          county: "",
          specific_area: "",
          services: [],
          professional_level: "",
          photo: null,
        });
        setErrors({});
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit application. Please try again.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [newApplication, validateForm, errors]
  );

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setNewApplication((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // Handle service selection
  const handleServiceSelect = useCallback((serviceId) => {
    setNewApplication((prev) => ({
      ...prev,
      services: [serviceId], // Keep as array with single item
    }));
    setErrors((prev) => ({ ...prev, services: "" }));
  }, []);

  // Memoized form fields to prevent unnecessary re-renders
  const renderFormFields = useMemo(() => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <Input
              placeholder="Full Name"
              value={newApplication.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={
                errors.name
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <Input
              placeholder="Email"
              type="email"
              value={newApplication.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={
                errors.email
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Input
              placeholder="Phone Number (+254XXXXXXXXX)"
              value={newApplication.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
              className={
                errors.phone_number
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
            />
            {errors.phone_number && (
              <span className="text-sm text-red-500">
                {errors.phone_number}
              </span>
            )}
          </div>

          {/* County */}
          <Select
            value={newApplication.county}
            onValueChange={(value) => {
              handleInputChange("county", value);
              handleInputChange("specific_area", ""); // Reset specific area
            }}
          >
            <SelectTrigger
              className={
                errors.county
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
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

          {/* Specific Area */}
          <Select
            value={newApplication.specific_area}
            onValueChange={(value) => handleInputChange("specific_area", value)}
            disabled={!newApplication.county}
          >
            <SelectTrigger
              className={
                errors.specific_area
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
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

          {/* Professional Level */}
          <Select
            value={newApplication.professional_level}
            onValueChange={(value) =>
              handleInputChange("professional_level", value)
            }
          >
            <SelectTrigger
              className={
                errors.professional_level
                  ? "border-red-500"
                  : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              }
            >
              <SelectValue placeholder="Select professional level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>

          {/* Services Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select a Service
            </label>
            <div className="space-y-2 border rounded p-2 dark:border-gray-600">
              {services.map((service) => (
                <div key={service.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`service-${service.id}`}
                    name="service"
                    checked={
                      newApplication.services[0] === service.id.toString()
                    }
                    onChange={() => handleServiceSelect(service.id.toString())}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="dark:text-gray-100"
                  >
                    {service.title}
                  </label>
                </div>
              ))}
            </div>
            {errors.services && (
              <span className="text-sm text-red-500">{errors.services}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            placeholder="Description"
            value={newApplication.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={
              errors.description
                ? "border-red-500"
                : "border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            }
          />
          {errors.description && (
            <span className="text-sm text-red-500">{errors.description}</span>
          )}
        </div>

        {/* Photo Upload */}
        <Input
          type="file"
          onChange={(e) => handleInputChange("photo", e.target.files[0])}
          accept="image/*"
          className="dark:text-gray-100"
        />
      </>
    );
  }, [
    newApplication,
    errors,
    counties,
    specificAreas,
    services,
    handleInputChange,
    handleServiceSelect,
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 dark:bg-gray-900 dark:text-gray-100">
      <Card className="border-blue-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-400">
            Submit Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderFormFields}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

ApplicationSubmission.displayName = "ApplicationSubmission";

export default ApplicationSubmission;
