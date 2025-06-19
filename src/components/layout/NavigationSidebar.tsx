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
import { useAuth } from '@/hooks/auth/useAuthContext';
import { 
  Home, 
  FileText, 
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
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Determine if sidebar should show expanded content
  const shouldShowContent = !isCollapsed || isExpanded;

  /**
   * Handle user sign-out
   */
  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    try {
      await signOut();
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
      path: '/',
      icon: FileText,
      isActive: location.pathname.startsWith('/editor')
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
            return (
              <Button
                key={item.path}
                variant={item.isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full justify-start gap-3 h-12 px-3
                  ${item.isActive ? 'bg-secondary text-secondary-foreground' : ''}
                `}
                title={!shouldShowContent ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {shouldShowContent && (
                  <span className="truncate">{item.label}</span>
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
