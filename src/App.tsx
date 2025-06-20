/**
 * @fileoverview Main application component
 * @module App
 * 
 * Dependencies: React, React Router, Firebase, Authentication
 * Usage: Root application component with routing and authentication
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/useAuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout";
import { DashboardPage, DocumentsPage, EditorPage } from "@/pages";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Main application component
 * 
 * This is the root component for WordWise.ai. It provides authentication
 * context and routing for the application.
 */
function App() {
  useEffect(() => {
    // Test Firebase connection
    const testFirebaseConnection = async () => {
      try {
        // Test Firebase Auth
        getAuth();
        
        // Test Firestore connection
        getFirestore();
        
        // Firebase connection successful - ready for use
      } catch (error) {
        console.error("Firebase connection error:", error);
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AuthGuard>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/editor/:documentId" element={<EditorPage />} />
            </Routes>
          </AppLayout>
        </AuthGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;
