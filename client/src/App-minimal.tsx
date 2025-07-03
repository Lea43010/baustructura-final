import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ErrorBoundary } from "./components/error-boundary";

// Import components directly without lazy loading to avoid complexity
import Landing from "./pages/landing-enhanced";
import Dashboard from "./pages/dashboard";
import Projects from "./pages/projects";
import ProjectDetails from "./pages/project-details";
import Maps from "./pages/maps";
import Camera from "./pages/camera";
import AudioRecorder from "./pages/audio-recorder";
import Documents from "./pages/documents";
import AIAssistantPage from "./pages/ai-assistant";
import Profile from "./pages/profile";
import Customers from "./pages/customers";
import FloodProtection from "./pages/flood-protection";
import HochwasserAnleitung from "./pages/hochwasser-anleitung";
import ChecklistDetail from "./pages/checklist-detail";
import Admin from "./pages/admin";
import SftpManager from "./pages/sftp-manager";
import Support from "./pages/support";
import NotFound from "./pages/not-found";
import Auth from "./pages/auth";

function RouterContent() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id">
        {(params) => <ProjectDetails params={params} />}
      </Route>
      <Route path="/maps" component={Maps} />
      <Route path="/camera" component={Camera} />
      <Route path="/audio-recorder" component={AudioRecorder} />
      <Route path="/documents" component={Documents} />
      <Route path="/ai-assistant" component={AIAssistantPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/customers" component={Customers} />
      <Route path="/flood-protection" component={FloodProtection} />
      <Route path="/hochwasser-anleitung" component={HochwasserAnleitung} />
      <Route path="/flood-protection/checklist/:id">
        {(params) => <ChecklistDetail params={params} />}
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/sftp-manager" component={SftpManager} />
      <Route path="/support" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <RouterContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;