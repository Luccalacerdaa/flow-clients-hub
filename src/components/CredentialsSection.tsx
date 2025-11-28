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
      n8n: { adminUrl: "", email: "", password: "" },
      evolutionApi: { managerUrl: "", apiKey: "" },
      chatwoot: { adminUrl: "", password: "" },
      redis: { host: "", port: "", user: "", password: "" },
      postgresql: { host: "", port: "", user: "", database: "", password: "" },
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
      updated.n8n = { ...updated.n8n, [field]: value };
    } else if (section === "evolutionApi") {
      updated.evolutionApi = { ...updated.evolutionApi, [field]: value };
    } else if (section === "chatwoot") {
      updated.chatwoot = { ...updated.chatwoot, [field]: value };
    } else if (section === "redis") {
      updated.redis = { ...updated.redis, [field]: value };
    } else if (section === "postgresql") {
      updated.postgresql = { ...updated.postgresql, [field]: value };
    }
    
    setLocalCredentials(updated);
    if (onUpdate) onUpdate(updated);
  };

  if (!credentials && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credenciais da Infraestrutura</CardTitle>
          <CardDescription>Nenhuma credencial cadastrada ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* n8n */}
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
                <Input value={credentials?.n8n.adminUrl} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.n8n.adminUrl || "", "URL")}
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
                value={localCredentials.n8n.email}
                onChange={(e) => handleChange("n8n", "email", e.target.value)}
                placeholder="admin@cliente.com"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.n8n.email} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.n8n.email || "", "Email")}
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
                value={localCredentials.n8n.password}
                onChange={(e) => handleChange("n8n", "password", e.target.value)}
                placeholder="••••••••"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["n8n"] ? "text" : "password"}
                  value={credentials?.n8n.password}
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
                  onClick={() => copyToClipboard(credentials?.n8n.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evolution API */}
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
            {isEditing ? (
              <Input
                value={localCredentials.evolutionApi.managerUrl}
                onChange={(e) => handleChange("evolutionApi", "managerUrl", e.target.value)}
                placeholder="https://evolution-cliente.flowtech.cloud"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.evolutionApi.managerUrl} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.evolutionApi.managerUrl || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            {isEditing ? (
              <Input
                value={localCredentials.evolutionApi.apiKey}
                onChange={(e) => handleChange("evolutionApi", "apiKey", e.target.value)}
                placeholder="evo_1234567890abcdef"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.evolutionApi.apiKey} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.evolutionApi.apiKey || "", "API Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chatwoot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-semibold">
              CW
            </div>
            Chatwoot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Admin URL</Label>
            {isEditing ? (
              <Input
                value={localCredentials.chatwoot.adminUrl}
                onChange={(e) => handleChange("chatwoot", "adminUrl", e.target.value)}
                placeholder="https://chatwoot-cliente.flowtech.cloud"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.chatwoot.adminUrl} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.chatwoot.adminUrl || "", "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Password / Instruções</Label>
            {isEditing ? (
              <Input
                value={localCredentials.chatwoot.password}
                onChange={(e) => handleChange("chatwoot", "password", e.target.value)}
                placeholder="Criar conta no primeiro login"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.chatwoot.password} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.chatwoot.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Redis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-destructive text-destructive-foreground text-sm font-semibold">
              R
            </div>
            Redis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Host</Label>
            {isEditing ? (
              <Input
                value={localCredentials.redis.host}
                onChange={(e) => handleChange("redis", "host", e.target.value)}
                placeholder="redis-cliente.flowtech.cloud"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.redis.host} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.redis.host || "", "Host")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            {isEditing ? (
              <Input
                value={localCredentials.redis.port}
                onChange={(e) => handleChange("redis", "port", e.target.value)}
                placeholder="6379"
              />
            ) : (
              <Input value={credentials?.redis.port} readOnly />
            )}
          </div>
          <div className="space-y-2">
            <Label>User</Label>
            {isEditing ? (
              <Input
                value={localCredentials.redis.user}
                onChange={(e) => handleChange("redis", "user", e.target.value)}
                placeholder="cliente"
              />
            ) : (
              <Input value={credentials?.redis.user} readOnly />
            )}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            {isEditing ? (
              <Input
                type={showPasswords["redis"] ? "text" : "password"}
                value={localCredentials.redis.password}
                onChange={(e) => handleChange("redis", "password", e.target.value)}
                placeholder="••••••••"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["redis"] ? "text" : "password"}
                  value={credentials?.redis.password}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => togglePasswordVisibility("redis")}
                >
                  {showPasswords["redis"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.redis.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PostgreSQL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-semibold">
              PG
            </div>
            PostgreSQL
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Host</Label>
            {isEditing ? (
              <Input
                value={localCredentials.postgresql.host}
                onChange={(e) => handleChange("postgresql", "host", e.target.value)}
                placeholder="postgres-cliente.flowtech.cloud"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input value={credentials?.postgresql.host} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.postgresql.host || "", "Host")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            {isEditing ? (
              <Input
                value={localCredentials.postgresql.port}
                onChange={(e) => handleChange("postgresql", "port", e.target.value)}
                placeholder="5432"
              />
            ) : (
              <Input value={credentials?.postgresql.port} readOnly />
            )}
          </div>
          <div className="space-y-2">
            <Label>User</Label>
            {isEditing ? (
              <Input
                value={localCredentials.postgresql.user}
                onChange={(e) => handleChange("postgresql", "user", e.target.value)}
                placeholder="cliente"
              />
            ) : (
              <Input value={credentials?.postgresql.user} readOnly />
            )}
          </div>
          <div className="space-y-2">
            <Label>Database</Label>
            {isEditing ? (
              <Input
                value={localCredentials.postgresql.database}
                onChange={(e) => handleChange("postgresql", "database", e.target.value)}
                placeholder="cliente_db"
              />
            ) : (
              <Input value={credentials?.postgresql.database} readOnly />
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Password</Label>
            {isEditing ? (
              <Input
                type={showPasswords["postgresql"] ? "text" : "password"}
                value={localCredentials.postgresql.password}
                onChange={(e) => handleChange("postgresql", "password", e.target.value)}
                placeholder="••••••••"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={showPasswords["postgresql"] ? "text" : "password"}
                  value={credentials?.postgresql.password}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => togglePasswordVisibility("postgresql")}
                >
                  {showPasswords["postgresql"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.postgresql.password || "", "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
