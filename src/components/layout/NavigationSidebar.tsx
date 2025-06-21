/**
 * @fileoverview Persistent navigation sidebar component
 * @module components/layout/NavigationSidebar
 * 
 * Dependencies: React, React Router, UI components, Authentication
 * Usage: Main navigation sidebar that persists across pages
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useActiveDocument } from '@/hooks/document';
import { useDocuments } from '@/hooks/document/useDocuments';
import { 
  Home, 
  FileText, 
  Edit3,
  History,
  User, 
  LogOut
} from 'lucide-react';

/**
 * Navigation sidebar props
 */
interface NavigationSidebarProps {
  /** Whether the sidebar should be collapsed (editor mode) */
  isCollapsed?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Navigation item interface
 */
interface NavigationItem {
  /** Item label */
  label: string;
  /** Navigation path */
  path: string;
  /** Lucide icon component */
  icon: typeof Home;
  /** Whether this item matches current route */
  isActive?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Persistent navigation sidebar component
 * 
 * Provides main navigation across all pages. In editor mode,
 * collapses to icons only and expands on hover.
 * 
 * @param isCollapsed Whether sidebar should be in collapsed state
 * @param className Additional CSS classes
 */
export function NavigationSidebar({ isCollapsed = false, className = '' }: NavigationSidebarProps) {
  const { user, profile, signOut } = useAuth();
  const { activeDocumentId, hasActiveDocument } = useActiveDocument();
  const { documents } = useDocuments();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Find the active document to get its name
  const activeDocument = activeDocumentId 
    ? documents.find(doc => doc.id === activeDocumentId)
    : null;

  // Determine if sidebar should show expanded content
  const shouldShowContent = !isCollapsed || isExpanded;

  /**
   * Handle user sign-out
   */
  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Navigate to app root after successful sign out
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Handle navigation item click
   */
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  /**
   * Handle editor navigation - navigate to active document or do nothing if disabled
   */
  const handleEditorNavigate = () => {
    if (hasActiveDocument && activeDocumentId) {
      navigate(`/editor/${activeDocumentId}`);
    }
  };

  /**
   * Navigation items configuration
   */
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/'
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: FileText,
      isActive: location.pathname === '/documents'
    },
    {
      label: 'Editor',
      path: activeDocumentId ? `/editor/${activeDocumentId}` : '/editor',
      icon: Edit3,
      isActive: location.pathname.startsWith('/editor'),
      disabled: !hasActiveDocument
    },
    {
      label: 'Versions',
      path: '/versions',
      icon: History,
      isActive: location.pathname === '/versions',
      disabled: !hasActiveDocument
    }
  ];

  return (
    <aside 
      className={`
        bg-background border-r border-border transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isCollapsed && isExpanded ? 'w-64' : ''}
        h-screen sticky top-0 z-40 flex flex-col
        ${className}
      `}
      onMouseEnter={() => isCollapsed && setIsExpanded(true)}
      onMouseLeave={() => isCollapsed && setIsExpanded(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border h-20 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          {shouldShowContent && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg text-foreground leading-none">
                WordWise.ai
              </h1>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                AI Writing Assistant
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isEditor = item.label === 'Editor';
            const shouldShowDocumentName = isEditor && activeDocument && shouldShowContent;
            
            return (
              <Button
                key={item.path}
                variant={item.isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={isEditor ? handleEditorNavigate : () => handleNavigate(item.path)}
                disabled={item.disabled}
                className={`
                  w-full justify-start gap-3 px-3 h-14
                  ${item.isActive ? 'bg-secondary text-secondary-foreground' : ''}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={
                  !shouldShowContent 
                    ? item.label 
                    : item.disabled 
                      ? 'No active document - create or open a document first'
                      : undefined
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {shouldShowContent && (
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="truncate">{item.label}</span>
                    {shouldShowDocumentName && (
                      <span className="text-xs text-blue-600 truncate w-full text-left">
                        {activeDocument.title}
                      </span>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-border">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-md mb-2 h-12">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {shouldShowContent && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full justify-start gap-3 h-12 px-3 text-muted-foreground hover:text-foreground"
          title={!shouldShowContent ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {shouldShowContent && (
            <span className="truncate">
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </span>
          )}
        </Button>
      </div>


    </aside>
  );
} 
