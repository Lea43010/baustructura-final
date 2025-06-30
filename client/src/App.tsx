import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing-enhanced";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetails from "@/pages/project-details";
import Maps from "@/pages/maps";
import Camera from "@/pages/camera";
import AudioRecorder from "@/pages/audio-recorder";
import Documents from "@/pages/documents";
import Profile from "@/pages/profile";
import Customers from "@/pages/customers";
import FloodProtection from "@/pages/flood-protection";
import ChecklistDetail from "@/pages/checklist-detail";
import Admin from "@/pages/admin";
import SftpManager from "@/pages/sftp-manager";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route path="/maps" component={Maps} />
      <Route path="/camera" component={Camera} />
      <Route path="/audio" component={AudioRecorder} />
      <Route path="/documents" component={Documents} />
      <Route path="/profile" component={Profile} />
      <Route path="/customers" component={Customers} />
      <Route path="/flood-protection/checklist/:id" component={ChecklistDetail} />
      <Route path="/flood-protection" component={FloodProtection} />
      <Route path="/sftp" component={SftpManager} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
