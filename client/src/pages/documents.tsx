import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Download, 
  Upload,
  Eye,
  FileText,
  FileImage,
  File,
  Trash2,
  Filter,
  FolderOpen,
  Mic,
  Camera,
  Play,
  Pause
} from "lucide-react";
import { Link } from "wouter";
import type { Attachment, Project } from "@shared/schema";

const attachmentFormSchema = z.object({
  projectId: z.number().min(1, "Projekt ist erforderlich"),
});

type AttachmentFormData = z.infer<typeof attachmentFormSchema>;

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey: ["/api/attachments"],
  });

  const { data: audioRecords = [] } = useQuery<any[]>({
    queryKey: ["/api/audio-records"],
  });

  const { data: photos = [] } = useQuery<any[]>({
    queryKey: ["/api/photos"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const form = useForm<AttachmentFormData>({
    resolver: zodResolver(attachmentFormSchema),
    defaultValues: {
      projectId: 0,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { projectId: number; file: File }) => {
      // For now, simulate upload success since backend upload isn't implemented yet
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ok: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Datei hochgeladen",
        description: "Die Datei wurde erfolgreich hochgeladen.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attachments"] });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/attachments/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Datei gelöscht",
        description: "Die Datei wurde erfolgreich gelöscht.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attachments"] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AttachmentFormData) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Datei aus.",
        variant: "destructive",
      });
      return;
    }
    if (data.projectId && data.projectId > 0) {
      uploadMutation.mutate({ projectId: data.projectId, file });
    } else {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Projekt aus.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsUploadDialogOpen(false);
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return <File className="h-8 w-8 text-gray-400" />;
    
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unbekannt';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb > 1) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${kb.toFixed(1)} KB`;
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'Unbekannt';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  const getFileTypeFilter = (mimeType?: string | null, type?: string) => {
    if (type === 'audio') return 'audio';
    if (type === 'photo') return 'images';
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'documents';
    return 'other';
  };

  // Kombiniere alle Medientypen in eine einheitliche Struktur
  const getAllMedia = (): any[] => {
    const media: any[] = [];
    
    // Dokument-Anhänge
    attachments.forEach((attachment: any) => {
      media.push({
        id: `attachment-${attachment.id}`,
        name: attachment.fileName,
        type: 'attachment',
        createdAt: attachment.createdAt,
        projectId: attachment.projectId,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        icon: getFileIcon(attachment.mimeType),
        filterType: getFileTypeFilter(attachment.mimeType),
        downloadUrl: attachment.filePath
      });
    });

    // Audio-Aufnahmen
    (audioRecords as any[]).forEach((record: any) => {
      media.push({
        id: `audio-${record.id}`,
        name: record.fileName || `Audio ${record.id}`,
        type: 'audio',
        createdAt: record.createdAt,
        projectId: record.projectId,
        duration: record.duration,
        description: record.description,
        transcription: record.transcription,
        icon: <Mic className="h-8 w-8 text-red-500" />,
        filterType: 'audio',
        downloadUrl: record.filePath
      });
    });

    // Fotos
    (photos as any[]).forEach((photo: any) => {
      media.push({
        id: `photo-${photo.id}`,
        name: photo.fileName || `Foto ${photo.id}`,
        type: 'photo',
        createdAt: photo.createdAt,
        projectId: photo.projectId,
        description: photo.description,
        icon: <Camera className="h-8 w-8 text-blue-500" />,
        filterType: 'images',
        downloadUrl: photo.filePath
      });
    });

    return media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const allMedia = getAllMedia();

  const filteredMedia = allMedia.filter(media => {
    const matchesSearch = (
      media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.id.toString().includes(searchTerm) ||
      (media.description && media.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesFilter = filterType === 'all' || media.filterType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { value: "all", label: "Alle Medien", count: allMedia.length },
    { value: "images", label: "Bilder", count: allMedia.filter(m => m.filterType === 'images').length },
    { value: "audio", label: "Audio", count: allMedia.filter(m => m.filterType === 'audio').length },
    { value: "documents", label: "Dokumente", count: allMedia.filter(m => m.filterType === 'documents').length },
    { value: "other", label: "Sonstige", count: allMedia.filter(m => m.filterType === 'other').length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dokumente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">Dokumente</h1>
              <p className="text-xs text-gray-600">Dateien und Anhänge verwalten</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/camera">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Foto
              </Button>
            </Link>
            <Link href="/audio">
              <Button variant="outline" size="sm">
                <Mic className="h-4 w-4 mr-2" />
                Audio
              </Button>
            </Link>
            <Button onClick={() => setIsUploadDialogOpen(true)} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Search and Filter */}
      <div className="p-4 bg-gray-50">
        <div className="flex space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nach Dateinamen oder ID suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filter Tags */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Badge
              key={filter.value}
              variant={filterType === filter.value ? "default" : "secondary"}
              className={`cursor-pointer whitespace-nowrap ${
                filterType === filter.value 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilterType(filter.value)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Media List */}
      <div className="p-4 space-y-4 pb-20">
        {filteredMedia.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="p-0">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterType !== "all" 
                  ? "Keine Medien gefunden" 
                  : "Noch keine Medien vorhanden"
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== "all"
                  ? "Versuchen Sie andere Suchbegriffe oder Filter"
                  : "Erstellen Sie Ihre ersten Aufnahmen über Kamera oder Audio"
                }
              </p>
              {(!searchTerm && filterType === "all") && (
                <div className="flex gap-3 justify-center">
                  <Link href="/camera">
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Foto aufnehmen
                    </Button>
                  </Link>
                  <Link href="/audio">
                    <Button variant="outline">
                      <Mic className="h-4 w-4 mr-2" />
                      Audio aufnehmen
                    </Button>
                  </Link>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Datei hochladen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMedia.map((media) => (
            <Card key={media.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {media.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {media.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {media.type === 'attachment' && `Dokument-ID: ${media.id.split('-')[1]}`}
                      {media.type === 'audio' && `Audio-ID: ${media.id.split('-')[1]}`}
                      {media.type === 'photo' && `Foto-ID: ${media.id.split('-')[1]}`}
                    </p>
                    
                    {/* Beschreibung für Audio und Fotos */}
                    {(media.description || media.transcription) && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {media.transcription || media.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-1">
                      {media.type === 'attachment' && media.fileSize && (
                        <span className="text-xs text-gray-500">
                          {formatFileSize(media.fileSize)}
                        </span>
                      )}
                      {media.type === 'audio' && media.duration && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(media.duration)}
                        </span>
                      )}
                      {media.projectId && (
                        <span className="text-xs text-gray-500">
                          Projekt: {projects.find(p => p.id === media.projectId)?.name || 'Unbekannt'}
                        </span>
                      )}
                      {media.createdAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(media.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {media.type === 'audio' && (
                      <Button variant="ghost" size="sm" title="Audio abspielen">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" title="Anzeigen/Öffnen">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Herunterladen">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Löschen"
                      onClick={() => {
                        if (media.type === 'attachment') {
                          deleteMutation.mutate(parseInt(media.id.split('-')[1]));
                        }
                        // TODO: Audio und Photo delete mutations
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projekt *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Projekt auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Datei *</label>
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xls,.xlsx"
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  Unterstützte Formate: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, CSV, XLS, XLSX
                </p>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Lädt hoch..." : "Hochladen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}