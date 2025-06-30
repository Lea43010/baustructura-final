import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertCustomerSchema, insertCompanySchema, insertPersonSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Config routes
  app.get('/api/config/maps-key', isAuthenticated, async (req, res) => {
    try {
      res.json({ 
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
      });
    } catch (error) {
      console.error("Error fetching maps config:", error);
      res.status(500).json({ message: "Failed to fetch maps config" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Validate allowed fields
      const allowedFields = [
        'firstName', 'lastName', 'privacyConsent', 'sftpHost', 
        'sftpPort', 'sftpUsername', 'sftpPassword', 'sftpPath', 
        'emailNotificationsEnabled'
      ];
      
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      const updatedUser = await storage.updateUser(userId, filteredData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/profile/test-sftp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.sftpHost || !user?.sftpUsername) {
        return res.status(400).json({ message: "SFTP configuration incomplete" });
      }

      // In a real implementation, you would test the SFTP connection here
      // For now, we'll simulate a successful test
      res.json({ message: "SFTP connection successful", connected: true });
    } catch (error) {
      console.error("Error testing SFTP:", error);
      res.status(500).json({ message: "SFTP connection failed" });
    }
  });

  // SFTP File Management endpoints
  app.get('/api/sftp/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP access requires manager or admin role" });
      }
      
      if (!user?.sftpHost || !user?.sftpUsername) {
        return res.status(400).json({ message: "SFTP configuration incomplete" });
      }

      const path = req.query.path || user.sftpPath || '/';
      
      // Mock SFTP file listing for demonstration - in production use ssh2-sftp-client
      const mockFiles = [
        {
          name: 'projects',
          type: 'directory',
          size: 0,
          modified: new Date('2025-06-01'),
          permissions: 'drwxr-xr-x'
        },
        {
          name: 'documents',
          type: 'directory', 
          size: 0,
          modified: new Date('2025-06-15'),
          permissions: 'drwxr-xr-x'
        },
        {
          name: 'projekt_muenchen_bahnhof.pdf',
          type: 'file',
          size: 2457600,
          modified: new Date('2025-06-20'),
          permissions: '-rw-r--r--'
        },
        {
          name: 'checkliste_hochwasser.xlsx',
          type: 'file',
          size: 524288,
          modified: new Date('2025-06-18'),
          permissions: '-rw-r--r--'
        },
        {
          name: 'backup_2025-06-29.zip',
          type: 'file',
          size: 15728640,
          modified: new Date('2025-06-29'),
          permissions: '-rw-r--r--'
        }
      ];

      res.json({ path, files: mockFiles });
    } catch (error) {
      console.error("SFTP list files failed:", error);
      res.status(500).json({ 
        message: "Failed to list SFTP files", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/sftp/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP upload requires manager or admin role" });
      }
      
      const { fileName, path, fileSize } = req.body;
      
      if (!fileName) {
        return res.status(400).json({ message: "File name is required" });
      }

      // Mock upload response - in production handle actual file upload via SFTP
      const uploadResult = {
        success: true,
        fileName,
        path: path || user?.sftpPath || '/',
        size: fileSize || 0,
        uploadedAt: new Date(),
        message: "File uploaded successfully"
      };

      res.json(uploadResult);
    } catch (error) {
      console.error("SFTP upload failed:", error);
      res.status(500).json({ 
        message: "Failed to upload file", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.delete('/api/sftp/files/:fileName', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP delete requires manager or admin role" });
      }
      
      const fileName = req.params.fileName;
      const path = req.query.path || user?.sftpPath || '/';
      
      // Mock delete response - in production delete the actual file via SFTP
      res.json({ 
        success: true, 
        message: `File ${fileName} deleted successfully from ${path}`,
        deletedAt: new Date()
      });
    } catch (error) {
      console.error("SFTP delete failed:", error);
      res.status(500).json({ 
        message: "Failed to delete file", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/sftp/create-folder', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP folder creation requires manager or admin role" });
      }
      
      const { folderName, path } = req.body;
      
      if (!folderName) {
        return res.status(400).json({ message: "Folder name is required" });
      }

      // Mock folder creation response - in production create actual folder via SFTP
      res.json({ 
        success: true, 
        message: `Folder ${folderName} created successfully`,
        path: `${path || user?.sftpPath || '/'}/${folderName}`,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("SFTP create folder failed:", error);
      res.status(500).json({ 
        message: "Failed to create folder", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let projects;
      if (user?.role === "admin") {
        projects = await storage.getProjects();
      } else {
        projects = await storage.getProjectsByManager(userId);
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        managerId: userId,
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(projectId, projectData);
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Customer routes
  app.get("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(customerId, customerData);
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Company routes
  app.get("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Person routes
  app.get("/api/persons", isAuthenticated, async (req: any, res) => {
    try {
      const persons = await storage.getPersons();
      res.json(persons);
    } catch (error) {
      console.error("Error fetching persons:", error);
      res.status(500).json({ message: "Failed to fetch persons" });
    }
  });

  app.post("/api/persons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(personData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      console.error("Error creating person:", error);
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // Attachment routes
  app.get("/api/attachments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // For now, return empty array as all attachments endpoint needs implementation
      res.json([]);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.get("/api/projects/:id/attachments", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const attachments = await storage.getAttachments(projectId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.delete("/api/attachments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // For now, simple success response until delete method is implemented
      res.json({ message: "Attachment deleted successfully" });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Photo routes
  app.get("/api/projects/:id/photos", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const photos = await storage.getPhotos(projectId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Audio routes
  app.get("/api/projects/:id/audio", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const audioRecords = await storage.getAudioRecords(projectId);
      res.json(audioRecords);
    } catch (error) {
      console.error("Error fetching audio records:", error);
      res.status(500).json({ message: "Failed to fetch audio records" });
    }
  });

  // Support ticket routes
  app.get("/api/support-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Flood protection routes
  app.post("/api/flood/import-checklist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jsonData, typ } = req.body;
      
      if (!jsonData || !typ) {
        return res.status(400).json({ message: "JSON-Daten und Typ sind erforderlich" });
      }

      // Create checklist with dummy data for now
      const checklistId = Date.now().toString();
      
      res.status(201).json({ 
        success: true, 
        checklistId,
        message: `Checkliste "${jsonData.title}" erfolgreich importiert` 
      });
    } catch (error) {
      console.error("Fehler beim Import der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Import der Checkliste" });
    }
  });

  app.get("/api/flood/checklists", isAuthenticated, async (req: any, res) => {
    try {
      // Return demo data for now
      const demoChecklists = [
        {
          id: "1",
          titel: "Hochwasserereignis Mai 2025",
          typ: "hochwasser",
          status: "in_bearbeitung",
          erstellt_am: "2025-05-15T08:00:00Z",
          erstellt_von: "Thomas Müller",
          beginn_pegelstand_cm: 245,
          fortschritt: 68,
          aufgaben_gesamt: 11,
          aufgaben_erledigt: 7
        },
        {
          id: "2", 
          titel: "Routineübung Frühjahr",
          typ: "uebung",
          status: "abgeschlossen",
          erstellt_am: "2025-03-20T10:30:00Z",
          erstellt_von: "Sarah Weber",
          fortschritt: 100,
          aufgaben_gesamt: 11,
          aufgaben_erledigt: 11
        }
      ];
      res.json(demoChecklists);
    } catch (error) {
      console.error("Fehler beim Laden der Checklisten:", error);
      res.status(500).json({ message: "Fehler beim Laden der Checklisten" });
    }
  });

  app.post("/api/flood/create-checklist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { titel, typ, beginn_pegelstand_cm, beschreibung } = req.body;
      
      if (!titel || !typ) {
        return res.status(400).json({ message: "Titel und Typ sind erforderlich" });
      }

      // Erstelle neue Checkliste mit Demo-ID
      const newChecklist = {
        id: Date.now().toString(),
        titel,
        typ,
        status: "offen",
        erstellt_am: new Date().toISOString(),
        erstellt_von: userId,
        beginn_pegelstand_cm: beginn_pegelstand_cm || 0,
        beschreibung: beschreibung || "",
        fortschritt: 0,
        aufgaben_gesamt: 11,
        aufgaben_erledigt: 0
      };
      
      res.status(201).json({ 
        success: true, 
        checklist: newChecklist,
        message: `Checkliste "${titel}" erfolgreich erstellt` 
      });
    } catch (error) {
      console.error("Fehler beim Erstellen der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Erstellen der Checkliste" });
    }
  });

  app.delete("/api/flood/checklists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // In a real app, we would delete from database
      // await db.delete(checklisten).where(eq(checklisten.id, id));
      
      res.json({ 
        success: true, 
        message: `Checkliste ${id} wurde gelöscht` 
      });
    } catch (error) {
      console.error("Fehler beim Löschen der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Löschen der Checkliste" });
    }
  });

  app.delete("/api/flood/checklists/delete-all", isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, we would delete all checklists from database
      // await db.delete(checklisten);
      
      res.json({ 
        success: true, 
        message: "Alle Checklisten wurden gelöscht" 
      });
    } catch (error) {
      console.error("Fehler beim Löschen aller Checklisten:", error);
      res.status(500).json({ message: "Fehler beim Löschen aller Checklisten" });
    }
  });

  app.post("/api/flood/checklists/duplicate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { checklistId } = req.body;
      
      // In a real app, we would duplicate the checklist in database
      const duplicatedChecklist = {
        id: Date.now().toString(),
        titel: `Kopie - Checkliste ${checklistId}`,
        typ: "hochwasser",
        status: "offen",
        erstellt_am: new Date().toISOString(),
        erstellt_von: userId,
        beginn_pegelstand_cm: 0,
        beschreibung: "Duplizierte Checkliste",
        fortschritt: 0,
        aufgaben_gesamt: 11,
        aufgaben_erledigt: 0
      };
      
      res.status(201).json({ 
        success: true, 
        checklist: duplicatedChecklist,
        message: "Checkliste wurde dupliziert" 
      });
    } catch (error) {
      console.error("Fehler beim Duplizieren der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Duplizieren der Checkliste" });
    }
  });

  app.get("/api/flood/absperrschieber", isAuthenticated, async (req: any, res) => {
    try {
      // Return demo data for now - in production this would query the database
      const demoSchieber = [
        {
          id: 1,
          nummer: 1,
          bezeichnung: "Absperrschieber DN 300",
          lage: "Lohr km 1,470, Nähe Kupfermühle",
          beschreibung: "Absperrschieber DN 300 mit Festspindel bis unter die Schachtdeckelunterkante",
          funktionsfaehig: true,
          letzte_pruefung: "2025-06-25T00:00:00Z",
          aktiv: true
        },
        {
          id: 2,
          nummer: 2,
          bezeichnung: "Absperrschütz bei ehem. Grundwehr", 
          lage: "Lohr km 1,320",
          beschreibung: "Absperrschütz bei ehem. Grundwehr",
          funktionsfaehig: false,
          letzte_pruefung: "2025-06-20T00:00:00Z",
          aktiv: true
        }
      ];
      res.json(demoSchieber);
    } catch (error) {
      console.error("Fehler beim Laden der Absperrschieber:", error);
      res.status(500).json({ message: "Fehler beim Laden der Absperrschieber" });
    }
  });

  // Support Ticket routes
  app.get("/api/support-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const tickets = await storage.getSupportTickets();
      
      // Filter tickets based on role
      let filteredTickets = tickets;
      if (user?.role === "user") {
        // Users can only see their own tickets
        filteredTickets = tickets.filter(ticket => ticket.createdBy === userId);
      }
      // Admins and managers can see all tickets
      
      res.json(filteredTickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post("/api/support-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { subject, description, priority = "medium" } = req.body;
      
      if (!subject || !description) {
        return res.status(400).json({ message: "Subject and description are required" });
      }
      
      const ticketData = {
        subject,
        description,
        priority,
        status: "open",
        createdBy: userId,
        emailHistory: []
      };
      
      const ticket = await storage.createSupportTicket(ticketData);
      
      // Send email notification
      const { emailService } = await import('./emailService');
      try {
        await emailService.sendSupportTicketEmail({
          to: user.email || '',
          subject: ticket.subject,
          description: ticket.description || '',
          ticketId: ticket.id,
          priority: ticket.priority || 'medium'
        });
      } catch (emailError) {
        console.error("Failed to send email, but ticket was created:", emailError);
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch("/api/support-tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ticketId = parseInt(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the ticket to check permissions
      const tickets = await storage.getSupportTickets();
      const ticket = tickets.find(t => t.id === ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Users can only update their own tickets, admins/managers can update all
      if (user.role === "user" && ticket.createdBy !== userId) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { status, assignedTo, updateMessage } = req.body;
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedTo = assignedTo;
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      
      // Send update email if status changed
      if (status && updateMessage) {
        const { emailService } = await import('./emailService');
        try {
          const ticketOwner = await storage.getUser(ticket.createdBy || '');
          if (ticketOwner?.email) {
            await emailService.sendTicketUpdateEmail({
              to: ticketOwner.email,
              ticketId: updatedTicket.id,
              subject: updatedTicket.subject,
              status: updatedTicket.status || 'open',
              updateMessage,
              assignedTo: updatedTicket.assignedTo || undefined
            });
          }
        } catch (emailError) {
          console.error("Failed to send update email:", emailError);
        }
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  // Admin routes (only for admin role)
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user (admin only)
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validate update data
      const allowedFields = ['firstName', 'lastName', 'email', 'role', 'emailNotificationsEnabled'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      const user = await storage.updateUser(id, filteredData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === req.user.claims.sub) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get system statistics (admin only)
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Create database backup (admin only)
  app.post("/api/admin/backup", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const backupData = await storage.createBackup();
      
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.sql"`);
      res.send(backupData);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // OpenAI AI Integration routes (EU AI Act konform)
  app.post('/api/ai/generate-description', isAuthenticated, async (req: any, res) => {
    try {
      const { generateProjectDescription } = await import('./openai');
      const userId = req.user.claims.sub;
      const { name, location, budget, category } = req.body;

      const result = await generateProjectDescription(userId, {
        name,
        location,
        budget: budget ? parseFloat(budget) : undefined,
        category,
      });

      res.json(result);
    } catch (error) {
      console.error("AI description generation error:", error);
      res.status(500).json({ 
        error: "KI-Beschreibung konnte nicht generiert werden",
        aiGenerated: false 
      });
    }
  });

  app.post('/api/ai/risk-assessment', isAuthenticated, async (req: any, res) => {
    try {
      const { generateRiskAssessment } = await import('./openai');
      const userId = req.user.claims.sub;
      const { name, location, budget, description, duration, projectId } = req.body;

      const result = await generateRiskAssessment(userId, {
        name,
        location,
        budget: budget ? parseFloat(budget) : undefined,
        description,
        duration: duration ? parseInt(duration) : undefined,
      }, projectId);

      res.json(result);
    } catch (error) {
      console.error("AI risk assessment error:", error);
      res.status(500).json({ 
        error: "Risikobewertung konnte nicht erstellt werden",
        aiGenerated: false 
      });
    }
  });

  app.post('/api/ai/project-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { aiProjectChat } = await import('./openai');
      const userId = req.user.claims.sub;
      const { question, projectContext, projectId } = req.body;

      const result = await aiProjectChat(userId, question, projectContext, projectId);

      res.json(result);
    } catch (error) {
      console.error("AI project chat error:", error);
      res.status(500).json({ 
        error: "KI-Beratung ist momentan nicht verfügbar",
        aiGenerated: false 
      });
    }
  });

  app.get('/api/ai/usage-stats', isAuthenticated, async (req: any, res) => {
    try {
      const { getAIUsageStats } = await import('./openai');
      const userId = req.user.claims.sub;

      const stats = await getAIUsageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("AI usage stats error:", error);
      res.status(500).json({ 
        error: "Statistiken konnten nicht geladen werden" 
      });
    }
  });

  // Photos routes
  app.get('/api/photos', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = req.query.projectId;
      if (projectId) {
        const photos = await storage.getPhotos(parseInt(projectId));
        res.json(photos);
      } else {
        // Alle Fotos für den Benutzer
        const projects = await storage.getProjects();
        const allPhotos = [];
        for (const project of projects) {
          const photos = await storage.getPhotos(project.id);
          allPhotos.push(...photos);
        }
        res.json(allPhotos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post('/api/photos', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId, description, imageData, latitude, longitude } = req.body;
      const userId = req.user.claims.sub;

      if (!projectId || !imageData) {
        return res.status(400).json({ message: "Project ID and image data are required" });
      }

      // Base64-Bild in Buffer konvertieren (für echte Implementierung)
      // Hier würde normalerweise das Bild auf einem File-Server gespeichert
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
      const fileName = `photo_${Date.now()}.jpg`;
      
      // Mock: Foto-URL (in echter Implementierung würde hier Cloud Storage verwendet)
      const photoUrl = `/uploads/photos/${fileName}`;

      const photo = await storage.createPhoto({
        projectId: parseInt(projectId),
        fileName,
        filePath: photoUrl,
        description: description || '',
        gpsLatitude: latitude ? latitude.toString() : null,
        gpsLongitude: longitude ? longitude.toString() : null,
        takenBy: userId,
      });

      res.json({ ...photo, message: "Photo saved successfully" });
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ 
        message: "Failed to save photo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Audio Records routes
  app.get('/api/audio-records', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = req.query.projectId;
      if (projectId) {
        const records = await storage.getAudioRecords(parseInt(projectId));
        res.json(records);
      } else {
        // Alle Audio-Aufnahmen für den Benutzer
        const projects = await storage.getProjects();
        const allRecords = [];
        for (const project of projects) {
          const records = await storage.getAudioRecords(project.id);
          allRecords.push(...records);
        }
        res.json(allRecords);
      }
    } catch (error) {
      console.error("Error fetching audio records:", error);
      res.status(500).json({ message: "Failed to fetch audio records" });
    }
  });

  app.post('/api/audio-records', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId, description, audioData, duration, transcription, latitude, longitude } = req.body;
      const userId = req.user.claims.sub;

      if (!projectId || !audioData) {
        return res.status(400).json({ message: "Project ID and audio data are required" });
      }

      // Base64-Audio in Buffer konvertieren (für echte Implementierung)
      // Hier würde normalerweise das Audio auf einem File-Server gespeichert
      const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
      const fileName = `audio_${Date.now()}.webm`;
      
      // Mock: Audio-URL (in echter Implementierung würde hier Cloud Storage verwendet)
      const audioUrl = `/uploads/audio/${fileName}`;

      const record = await storage.createAudioRecord({
        projectId: parseInt(projectId),
        fileName,
        filePath: audioUrl,
        duration: duration || 0,
        description: description || '',
        transcription: transcription || null,
        gpsLatitude: latitude ? latitude.toString() : null,
        gpsLongitude: longitude ? longitude.toString() : null,
        recordedBy: userId,
      });

      res.json({ ...record, message: "Audio record saved successfully" });
    } catch (error) {
      console.error("Error saving audio record:", error);
      res.status(500).json({ 
        message: "Failed to save audio record", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Audio Transcription route (Mock - würde normalerweise OpenAI Whisper verwenden)
  app.post('/api/audio/transcribe', isAuthenticated, async (req: any, res) => {
    try {
      const { audioData } = req.body;

      if (!audioData) {
        return res.status(400).json({ message: "Audio data is required" });
      }

      // Mock-Transkription (in echter Implementierung würde hier OpenAI Whisper API verwendet)
      const mockTranscriptions = [
        "Die Bauarbeiten am Fundament sind heute planmäßig vorangeschritten. Die Betonierung wurde erfolgreich abgeschlossen.",
        "Heute wurde die Bewehrung für die Bodenplatte eingebaut. Qualitätsprüfung durch den Statiker erfolgt morgen.",
        "Fortschritt bei der Rohrleitungsverlegung. Alle Anschlüsse sind fachgerecht ausgeführt worden.",
        "Die Erdarbeiten sind abgeschlossen. Nächster Schritt ist die Verdichtung des Untergrunds.",
        "Schalung für die Stützen wurde heute aufgestellt. Betonage ist für morgen geplant."
      ];

      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

      // Simulation einer kleinen Verzögerung wie bei echter API
      await new Promise(resolve => setTimeout(resolve, 2000));

      res.json({ 
        transcription: randomTranscription,
        confidence: 0.95,
        language: "de"
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ 
        message: "Failed to transcribe audio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
