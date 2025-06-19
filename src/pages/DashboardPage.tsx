/**
 * @fileoverview Dashboard page component
 * @module pages/DashboardPage
 * 
 * Dependencies: React, UI components, Firebase, Authentication
 * Usage: Main dashboard page for authenticated users
 */


import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/useAuthContext";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { useDocuments } from "@/hooks/document/useDocuments";
import { PageErrorBoundary } from "@/components/layout";
import { FileText, Plus, User } from "lucide-react";

/**
 * Dashboard page component for authenticated users
 * 
 * This component shows the main dashboard with document management,
 * navigation to the editor, and user profile information
 */
function DashboardPageContent() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { createNewDocument } = useDocuments();



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
        
        {/* Main Content */}
        <main>
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Document Management */}
          <div className="mb-8">
            <DocumentList />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Dashboard page with error boundary
 */
export function DashboardPage() {
  return (
    <PageErrorBoundary pageName="Dashboard">
      <DashboardPageContent />
    </PageErrorBoundary>
  );
} 
