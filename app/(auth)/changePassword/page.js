"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@/app/context/userContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, AlertCircle, ShieldCheck } from "lucide-react";

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("weak");
  const { user, firstTimePasswordChange, isAuthenticated } = useUser();
  const router = useRouter();

  // Protect this page - only accessible to logged-in users with password_change_required
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (user && !user.password_change_required) {
      router.push("/");
    }
  }, [user, isAuthenticated, router]);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength("weak");
      return;
    }

    // Simple password strength check
    const hasLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    const strengthScore = [
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    ].filter(Boolean).length;

    if (strengthScore <= 2) setPasswordStrength("weak");
    else if (strengthScore <= 4) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  }, [newPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      await firstTimePasswordChange(currentPassword, newPassword);
      // Should redirect to dashboard from the userContext after successful password change
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to change password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.password_change_required) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Change Password
        </CardTitle>
        <CardDescription className="text-center">
          You need to change your password before continuing
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
            {newPassword && (
              <div className="mt-2">
                <div className="text-xs mb-1">
                  Password strength: {passwordStrength}
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${getStrengthColor()}`}
                    style={{
                      width: `${
                        passwordStrength === "weak"
                          ? 33
                          : passwordStrength === "medium"
                          ? 66
                          : 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-500 text-center">
          <p>
            Password should be at least 8 characters with uppercase, lowercase,
            numbers, and special characters.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChangePasswordPage;
