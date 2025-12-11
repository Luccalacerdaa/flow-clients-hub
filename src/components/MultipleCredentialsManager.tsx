import { useState } from "react";
import { NumberCredentials } from "@/types/client";
import { Button } from "@/components/ui/button";
import { AgentsManager } from "./AgentsManager";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2, Phone, Edit3, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MultipleCredentialsManagerProps {
  credentials: NumberCredentials[];
  numberOfPhones: number;
  onUpdate: (credentials: NumberCredentials[]) => void;
  isEditing?: boolean;
}

export function MultipleCredentialsManager({
  credentials,
  numberOfPhones,
  onUpdate,
  isEditing = false,
}: MultipleCredentialsManagerProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("0");
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  // Garantir que temos credenciais para todos os números
  const ensureCredentials = () => {
    const updatedCredentials = [...credentials];
    
    for (let i = 0; i < numberOfPhones; i++) {
      if (!updatedCredentials[i]) {
        updatedCredentials[i] = {
          id: `number-${i + 1}`,
          phoneNumber: "",
          instanceName: `instancia-${i + 1}`,
        };
      }
    }
    
    // Remove credenciais extras se o número diminuiu
    if (updatedCredentials.length > numberOfPhones) {
      updatedCredentials.splice(numberOfPhones);
    }
    
    return updatedCredentials;
  };

  const currentCredentials = ensureCredentials();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleFieldEditing = (fieldKey: string) => {
    setEditingFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const isFieldEditing = (fieldKey: string) => {
    return editingFields[fieldKey] || false;
  };

  const updateCredential = (index: number, field: string, value: any) => {
    const updated = [...currentCredentials];
    const credential = updated[index];
    
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      if (!credential[section as keyof NumberCredentials]) {
        (credential as any)[section] = {};
      }
      (credential as any)[section][subField] = value;
    } else {
      (credential as any)[field] = value;
    }
    
    onUpdate(updated);
  };

  const addCredentialSet = () => {
    const newCredential: NumberCredentials = {
      id: `number-${currentCredentials.length + 1}`,
      phoneNumber: "",
      instanceName: `instancia-${currentCredentials.length + 1}`,
    };
    onUpdate([...currentCredentials, newCredential]);
  };

  const removeCredentialSet = (index: number) => {
    const updated = currentCredentials.filter((_, i) => i !== index);
    onUpdate(updated);
    if (activeTab === index.toString() && updated.length > 0) {
      setActiveTab("0");
    }
  };

  if (!isEditing && currentCredentials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credenciais por Número</CardTitle>
          <CardDescription>Nenhuma credencial cadastrada ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Credenciais por Número</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as credenciais específicas para cada número do WhatsApp
          </p>
        </div>
        {isEditing && (
          <Button onClick={addCredentialSet} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Número
          </Button>
        )}
      </div>

      {currentCredentials.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(currentCredentials.length, 4)}, 1fr)` }}>
            {currentCredentials.slice(0, 4).map((cred, index) => (
              <TabsTrigger key={cred.id} value={index.toString()} className="gap-2">
                <Phone className="h-3 w-3" />
                {cred.displayName || cred.phoneNumber || `Número ${index + 1}`}
              </TabsTrigger>
            ))}
            {currentCredentials.length > 4 && (
              <TabsTrigger value="more">+{currentCredentials.length - 4}</TabsTrigger>
            )}
          </TabsList>

          {currentCredentials.map((credential, index) => (
            <TabsContent key={credential.id} value={index.toString()} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {credential.displayName || credential.phoneNumber || `Número ${index + 1}`}
                      </CardTitle>
                      <CardDescription>
                        {credential.phoneNumber && credential.displayName && (
                          <div>{credential.phoneNumber}</div>
                        )}
                        <div>Instância: {credential.instanceName}</div>
                        {credential.description && (
                          <div className="text-xs text-muted-foreground mt-1">{credential.description}</div>
                        )}
                      </CardDescription>
                    </div>
                    {isEditing && currentCredentials.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Credenciais</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover as credenciais do {credential.phoneNumber || `Número ${index + 1}`}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeCredentialSet(index)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número do WhatsApp</Label>
                      {isEditing ? (
                        <Input
                          value={credential.phoneNumber}
                          onChange={(e) => updateCredential(index, "phoneNumber", e.target.value)}
                          placeholder="+55 11 99999-9999"
                        />
                      ) : (
                        <Input value={credential.phoneNumber || "Não informado"} readOnly />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Instância</Label>
                      {isEditing ? (
                        <Input
                          value={credential.instanceName}
                          onChange={(e) => updateCredential(index, "instanceName", e.target.value)}
                          placeholder="instancia-1"
                        />
                      ) : (
                        <Input value={credential.instanceName} readOnly />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Nome de Identificação</Label>
                      {isEditing || isFieldEditing(`displayName-${index}`) ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={credential.displayName || ""}
                            onChange={(e) => updateCredential(index, "displayName", e.target.value)}
                            placeholder="Ex: Vendas, Suporte, Marketing"
                            onBlur={() => toggleFieldEditing(`displayName-${index}`)}
                            autoFocus={isFieldEditing(`displayName-${index}`)}
                          />
                          {!isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => toggleFieldEditing(`displayName-${index}`)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input value={credential.displayName || "Não informado"} readOnly />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => toggleFieldEditing(`displayName-${index}`)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição do Uso</Label>
                      {isEditing || isFieldEditing(`description-${index}`) ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={credential.description || ""}
                            onChange={(e) => updateCredential(index, "description", e.target.value)}
                            placeholder="Para que será usado este número"
                            onBlur={() => toggleFieldEditing(`description-${index}`)}
                            autoFocus={isFieldEditing(`description-${index}`)}
                          />
                          {!isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => toggleFieldEditing(`description-${index}`)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input value={credential.description || "Não informado"} readOnly />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => toggleFieldEditing(`description-${index}`)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* n8n */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground text-xs font-semibold">
                        n8n
                      </div>
                      <h4 className="font-semibold">n8n</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Admin URL</Label>
                        {isEditing ? (
                          <Input
                            value={credential.n8n?.adminUrl || ""}
                            onChange={(e) => updateCredential(index, "n8n.adminUrl", e.target.value)}
                            placeholder="https://n8n-cliente.flowtech.cloud"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.n8n?.adminUrl || ""} readOnly />
                            {credential.n8n?.adminUrl && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.n8n?.adminUrl || "", "URL")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={credential.n8n?.email || ""}
                            onChange={(e) => updateCredential(index, "n8n.email", e.target.value)}
                            placeholder="admin@cliente.com"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.n8n?.email || ""} readOnly />
                            {credential.n8n?.email && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.n8n?.email || "", "Email")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type={showPasswords[`n8n-${index}`] ? "text" : "password"}
                              value={credential.n8n?.password || ""}
                              onChange={(e) => updateCredential(index, "n8n.password", e.target.value)}
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => togglePasswordVisibility(`n8n-${index}`)}
                            >
                              {showPasswords[`n8n-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type={showPasswords[`n8n-${index}`] ? "text" : "password"}
                              value={credential.n8n?.password || ""}
                              readOnly
                            />
                            {credential.n8n?.password && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => togglePasswordVisibility(`n8n-${index}`)}
                                >
                                  {showPasswords[`n8n-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyToClipboard(credential.n8n?.password || "", "Password")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evolution API */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground text-xs font-semibold">
                        EVO
                      </div>
                      <h4 className="font-semibold">Evolution API</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Manager URL</Label>
                        {isEditing ? (
                          <Input
                            value={credential.evolution?.managerUrl || ""}
                            onChange={(e) => updateCredential(index, "evolution.managerUrl", e.target.value)}
                            placeholder="https://evolution-cliente.flowtech.cloud"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.evolution?.managerUrl || ""} readOnly />
                            {credential.evolution?.managerUrl && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.evolution?.managerUrl || "", "URL")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        {isEditing ? (
                          <Input
                            value={credential.evolution?.apiKey || ""}
                            onChange={(e) => updateCredential(index, "evolution.apiKey", e.target.value)}
                            placeholder="evo_1234567890abcdef"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.evolution?.apiKey || ""} readOnly className="font-mono text-sm" />
                            {credential.evolution?.apiKey && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.evolution?.apiKey || "", "API Key")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Supabase */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-green-600 text-white text-xs font-semibold">
                        SB
                      </div>
                      <h4 className="font-semibold">Supabase</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Project URL</Label>
                        {isEditing ? (
                          <Input
                            value={credential.supabase?.projectUrl || ""}
                            onChange={(e) => updateCredential(index, "supabase.projectUrl", e.target.value)}
                            placeholder="https://xxx.supabase.co"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.supabase?.projectUrl || ""} readOnly />
                            {credential.supabase?.projectUrl && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.supabase?.projectUrl || "", "Project URL")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Anon Key</Label>
                        {isEditing ? (
                          <Input
                            value={credential.supabase?.anonKey || ""}
                            onChange={(e) => updateCredential(index, "supabase.anonKey", e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.supabase?.anonKey || ""} readOnly className="font-mono text-sm" />
                            {credential.supabase?.anonKey && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.supabase?.anonKey || "", "Anon Key")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Service Role Key (Opcional)</Label>
                        {isEditing ? (
                          <Input
                            value={credential.supabase?.serviceRoleKey || ""}
                            onChange={(e) => updateCredential(index, "supabase.serviceRoleKey", e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.supabase?.serviceRoleKey || ""} readOnly className="font-mono text-sm" />
                            {credential.supabase?.serviceRoleKey && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.supabase?.serviceRoleKey || "", "Service Role Key")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ChatGPT */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-white text-xs font-semibold">
                        AI
                      </div>
                      <h4 className="font-semibold">ChatGPT</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Link do Chat</Label>
                        {isEditing ? (
                          <Input
                            value={credential.chatgpt?.chatLink || ""}
                            onChange={(e) => updateCredential(index, "chatgpt.chatLink", e.target.value)}
                            placeholder="https://chat.openai.com/share/..."
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={credential.chatgpt?.chatLink || ""} readOnly />
                            {credential.chatgpt?.chatLink && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => window.open(credential.chatgpt?.chatLink, '_blank')}
                                  title="Abrir chat"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyToClipboard(credential.chatgpt?.chatLink || "", "Link do Chat")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição do Chat (Opcional)</Label>
                        {isEditing ? (
                          <Input
                            value={credential.chatgpt?.description || ""}
                            onChange={(e) => updateCredential(index, "chatgpt.description", e.target.value)}
                            placeholder="Descreva o prompt/chat usado"
                          />
                        ) : (
                          <Input value={credential.chatgpt?.description || "Não informado"} readOnly />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Agentes de IA */}
                  <div className="space-y-4">
                    <AgentsManager
                      agents={credential.agents || []}
                      onUpdate={(agents) => updateCredential(index, "agents", agents)}
                      isEditing={isEditing}
                      numberDisplayName={credential.displayName || credential.phoneNumber || `Número ${index + 1}`}
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label>Observações Gerais</Label>
                    {isEditing ? (
                      <Textarea
                        value={credential.notes || ""}
                        onChange={(e) => updateCredential(index, "notes", e.target.value)}
                        placeholder="Observações específicas para este número..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                        {credential.notes || "Nenhuma observação cadastrada."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
