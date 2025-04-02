"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import api from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  old_password: z.string().min(4, {
    message: "Old password must be at least 4 characters.",
  }),
  new_password: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirm_password: z.string().min(8, {
    message: "Password confirmation must be at least 8 characters.",
  }),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    setIsSuccess(false);
    
    try {
      const response = await api.patch("/api/change-password/", {
        old_password: values.old_password,
        new_password: values.new_password,
      });

      setIsSuccess(true);
      toast.success("Your password has been updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Reset form after success
      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Password change error:", error);
      
      // Handle specific Django error formats
      if (error.response?.data?.old_password) {
        form.setError("old_password", {
          type: "manual",
          message: error.response.data.old_password[0],
        });
      } else {
        toast.error(error.response?.data?.detail || "Failed to change password", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your current password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm your new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting || isSuccess}
          className="w-full relative"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Password Changed!
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </Form>
  );
}
