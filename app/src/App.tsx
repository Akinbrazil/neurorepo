// NeuroScope VR - Main Application
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/sections/LandingPage';
import LoginPage from '@/sections/LoginPage';
import Dashboard from '@/sections/Dashboard';
import SessionControl from '@/sections/SessionControl';
import SessionCockpit from '@/sections/SessionCockpit';
import VREnvironment from '@/sections/VREnvironment';
import VREnvironments from '@/sections/VREnvironments';
import PatientRegister from '@/sections/PatientRegister';
import DASS21Form from '@/sections/DASS21Form';
import TherapistDemo from '@/sections/TherapistDemo';
import PatientDemo from '@/sections/PatientDemo';
import AdminCRM from '@/sections/AdminCRM';
import WaitingRoom from '@/sections/WaitingRoom';
import Navbar from '@/components/Navbar';
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
    } else if (view === 'vr-environment') {
      setCurrentView('vr-environment');
    } else if (view === 'waiting-room') {
      setCurrentView('waiting-room');
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
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <LandingPage />
        </div>
      );

    case 'login':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <LoginPage />
        </div>
      );

    case 'dashboard':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <Dashboard />
        </div>
      );

    case 'session-control':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <SessionControl />
        </div>
      );

    case 'session-cockpit':
      return (
        <div className="h-screen overflow-hidden">
          <SessionCockpit patientId="P1" therapistId="T1" sessionId="session-001" />
        </div>
      );

    case 'vr-environment':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <VREnvironment />
        </div>
      );

    case 'waiting-room':
      return <WaitingRoom />;

    case 'patient-register':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <PatientRegister />
        </div>
      );

    case 'dass21-form':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <DASS21Form />
        </div>
      );

    case 'therapist-demo':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <TherapistDemo />
        </div>
      );

    case 'patient-demo':
      return <PatientDemo />;

    case 'vr-environments':
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <VREnvironments />
        </div>
      );

    case 'admin-crm':
      return (
        <div className="pt-16 min-h-screen bg-slate-50">
          <Navbar />
          <AdminCRM />
        </div>
      );

    default:
      return (
        <div className="pt-16 min-h-screen">
          <Navbar />
          <LandingPage />
        </div>
      );
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
