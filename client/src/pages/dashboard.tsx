import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectStats } from "@/components/project/project-stats";
import { PageHeader } from "@/components/layout/page-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { 
  FolderOpen, 
  AlertCircle, 
  Camera,
  Shield,
  FileText, 
  MapPin, 
  Network,
  Bell,
  User,
  Server,
  Mic
} from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const activeProjects = projects.filter(p => p.status === "active").length;
  const pendingTasks = projects.filter(p => p.status === "planning").length;

  const recentProjects = projects.slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Network className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Bau-Structura</h1>
              <p className="text-xs text-gray-600">
                {(user as any)?.role === "admin" && "Administrator Dashboard"}
                {(user as any)?.role === "manager" && "Manager Dashboard"}
                {(user as any)?.role === "user" && "Benutzer Dashboard"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div 
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
              onClick={() => setLocation("/profile")}
            >
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Dashboard Content */}
      <div className="p-4 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ProjectStats
            title="Aktive Projekte"
            value={activeProjects}
            icon={<FolderOpen className="h-5 w-5" />}
            color="bg-green-500"
          />
          <ProjectStats
            title="Neue Aufgaben"
            value={pendingTasks}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-orange-500"
          />
        </div>

        {/* Recent Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Projekte</h2>
            <Link href="/projects">
              <Button variant="link" className="text-green-600 text-sm font-medium p-0">
                Alle anzeigen
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Noch keine Projekte vorhanden</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Erstellen Sie Ihr erstes Projekt, um loszulegen
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-4 gap-3">
            <Link href="/camera">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Foto aufnehmen</p>
                  <p className="text-xs text-gray-600">Dokumentieren</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/maps">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Karte öffnen</p>
                  <p className="text-xs text-gray-600">Standorte anzeigen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/flood-protection">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Hochwasserschutz</p>
                  <p className="text-xs text-gray-600">Checklisten & Anlagen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/audio">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Sprachaufnahme</p>
                  <p className="text-xs text-gray-600">Berichte sprechen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/documents">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Dokumente</p>
                  <p className="text-xs text-gray-600">Upload & Verwaltung</p>
                </CardContent>
              </Card>
            </Link>


          </div>
        </div>

        {/* Manager/Admin Tools */}
        {((user as any)?.role === 'manager' || (user as any)?.role === 'admin') && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager-Tools</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/sftp">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Server className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">SFTP-Manager</p>
                      <p className="text-sm text-gray-600">Dateien & Ordner verwalten</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/customers">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Kundenverwaltung</p>
                      <p className="text-sm text-gray-600">Kunden & Firmen</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
