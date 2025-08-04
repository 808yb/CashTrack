"use client"

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="w-full min-h-screen bg-gray-200">
      {children}
    </div>
  );
}