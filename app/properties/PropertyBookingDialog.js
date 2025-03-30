"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/utils/api";

const PropertyBookingDialog = ({ property, open, onOpenChange, onSuccess }) => {
  const [visitDate, setVisitDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!visitDate || !name || !phone) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      // Format date to match Django's expected format (ISO 8601)
      const formattedVisitDate = new Date(visitDate).toISOString();
      
      await api.post("/api/property-visits/", {
        property: property.id,
        visit_date: formattedVisitDate,
        name,
        email,
        phone_number: phone,
        message,
      });
      
      toast.success("Visit booked successfully! We'll contact you to confirm.");
      
      // Reset form fields
      setVisitDate("");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      
      onSuccess();
    } catch (error) {
      console.error("Booking error:", error);
      let errorMsg = "Failed to book visit. Please try again.";
      
      // If the server returns specific error messages, display them
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          // Handle field-specific errors
          const firstError = Object.entries(error.response.data)[0];
          if (firstError && firstError[1]) {
            errorMsg = `${firstError[0]}: ${firstError[1]}`;
          }
        }
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the minimum date-time (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Visit for {property.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            KES {parseFloat(property.price).toLocaleString()} • {property.location}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Visit Date *</label>
            <Input
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              min={getMinDateTime()}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Select a date and time for your visit</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Name *</label>
            <Input
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <Input
              placeholder="e.g. 07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Optional, but recommended for booking confirmations</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Message</label>
            <Textarea
              placeholder="Any special requests or questions?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyBookingDialog;