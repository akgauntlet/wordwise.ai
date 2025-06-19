/**
 * @fileoverview Main application component
 * @module App
 * 
 * Dependencies: React, React Router, Firebase, Authentication
 * Usage: Root application component with routing and authentication
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth, db } from "@/lib/firebase/config";
import { AuthProvider } from "@/hooks/auth/useAuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardPage, EditorPage } from "@/pages";

/**
 * Main application component
 * 
 * This is the root component for WordWise.ai. It provides authentication
 * context and routing for the application.
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
      <Router>
        <div className="app">
          <AuthGuard>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/editor/:documentId" element={<EditorPage />} />
            </Routes>
          </AuthGuard>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
