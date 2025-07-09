// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}