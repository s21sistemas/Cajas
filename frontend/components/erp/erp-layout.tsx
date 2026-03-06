"use client";

import React, { Suspense } from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ToastProvider } from "./action-toast";

interface ERPLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

function SidebarFallback() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0" />
  );
}

export function ERPLayout({ children, title, subtitle }: ERPLayoutProps) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background">
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
