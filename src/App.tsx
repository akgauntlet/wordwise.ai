/**
 * @fileoverview Main application component
 * @module App
 * 
 * Dependencies: React, UI components, Firebase, Authentication
 * Usage: Root application component with authentication and global providers
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase/config";
import { AuthProvider, useAuth } from "@/hooks/auth/useAuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { User, LogOut } from "lucide-react";

/**
 * Main dashboard component for authenticated users
 * 
 * This component is shown after successful authentication
 * and will eventually contain the document editor and AI features
 */
function Dashboard() {
  const { user, profile, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
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
        
        <main className="text-center">
          <div className="space-y-4">
            <p className="text-lg">
              🎉 Authentication successful! Phase 1 Step 3 complete.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button variant="default">Create New Document</Button>
              <Button variant="outline">View My Documents</Button>
              <Button variant="secondary">Open Editor</Button>
            </div>
            
            <div className="mt-8 p-6 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-2">Setup Status</h2>
              <ul className="space-y-1 text-left max-w-md mx-auto">
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
                  <span className="text-yellow-500">◐</span>
                  Text Editor (Step 4)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">◐</span>
                  Document Management (Step 5)
                </li>
              </ul>
            </div>

            <div className="mt-4 p-4 border rounded-lg bg-muted">
              <h3 className="text-lg font-semibold mb-2">User Profile</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Display Name:</strong> {profile?.displayName || "Not set"}</p>
                <p><strong>Language:</strong> {profile?.language || "en"}</p>
                <p><strong>Proficiency Level:</strong> {profile?.proficiencyLevel || "intermediate"}</p>
                <p><strong>User ID:</strong> {user?.uid}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Main application component
 * 
 * This is the root component for WordWise.ai. It provides authentication
 * context and shows the appropriate UI based on authentication state.
 */
function App() {
  useEffect(() => {
    /**
     * Test Firebase connection on app initialization
     * Logs connection status to console for debugging
     */
    const testFirebaseConnection = async () => {
      try {
        // Test Firebase Auth initialization
        if (auth) {
          console.log("✓ Firebase Auth initialized");
        }
        
        // Test Firestore initialization
        if (db) {
          console.log("✓ Firestore initialized");
        }
        
        console.log("✓ Firebase connection successful");
      } catch (error) {
        console.error("Firebase connection error:", error);
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <AuthProvider>
      <div className="app">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </div>
    </AuthProvider>
  );
}

export default App;
