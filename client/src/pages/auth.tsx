import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Network className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bau-Structura</h1>
          <p className="text-gray-100">Tiefbau Projektmanagement</p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Anmelden" : "Registrieren"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" placeholder="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" placeholder="Mustermann" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input id="email" type="email" placeholder="ihre@email.de" />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="role">Rolle auswählen</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Rolle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Benutzer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            
            {isLogin ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    Angemeldet bleiben
                  </Label>
                </div>
                <Button variant="link" className="text-sm">
                  Passwort vergessen?
                </Button>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  Ich akzeptiere die{" "}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Datenschutzerklärung
                  </Button>
                  {" "}und{" "}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    AGB
                  </Button>
                </Label>
              </div>
            )}
            
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => window.location.href = '/api/login'}
            >
              {isLogin ? "Anmelden" : "Konto erstellen"}
            </Button>
            
            <div className="text-center">
              <p className="text-gray-600">
                {isLogin ? "Noch kein Konto? " : "Bereits registriert? "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Registrieren" : "Anmelden"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
