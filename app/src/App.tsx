// NeuroScope VR - Main Application
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/sections/LandingPage';
import LoginPage from '@/sections/LoginPage';
import Dashboard from '@/sections/Dashboard';
import SessionControl from '@/sections/SessionControl';
import VREnvironment from '@/sections/VREnvironment';
import VREnvironments from '@/sections/VREnvironments';
import PatientRegister from '@/sections/PatientRegister';
import DASS21Form from '@/sections/DASS21Form';
import TherapistDemo from '@/sections/TherapistDemo';
import PatientDemo from '@/sections/PatientDemo';
import { Loader2 } from 'lucide-react';
import './App.css';

// Main App Content Component
const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isLoading } = useAuth();

  // Handle URL routing for demo views
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'patient-demo') {
      setCurrentView('patient-demo');
    } else if (view === 'therapist-demo') {
      setCurrentView('therapist-demo');
    } else if (view === 'vr-environments') {
      setCurrentView('vr-environments');
    }
  }, [setCurrentView]);

  // Load A-Frame script for VR scenes
  useEffect(() => {
    // @ts-ignore
    if ((currentView === 'vr-environment' || currentView === 'patient-demo' || currentView === 'vr-environments') && !window.AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [currentView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Render current view
  switch (currentView) {
    case 'landing':
      return <LandingPage />;

    case 'login':
      return <LoginPage />;

    case 'dashboard':
      return <Dashboard />;

    case 'session-control':
      return <SessionControl />;

    case 'vr-environment':
      return <VREnvironment />;

    case 'patient-register':
      return <PatientRegister />;

    case 'dass21-form':
      return <DASS21Form />;

    case 'therapist-demo':
      return <TherapistDemo />;

    case 'patient-demo':
      return <PatientDemo />;

    case 'vr-environments':
      return <VREnvironments />;

    default:
      return <LandingPage />;
  }
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
