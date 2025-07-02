import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { PageHeader } from "../components/layout/page-header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import type { Customer } from "../shared/schema";

const customerFormSchema = z.object({
  name: z.string().min(1, "Kundenname ist erforderlich"),
  email: z.string().min(1, "E-Mail ist erforderlich").email("Gültige E-Mail-Adresse eingeben"),
  phone: z.string().min(1, "Telefon ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  houseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
  postalCode: z.string().min(1, "PLZ ist erforderlich"),
  city: z.string().min(1, "Ort ist erforderlich"),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return await apiRequest("/api/customers", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Kunde erstellt",
        description: "Der neue Kunde wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Kunde konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerFormData }) => {
      return await apiRequest(`/api/customers/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Kunde aktualisiert",
        description: "Die Kundeninformationen wurden erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Kunde konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      street: customer.street || "",
      houseNumber: customer.houseNumber || "",
      postalCode: customer.postalCode || "",
      city: customer.city || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.id.toString().includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Kunden...</p>
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
              <h1 className="font-semibold text-gray-900">Kunden</h1>
              <p className="text-xs text-gray-600">Alle Kunden verwalten</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Kunde hinzufügen
          </Button>
        </div>
      </PageHeader>

      {/* Search */}
      <div className="p-4 bg-gray-50">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nach Name, ID, E-Mail oder Telefon suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="p-4 space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Keine Kunden gefunden</p>
            <p className="text-gray-400 text-sm">Erstellen Sie Ihren ersten Kunden</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <p className="text-sm text-gray-500">Kunden-ID: {customer.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {customer.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">E-Mail</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Telefon</p>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {(customer.street || customer.city) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Adresse</p>
                        <p className="font-medium">
                          {customer.street && customer.houseNumber && customer.postalCode && customer.city 
                            ? `${customer.street} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}`
                            : `${customer.street || ''} ${customer.houseNumber || ''}, ${customer.postalCode || ''} ${customer.city || ''}`.trim()
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Kunde bearbeiten" : "Neuen Kunden erstellen"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kundenname *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="max@mustermann.de" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon *</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 123 456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Straße *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Hauptstraße" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hausnummer *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 123a" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLZ *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ort *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Musterstadt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {editingCustomer ? "Aktualisieren" : "Erstellen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}