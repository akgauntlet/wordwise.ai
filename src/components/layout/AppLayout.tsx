/**
 * @fileoverview Main application layout component
 * @module components/layout/AppLayout
 * 
 * Dependencies: React, React Router, Layout components
 * Usage: Main layout wrapper that includes persistent sidebar and content area
 */

import { useLocation } from 'react-router-dom';
import { NavigationSidebar } from './NavigationSidebar';
import type { ReactNode } from 'react';

/**
 * App layout props
 */
interface AppLayoutProps {
  /** Child components to render in content area */
  children: ReactNode;
}

/**
 * Main application layout component
 * 
 * Provides the persistent navigation sidebar and main content area.
 * Automatically collapses sidebar when in editor mode.
 * 
 * @param children Components to render in the main content area
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Determine if we're in editor mode (sidebar should be collapsed)
  const isEditorMode = location.pathname.startsWith('/editor');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <NavigationSidebar isCollapsed={isEditorMode} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 
