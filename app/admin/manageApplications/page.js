"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import api from "@/utils/api";

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/applications/");
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = useCallback(
    async (id) => {
      try {
        await api.post(`/api/applications/${id}/approve/`);
        toast.success("Application approved successfully");
        fetchApplications();
      } catch (error) {
        toast.error("Failed to approve application");
      }
    },
    [fetchApplications]
  );

  const handleReject = useCallback(
    async (id) => {
      try {
        await api.post(`/api/applications/${id}/reject/`);
        toast.success("Application rejected successfully");
        fetchApplications();
      } catch (error) {
        toast.error("Failed to reject application");
      }
    },
    [fetchApplications]
  );

  const filteredApplications = useMemo(
    () =>
      applications.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [applications, searchQuery]
  );

  const applicationsByStatus = useMemo(() => {
    const result = {
      pending: [],
      approved: [],
      rejected: [],
    };

    filteredApplications.forEach((app) => {
      if (result[app.status]) {
        result[app.status].push(app);
      }
    });

    return result;
  }, [filteredApplications]);

  const ApplicationCard = React.memo(({ application, showActions = false }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-grow">
            <h3 className="font-semibold text-lg">{application.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Email: {application.email}</p>
              <p>Phone: {application.phone_number}</p>
              <p>
                Service:{" "}
                {application.services
                  ?.map((service) => service.name)
                  .join(", ")}
              </p>
              <p>
                Area: {application.specific_area?.name},{" "}
                {application.county?.name}
              </p>
              <p>Level: {application.professional_level}</p>
              <p className="text-gray-700 mt-2">{application.description}</p>
              {application.photo && (
                <img
                  src={application.photo}
                  alt="Application photo"
                  className="mt-2 rounded-lg max-w-xs"
                  loading="lazy"
                />
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2 md:flex-col">
              <Button
                onClick={() => handleApprove(application.id)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Check className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Approve</span>
              </Button>
              <Button
                onClick={() => handleReject(application.id)}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <X className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Reject</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  ));

  const TabContent = React.memo(({ status, showActions }) => {
    const apps = applicationsByStatus[status] || [];

    if (apps.length === 0) {
      return (
        <p className="text-center text-gray-500 py-8">No applications found</p>
      );
    }

    return (
      <div className="space-y-4">
        {apps.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            showActions={showActions}
          />
        ))}
      </div>
    );
  });

  if (loading && applications.length === 0) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Applications</h1>

      <div className="mb-6 relative">
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending
            {applicationsByStatus.pending.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {applicationsByStatus.pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <TabContent status="pending" showActions={true} />
        </TabsContent>

        <TabsContent value="approved">
          <TabContent status="approved" showActions={false} />
        </TabsContent>

        <TabsContent value="rejected">
          <TabContent status="rejected" showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageApplications;
