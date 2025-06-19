/**
 * @fileoverview Dashboard page component
 * @module pages/DashboardPage
 * 
 * Dependencies: React, UI components, Firebase, Authentication
 * Usage: Main dashboard page for authenticated users
 */

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/useAuthContext";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { useDocuments } from "@/hooks/document/useDocuments";
import { User, LogOut, Edit3, FileText, Plus, Settings } from "lucide-react";

/**
 * Dashboard page component for authenticated users
 * 
 * This component shows the main dashboard with document management,
 * navigation to the editor, and user profile information
 */
export function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { createNewDocument } = useDocuments();
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Handle user sign-out
   */
  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Navigate to the editor
   */
  const handleOpenEditor = () => {
    navigate('/editor');
  };

  /**
   * Create a new document
   */
  const handleCreateDocument = async () => {
    const documentId = await createNewDocument();
    if (documentId) {
      navigate(`/editor/${documentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">WordWise.ai</h1>
            <p className="text-muted-foreground text-lg">
              AI-Powered Writing Assistant for ESL College Students
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{profile?.displayName || user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main>
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateDocument}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Create New Document
                  </CardTitle>
                  <CardDescription>
                    Start writing with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Open the editor to begin writing your essay with real-time grammar and style suggestions.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    My Documents
                  </CardTitle>
                  <CardDescription>
                    View and manage your documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access your saved documents and continue working on drafts.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleOpenEditor}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Edit3 className="h-5 w-5 text-purple-600" />
                    Open Editor
                  </CardTitle>
                  <CardDescription>
                    Jump straight to writing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access the full-featured editor with formatting tools and statistics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Document Management */}
          <div className="mb-8">
            <DocumentList />
          </div>

          {/* Feature Progress */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Development Progress
                </CardTitle>
                <CardDescription>
                  Phase 1 implementation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Completed Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        React + TypeScript + Vite
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Tailwind CSS v3.4.17
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Shadcn/ui Components
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Firebase Backend Integration
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        User Authentication
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Rich Text Editor
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Next Steps</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-500">◐</span>
                        Document Management (Phase 1 Step 5)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">○</span>
                        AI Writing Assistance (Phase 2)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">○</span>
                        Real-time Suggestions (Phase 2)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">○</span>
                        Grammar Checking (Phase 2)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">○</span>
                        Style Analysis (Phase 2)
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Profile */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Display Name</p>
                    <p className="text-sm">{profile?.displayName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Language</p>
                    <p className="text-sm">{profile?.language || "en"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Proficiency Level</p>
                    <p className="text-sm">{profile?.proficiencyLevel || "intermediate"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                    <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{user?.uid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 
