import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

interface SystemStats {
  activeUsers: number;
  newUsersThisMonth: number;
  dbSize: string;
  lastBackup: string;
  activeLicenses: number;
  expiringLicenses: number;
  availableLicenses: number;
  totalProjects: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  basicLicenses: number;
  professionalLicenses: number;
  enterpriseLicenses: number;
}
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { 
  Users, 
  Database, 
  FileText, 
  Key, 
  TestTube2, 
  Download,
  Shield,
  Activity,
  ArrowLeft,
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== 'admin')) {
      toast({
        title: "Zugriff verweigert",
        description: "Nur Administratoren können auf diesen Bereich zugreifen.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch real system stats from API
  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Lade Administrationsbereich...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Systemverwaltung und Benutzermanagement
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.newUsersThisMonth || 0} neue diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenbankgröße</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.dbSize || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Letztes Backup: {systemStats?.lastBackup || "Nie"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Lizenzen</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeLicenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.expiringLicenses || 0} ablaufend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.adminUsers || 0} Administratoren
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Benutzerverwaltung
            </CardTitle>
            <CardDescription>
              Benutzerkonten, Rollen und Berechtigungen verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Administratoren:</span>
                <Badge variant="destructive">{systemStats?.adminUsers || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Manager:</span>
                <Badge variant="default">{systemStats?.managerUsers || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Benutzer:</span>
                <Badge variant="secondary">{systemStats?.regularUsers || 0}</Badge>
              </div>
            </div>
            <Button className="w-full" disabled>
              Benutzer verwalten
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Backup Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup-Verwaltung
            </CardTitle>
            <CardDescription>
              Datenbank-Backups erstellen und verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• Automatische tägliche Backups</p>
              <p>• Aufbewahrung für 30 Tage</p>
              <p>• Verschlüsselte Speicherung</p>
              <p>• Letztes Backup: Heute 02:00</p>
            </div>
            <Button className="w-full flex items-center gap-2" disabled>
              <Download className="h-4 w-4" />
              Backup erstellen
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Systemdokumentation
            </CardTitle>
            <CardDescription>
              Datenstruktur und API-Dokumentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• Datenbank-Schema (16 Tabellen)</p>
              <p>• API-Endpunkte (45 Routen)</p>
              <p>• Benutzerhandbuch</p>
              <p>• Entwickler-Dokumentation</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Dokumentation anzeigen
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* License Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Lizenzverwaltung
            </CardTitle>
            <CardDescription>
              Drei Lizenzmodelle verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Basic (21€)</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Grundfunktionen</div>
                </div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {systemStats?.basicLicenses || 0}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">Professional (39€)</div>
                  <div className="text-xs text-green-600 dark:text-green-300">Erweiterte Features</div>
                </div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {systemStats?.professionalLicenses || 0}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800 dark:text-purple-200">Enterprise</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300">Preis auf Anfrage</div>
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {systemStats?.enterpriseLicenses || 0}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-bold text-orange-600">{systemStats?.expiringLicenses || 0}</div>
                <div className="text-xs">Ablaufend (30 Tage)</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-bold text-green-600">{systemStats?.activeLicenses || 0}</div>
                <div className="text-xs">Gesamt aktiv</div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" disabled>
              Lizenzen verwalten
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Testphasen-Verwaltung
            </CardTitle>
            <CardDescription>
              Testbenutzer und Beta-Features verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Beta Features</span>
                <Badge variant="outline">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Test-Modus</span>
                <Badge variant="secondary">Inaktiv</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Test-Einstellungen
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Systemeinstellungen
            </CardTitle>
            <CardDescription>
              Allgemeine System- und App-Konfiguration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• E-Mail-Konfiguration</p>
              <p>• SFTP-Einstellungen</p>
              <p>• Sicherheitsrichtlinien</p>
              <p>• Logging-Optionen</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Einstellungen bearbeiten
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Development Notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Entwicklungshinweis
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Der Administrationsbereich wird schrittweise ausgebaut. Aktuell sind die Grundfunktionen 
          implementiert. Erweiterte Features wie Benutzerverwaltung, Backup-Erstellung und 
          Systemkonfiguration werden in den nächsten Versionen hinzugefügt.
        </p>
      </div>
    </div>
  );
}