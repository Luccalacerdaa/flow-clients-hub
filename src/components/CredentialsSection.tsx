import { useState } from "react";
import { InfraCredentials } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface CredentialsSectionProps {
  credentials?: InfraCredentials;
  isEditing: boolean;
  onUpdate?: (credentials: InfraCredentials) => void;
}

export function CredentialsSection({ credentials, isEditing, onUpdate }: CredentialsSectionProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [localCredentials, setLocalCredentials] = useState<InfraCredentials>(
    credentials || {
      notes: "",
    }
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (section: string, field: string, value: string) => {
    const updated = { ...localCredentials };
    
    if (section === "n8n") {
      updated.n8n = { ...(updated.n8n || { adminUrl: "", email: "", password: "" }), [field]: value };
    } else if (section === "cloudfy") {
      updated.cloudfy = { ...(updated.cloudfy || { url: "", email: "", password: "" }), [field]: value };
    } else if (section === "evolution") {
      updated.evolution = { ...(updated.evolution || { managerUrl: "", apiKey: "" }), [field]: value };
    } else if (section === "supabase") {
      updated.supabase = { ...(updated.supabase || { projectUrl: "", anonKey: "" }), [field]: value };
    } else if (section === "chatgpt") {
      updated.chatgpt = { ...(updated.chatgpt || { apiKey: "" }), [field]: value };
    }
    
    setLocalCredentials(updated);
    if (onUpdate) onUpdate(updated);
  };

  // Verificar se há alguma credencial cadastrada
  const hasCredentials = credentials && (
    credentials.n8n ||
    credentials.cloudfy ||
    credentials.evolution ||
    credentials.supabase ||
    credentials.chatgpt
  );

  if (!hasCredentials && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credenciais da Infraestrutura</CardTitle>
          <CardDescription>Nenhuma credencial cadastrada ainda. Edite o cliente para adicionar credenciais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* n8n */}
      {credentials?.n8n && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-semibold">
                n8n
              </div>
              n8n
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Admin URL</Label>
            {isEditing ? (
              <Input
                value={localCredentials.n8n.adminUrl}
                onChange={(e) => handleChange("n8n", "adminUrl", e.target.value)}
                placeholder="https://n8n-cliente.flowtech.cloud"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.n8n?.adminUrl || ""} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.n8n?.adminUrl || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={localCredentials.n8n?.email || ""}
                onChange={(e) => handleChange("n8n", "email", e.target.value)}
                placeholder="admin@cliente.com"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.n8n?.email || ""} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.n8n?.email || "", "Email")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            {isEditing ? (
              <Input
                type={showPasswords["n8n"] ? "text" : "password"}
                value={localCredentials.n8n?.password || ""}
                onChange={(e) => handleChange("n8n", "password", e.target.value)}
                placeholder="••••••••"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["n8n"] ? "text" : "password"}
                  value={credentials?.n8n?.password || ""}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => togglePasswordVisibility("n8n")}
                >
                  {showPasswords["n8n"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.n8n?.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cloudfy */}
      {credentials?.cloudfy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-semibold">
                CF
              </div>
              Cloudfy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.cloudfy.url || ""} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.cloudfy?.url || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.cloudfy.email || ""} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.cloudfy?.email || "", "Email")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["cloudfy"] ? "text" : "password"}
                  value={credentials.cloudfy.password || ""}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => togglePasswordVisibility("cloudfy")}
                >
                  {showPasswords["cloudfy"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.cloudfy?.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution API */}
      {credentials?.evolution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-semibold">
                EVO
              </div>
              Evolution API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Manager URL</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.evolution.managerUrl || ""} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.evolution?.managerUrl || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.evolution.apiKey || ""} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.evolution?.apiKey || "", "API Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {credentials.evolution.instanceName && (
              <div className="space-y-2">
                <Label>Nome da Instância</Label>
                <Input value={credentials.evolution.instanceName} readOnly />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supabase */}
      {credentials?.supabase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-semibold">
                SB
              </div>
              Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project URL</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.supabase.projectUrl || ""} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.supabase?.projectUrl || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Anon Key</Label>
              <div className="flex items-center gap-2">
                <Input value={credentials.supabase.anonKey || ""} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.supabase?.anonKey || "", "Anon Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {credentials.supabase.serviceRoleKey && (
              <div className="space-y-2">
                <Label>Service Role Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPasswords["supabase"] ? "text" : "password"}
                    value={credentials.supabase.serviceRoleKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => togglePasswordVisibility("supabase")}
                  >
                    {showPasswords["supabase"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials.supabase?.serviceRoleKey || "", "Service Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ChatGPT */}
      {credentials?.chatgpt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-semibold">
                GPT
              </div>
              ChatGPT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["chatgpt"] ? "text" : "password"}
                  value={credentials.chatgpt.apiKey || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => togglePasswordVisibility("chatgpt")}
                >
                  {showPasswords["chatgpt"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.chatgpt?.apiKey || "", "API Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {credentials.chatgpt.organizationId && (
              <div className="space-y-2">
                <Label>Organization ID</Label>
                <div className="flex items-center gap-2">
                  <Input value={credentials.chatgpt.organizationId} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials.chatgpt?.organizationId || "", "Org ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações da Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={localCredentials.notes || ""}
              onChange={(e) => setLocalCredentials({ ...localCredentials, notes: e.target.value })}
              placeholder="Adicione observações sobre a infraestrutura..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {credentials?.notes || "Nenhuma observação cadastrada."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
