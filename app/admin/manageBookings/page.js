"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Phone, Mail, Home } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, propertiesRes, typesRes] = await Promise.all([
        api.get("/api/property-visits/"),
        api.get("/api/properties/"),
        api.get("/api/property-types/"),
      ]);
      
      setBookings(bookingsRes.data);
      setFilteredBookings(bookingsRes.data);
      setProperties(propertiesRes.data);
      setPropertyTypes(typesRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterBookings();
  }, [searchTerm, selectedStatus, selectedPropertyType, bookings, properties]);

  const filterBookings = () => {
    let results = [...bookings];

    if (searchTerm) {
      results = results.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== "all") {
      results = results.filter(booking => 
        booking.status === selectedStatus
      );
    }

    if (selectedPropertyType !== "all") {
      // First get all property IDs that match the selected type
      const propertyIdsOfType = properties
        .filter(property => property.property_type.toString() === selectedPropertyType)
        .map(property => property.id);
      
      // Then filter bookings that match these property IDs
      results = results.filter(booking => 
        propertyIdsOfType.includes(booking.property)
      );
    }

    setFilteredBookings(results);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/api/property-visits/${id}/`, { status: newStatus });
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));
      toast.success("Booking status updated");
    } catch (error) {
      toast.error("Failed to update booking status");
    } finally {
      setLoading(false);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.title : "Unknown Property";
  };

  const getPropertyTypeName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return "Unknown";
    
    const type = propertyTypes.find(t => t.id === property.property_type);
    return type ? type.name : "Unknown Type";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Manage Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, phone or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-lg">No bookings match your search criteria</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
                setSelectedPropertyType("all");
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{getPropertyName(booking.property)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPropertyTypeName(booking.property)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.phone_number}</span>
                        </div>
                        {booking.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.visit_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "confirmed")}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "completed")}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsManagement;
