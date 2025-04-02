"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Search, Mail, Phone, Clock, CheckCircle, AlertCircle, Loader2, MapPin, Home, User, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import api from "@/utils/api";

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    awaiting: { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
    open: { color: "bg-blue-500", icon: <Clock className="h-3 w-3" /> },
    in_progress: { color: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    completed: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { color: "bg-red-500", icon: <AlertCircle className="h-3 w-3" /> },
    pending: { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
    accepted: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { color: "bg-red-500", icon: <X className="h-3 w-3" /> }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${statusConfig[status]?.color}`} />
      <span className="text-xs font-medium capitalize">
        {status.replace('_', ' ')}
      </span>
    </div>
  );
};

const JobCard = ({ job, isSelected, onClick }) => (
  <Card 
    className={`transition-all cursor-pointer hover:border-primary ${isSelected ? 'border-primary bg-primary/5' : ''}`}
    onClick={() => onClick(job)}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {job.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium line-clamp-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{job.posted_by}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>{job.service_category?.name || 'General'}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{job.specific_area?.name || job.county?.name || 'Remote'}</span>
            </Badge>
            {job.budget && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>KES {parseFloat(job.budget).toLocaleString()}</span>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <StatusIndicator status={job.status} />
          <span className="text-xs text-muted-foreground">
            {new Date(job.created_at).toLocaleDateString()}
          </span>
          <Badge variant="secondary" className="mt-1">
            {job.proposals_count || 0} proposals
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProposalCard = ({ proposal, onAccept, onReject }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

  return (
    <>
      <Card 
        className={`transition-all ${proposal.status === 'accepted' ? 'border-green-500/30 bg-green-500/5' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {proposal.provider_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{proposal.provider_name}</h3>
                  <StatusIndicator status={proposal.status} />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{proposal.provider_email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{proposal.provider_phone}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>KES {parseFloat(proposal.proposed_budget).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <h4 className="font-medium text-muted-foreground">Cover Letter</h4>
                  <p className="mt-1 text-foreground line-clamp-2">{proposal.cover_letter}</p>
                  {proposal.cover_letter.length > 200 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-primary mt-1"
                      onClick={() => setShowCoverLetterModal(true)}
                    >
                      View full cover letter
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {proposal.status === 'pending' && (
              <div className={`flex gap-2 md:flex-col transition-opacity ${isHovered ? 'opacity-100' : 'md:opacity-0'}`}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(proposal.id);
                  }}
                  variant="success"
                  size="sm"
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Accept</span>
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(proposal.id);
                  }}
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Cover Letter from {proposal.provider_name}</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCoverLetterModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {proposal.cover_letter.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowCoverLetterModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const JobDetailsPanel = ({ job, proposals, loading, onStatusChange, onAcceptProposal, onRejectProposal }) => {
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Home className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Select a Job</h3>
        <p className="text-muted-foreground max-w-md">
          Choose a job from the list to view details and manage applications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {job.title.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{job.title}</span>
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4">
                  <StatusIndicator status={job.status} />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardDescription>
            </div>
            
            <Select value={job.status} onValueChange={(value) => onStatusChange(job.id, value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awaiting">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <span>Awaiting</span>
                  </div>
                </SelectItem>
                <SelectItem value="open">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Open</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Cancelled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{job.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Home className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{job.service_category?.name || 'General'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {job.specific_area?.name || ''} {job.specific_area?.name && job.county?.name ? ',' : ''} {job.county?.name || 'Remote'}
                        </p>
                      </div>
                    </div>
                    
                    {job.budget && (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-medium">KES {parseFloat(job.budget).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Client Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Posted By</p>
                        <p className="font-medium">{job.posted_by}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{job.contact_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{job.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Proposals ({proposals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Proposals Yet</h3>
              <p className="text-muted-foreground max-w-md">
                This job hasn't received any proposals yet. Check back later.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Status distribution:</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>{proposals.filter(p => p.status === 'accepted').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>{proposals.filter(p => p.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>{proposals.filter(p => p.status === 'rejected').length}</span>
                  </div>
                </div>
              </div>
              
              <TabsContent value="all">
                <div className="space-y-3">
                  {proposals.map(proposal => (
                    <ProposalCard 
                      key={proposal.id} 
                      proposal={proposal} 
                      onAccept={onAcceptProposal}
                      onReject={onRejectProposal}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending">
                <div className="space-y-3">
                  {proposals
                    .filter(p => p.status === 'pending')
                    .map(proposal => (
                      <ProposalCard 
                        key={proposal.id} 
                        proposal={proposal} 
                        onAccept={onAcceptProposal}
                        onReject={onRejectProposal}
                      />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="accepted">
                <div className="space-y-3">
                  {proposals
                    .filter(p => p.status === 'accepted')
                    .map(proposal => (
                      <ProposalCard 
                        key={proposal.id} 
                        proposal={proposal} 
                        onAccept={onAcceptProposal}
                        onReject={onRejectProposal}
                      />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="rejected">
                <div className="space-y-3">
                  {proposals
                    .filter(p => p.status === 'rejected')
                    .map(proposal => (
                      <ProposalCard 
                        key={proposal.id} 
                        proposal={proposal} 
                        onAccept={onAcceptProposal}
                        onReject={onRejectProposal}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("awaiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const fetchJobs = useCallback(async (status = null, category = null) => {
    try {
      setLoading(true);
      let url = "/api/job-postings/";
      const params = new URLSearchParams();
      
      if (status) params.append("status", status);
      if (category && category !== "all") params.append("category", category);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      setJobs(response.data);
      
      if (!selectedJob && response.data.length > 0) {
        setSelectedJob(response.data[0]);
      } else if (selectedJob && !response.data.some(j => j.id === selectedJob.id)) {
        setSelectedJob(response.data[0] || null);
      }
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [selectedJob]);

  const fetchProposals = useCallback(async (jobId = null) => {
    if (!jobId) return;
    
    try {
      setProposalsLoading(true);
      const response = await api.get(`/api/job-proposals/?job=${jobId}`);
      setProposals(response.data);
    } catch (error) {
      toast.error("Failed to fetch proposals");
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/api/service-categories/");
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeTab, selectedCategory);
    fetchCategories();
  }, [activeTab, selectedCategory, fetchJobs, fetchCategories]);

  useEffect(() => {
    if (selectedJob) {
      fetchProposals(selectedJob.id);
    }
  }, [selectedJob, fetchProposals]);

  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      const response = await api.patch(`/api/job-postings/${jobId}/update_status/`, {
        status: newStatus
      });
      
      toast.success(`Job status updated to ${newStatus}`);
      
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
      if (selectedJob?.id === jobId) {
        setSelectedJob({ ...selectedJob, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update job status");
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      const response = await api.post(`/api/job-proposals/${proposalId}/accept/`);
      toast.success("Proposal accepted");
      
      setProposals(proposals.map(proposal =>
        proposal.id === proposalId ? { ...proposal, status: 'accepted' } : proposal
      ));
      
      if (selectedJob) {
        setSelectedJob({ ...selectedJob, status: 'in_progress' });
        setJobs(jobs.map(job =>
          job.id === selectedJob.id ? { ...job, status: 'in_progress' } : job
        ));
      }
    } catch (error) {
      toast.error("Failed to accept proposal");
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      const response = await api.post(`/api/job-proposals/${proposalId}/reject/`);
      toast.success("Proposal rejected");
      
      setProposals(proposals.map(proposal =>
        proposal.id === proposalId ? { ...proposal, status: 'rejected' } : proposal
      ));
    } catch (error) {
      toast.error("Failed to reject proposal");
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.posted_by.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  const jobsByStatus = useMemo(() => {
    const result = {
      awaiting: [],
      open: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    filteredJobs.forEach((job) => {
      if (result[job.status]) {
        result[job.status].push(job);
      }
    });

    return result;
  }, [filteredJobs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">
            Manage all job postings and applications in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <span>Export Data</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awaiting">Awaiting</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {filteredJobs.length} jobs found
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>{jobsByStatus.open?.length || 0} Open</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : jobsByStatus[activeTab]?.length === 0 ? (
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">No {activeTab} jobs</h3>
                <p className="text-muted-foreground text-sm">
                  {activeTab === 'open' 
                    ? "All open jobs will appear here" 
                    : `No ${activeTab.replace('_', ' ')} jobs found`}
                </p>
              </CardContent>
            ) : (
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                <div className="space-y-2 p-2">
                  {jobsByStatus[activeTab]?.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isSelected={selectedJob?.id === job.id}
                      onClick={(job) => setSelectedJob(job)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-8">
          <JobDetailsPanel 
            job={selectedJob}
            proposals={proposals}
            loading={proposalsLoading}
            onStatusChange={handleJobStatusChange}
            onAcceptProposal={handleAcceptProposal}
            onRejectProposal={handleRejectProposal}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
