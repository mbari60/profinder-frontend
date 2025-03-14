"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { formatDistance } from "date-fns";
// import api from "@/utils/api";
import api from "../../utils/api";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proposalTab, setProposalTab] = useState("pending");
  const [jobsLoading, setJobsLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  // Status badges styling
  const getJobStatusBadge = (status) => {
    const styles = {
      open: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getProposalStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const response = await api.get("/api/job-postings/");
        setJobs(response.data);
      } catch (err) {
        toast.error("Failed to load job postings. Please refresh the page.");
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch proposals when a job is selected
  const fetchProposals = async (jobId) => {
    if (!jobId) return;

    try {
      setProposalsLoading(true);
      const response = await api.get(`/api/job-proposals/?job=${jobId}`);
      setProposals(response.data);
    } catch (err) {
      toast.error("Failed to load proposals. Please try again.");
    } finally {
      setProposalsLoading(false);
    }
  };

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setProposalTab("pending"); // Reset to pending tab on new job selection
    fetchProposals(job.id);
  };

  // Update proposal status
  const updateProposalStatus = async (proposalId, newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/api/job-proposals/${proposalId}/`, {
        status: newStatus,
      });

      // Update local state
      setProposals(
        proposals.map((proposal) =>
          proposal.id === proposalId
            ? { ...proposal, status: newStatus }
            : proposal
        )
      );

      toast.success(
        `Proposal ${
          newStatus === "accepted" ? "accepted" : "rejected"
        } successfully.`
      );

      // If accepting a proposal, we might want to update the job status to 'in_progress'
      if (newStatus === "accepted" && selectedJob.status === "open") {
        await api.patch(`/api/job-postings/${selectedJob.id}/`, {
          status: "in_progress",
        });

        // Update local state for the job
        setSelectedJob({ ...selectedJob, status: "in_progress" });
        setJobs(
          jobs.map((job) =>
            job.id === selectedJob.id ? { ...job, status: "in_progress" } : job
          )
        );
      }
    } catch (err) {
      toast.error("Failed to update proposal status.");
    } finally {
      setLoading(false);
    }
  };

  // Render jobs table
  const renderJobsTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Service Category</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobsLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Loading jobs...
              </TableCell>
            </TableRow>
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No job postings found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow
                key={job.id}
                className={selectedJob?.id === job.id ? "bg-gray-100" : ""}
              >
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.service_category.name}</TableCell>
                <TableCell>
                  {job.budget
                    ? `KES ${job.budget.toLocaleString()}`
                    : "Not specified"}
                </TableCell>
                <TableCell>
                  {job.county.name}, {job.specific_area.name}
                </TableCell>
                <TableCell>
                  <Badge className={getJobStatusBadge(job.status)}>
                    {job.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(job.created_at), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJobSelect(job)}
                  >
                    View Proposals
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Render proposals for the selected job
  const renderProposals = () => {
    if (!selectedJob) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Select a job to view proposals</p>
        </div>
      );
    }

    // Filter proposals based on the selected tab
    const filteredProposals = proposals.filter(
      (proposal) => proposal.status === proposalTab
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Proposals for: {selectedJob.title}
          </h3>
          <Badge className={getJobStatusBadge(selectedJob.status)}>
            {selectedJob.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        <Tabs value={proposalTab} onValueChange={setProposalTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={proposalTab}>
            {proposalsLoading ? (
              <div className="text-center py-4">Loading proposals...</div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-4">
                No {proposalTab} proposals found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">
                            {proposal.provider_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {proposal.provider_email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {proposal.provider_phone}
                          </p>
                          <p className="mt-2">
                            <span className="font-medium">
                              Proposed Budget:
                            </span>{" "}
                            KES {proposal.proposed_budget.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted{" "}
                            {formatDistance(
                              new Date(proposal.created_at),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                        <div>
                          <div className="mb-2">
                            <span className="font-medium">Cover Letter:</span>
                          </div>
                          <div className="text-sm border p-2 rounded bg-gray-50 max-h-32 overflow-y-auto">
                            {proposal.cover_letter}
                          </div>
                        </div>
                      </div>

                      {proposalTab === "pending" && (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              updateProposalStatus(proposal.id, "rejected")
                            }
                            disabled={loading}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              updateProposalStatus(proposal.id, "accepted")
                            }
                            disabled={loading}
                          >
                            Accept
                          </Button>
                        </div>
                      )}

                      {proposalTab === "rejected" && (
                        <div className="flex justify-end mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateProposalStatus(proposal.id, "pending")
                            }
                            disabled={loading}
                          >
                            Move to Pending
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Job details dialog
  const JobDetailsDialog = () => {
    if (!selectedJob) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedJob.title}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2">Job Details</h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Category:</span>{" "}
                  {selectedJob.service_category.name}
                </p>
                <p>
                  <span className="font-medium">Budget:</span>{" "}
                  {selectedJob.budget
                    ? `KES ${selectedJob.budget.toLocaleString()}`
                    : "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {selectedJob.county.name}, {selectedJob.specific_area.name}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge className={getJobStatusBadge(selectedJob.status)}>
                    {selectedJob.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">Posted:</span>{" "}
                  {new Date(selectedJob.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Client Information</h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedJob.posted_by}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedJob.contact_email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedJob.contact_phone}
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Description</h4>
              <div className="border p-3 rounded bg-gray-50 max-h-64 overflow-y-auto">
                {selectedJob.description}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Management</h2>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Jobs section - 3/5 width on desktop */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Your Job Postings</CardTitle>
          </CardHeader>
          <CardContent>{renderJobsTable()}</CardContent>
        </Card>

        {/* Proposals section - 2/5 width on desktop */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Proposals</CardTitle>
            {selectedJob && <JobDetailsDialog />}
          </CardHeader>
          <CardContent>{renderProposals()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobManagement;
