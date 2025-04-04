// "use client";
// import React, { useState, useEffect } from "react";
// import { useUser } from "../../context/userContext";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, LogIn, AlertCircle } from "lucide-react";

// const EnhancedLoginForm = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const { login, error, loading, clearError, isAuthenticated } = useUser();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const returnUrl = searchParams.get("returnUrl");

//   // Redirect if already logged in
//   useEffect(() => {
//     if (isAuthenticated()) {
//       router.push("/");
//     }
//   }, [isAuthenticated, router]);

//   // Clear previous errors when component mounts
//   useEffect(() => {
//     clearError();
//   }, [clearError]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const success = await login(username, password);

//     // Note: The redirect is handled by the login function in userContext
//     // based on password_change_required status
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
//         <CardDescription className="text-center">
//           Enter your credentials to access your account
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         {error && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription className="ml-2">{error}</AlertDescription>
//           </Alert>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="username">Username</Label>
//             <Input
//               id="username"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Enter your username"
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="password">Password</Label>
//             </div>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//               disabled={loading}
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Logging in...
//               </>
//             ) : (
//               <>
//                 <LogIn className="mr-2 h-4 w-4" />
//                 Sign In
//               </>
//             )}
//           </Button>
//         </form>
//       </CardContent>

//       <CardFooter className="flex flex-col space-y-4">
//         <div className="text-sm text-gray-500 text-center">
//           <p>If you need help, please contact your administrator.</p>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export default EnhancedLoginForm;

"use client";

import { Suspense } from 'react';
import EnhancedLoginForm from '@/components/auth/EnhancedLoginForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Suspense fallback={<Skeleton className="w-[400px] h-[500px]" />}>
        <EnhancedLoginForm />
      </Suspense>
    </div>
  );
}
