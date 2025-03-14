"use client";

// import { UserProvider } from "/context/userContext"
import { UserProvider } from "./context/userContext";

export function Providers({ children }) {
  return <UserProvider>{children}</UserProvider>;
}
