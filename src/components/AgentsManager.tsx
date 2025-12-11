import { useState } from "react";
import { Agent } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Bot, Copy, Edit3, Save, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AgentsManagerProps {
  agents: Agent[];
  onUpdate: (agents: Agent[]) => void;
  isEditing?: boolean;
  numberDisplayName?: string;
}

export function AgentsManager({
  agents,
  onUpdate,
  isEditing = false,
  numberDisplayName = "Número",
}: AgentsManagerProps) {
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    prompt: "",
    isActive: true,
    priority: 1,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const addAgent = () => {
    if (!newAgent.name.trim() || !newAgent.prompt.trim()) {
      toast.error("Nome e prompt são obrigatórios!");
      return;
    }

    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name.trim(),
      description: newAgent.description.trim() || undefined,
      prompt: newAgent.prompt.trim(),
      isActive: newAgent.isActive,
      priority: newAgent.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdate([...agents, agent]);
    setNewAgent({ name: "", description: "", prompt: "", isActive: true, priority: 1 });
    setIsAddDialogOpen(false);
    toast.success("Agente adicionado com sucesso!");
  };

  const updateAgent = (agentId: string, field: keyof Agent, value: any) => {
    const updatedAgents = agents.map((agent) =>
      agent.id === agentId
        ? { ...agent, [field]: value, updatedAt: new Date().toISOString() }
        : agent
    );
    onUpdate(updatedAgents);
  };

  const removeAgent = (agentId: string) => {
    const updatedAgents = agents.filter((agent) => agent.id !== agentId);
    onUpdate(updatedAgents);
    toast.success("Agente removido com sucesso!");
  };

  const duplicateAgent = (agent: Agent) => {
    const duplicatedAgent: Agent = {
      ...agent,
      id: `agent-${Date.now()}`,
      name: `${agent.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdate([...agents, duplicatedAgent]);
    toast.success("Agente duplicado com sucesso!");
  };

  if (!isEditing && agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes de IA - {numberDisplayName}
          </CardTitle>
          <CardDescription>Nenhum agente configurado ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes de IA - {numberDisplayName}
          </h4>
          <p className="text-sm text-muted-foreground">
            Configure diferentes agentes com prompts personalizados para cada setor
          </p>
        </div>
        {isEditing && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Agente de IA</DialogTitle>
                <DialogDescription>
                  Crie um novo agente com prompt personalizado para este número
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Agente</Label>
                    <Input
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="Ex: Vendas, Suporte, Financeiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newAgent.priority}
                      onChange={(e) => setNewAgent({ ...newAgent, priority: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição (Opcional)</Label>
                  <Input
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    placeholder="Descreva o que este agente faz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prompt do Agente</Label>
                  <Textarea
                    value={newAgent.prompt}
                    onChange={(e) => setNewAgent({ ...newAgent, prompt: e.target.value })}
                    placeholder="Digite o prompt personalizado para este agente..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newAgent.isActive}
                    onCheckedChange={(checked) => setNewAgent({ ...newAgent, isActive: checked })}
                  />
                  <Label>Agente ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addAgent}>Adicionar Agente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {agents
          .sort((a, b) => (a.priority || 1) - (b.priority || 1))
          .map((agent) => (
            <Card key={agent.id} className={!agent.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      {agent.priority && (
                        <Badge variant="outline">Prioridade {agent.priority}</Badge>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateAgent(agent)}
                        title="Duplicar agente"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAgent(editingAgent === agent.id ? null : agent.id)}
                      >
                        {editingAgent === agent.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Agente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o agente "{agent.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeAgent(agent.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                {agent.description && (
                  <CardDescription>{agent.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingAgent === agent.id ? (
                  /* Modo de Edição */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Agente</Label>
                        <Input
                          value={agent.name}
                          onChange={(e) => updateAgent(agent.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={agent.priority || 1}
                          onChange={(e) => updateAgent(agent.id, "priority", parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={agent.description || ""}
                        onChange={(e) => updateAgent(agent.id, "description", e.target.value)}
                        placeholder="Descreva o que este agente faz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prompt do Agente</Label>
                      <Textarea
                        value={agent.prompt}
                        onChange={(e) => updateAgent(agent.id, "prompt", e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={agent.isActive}
                        onCheckedChange={(checked) => updateAgent(agent.id, "isActive", checked)}
                      />
                      <Label>Agente ativo</Label>
                    </div>
                  </div>
                ) : (
                  /* Modo de Visualização */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Prompt do Agente</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(agent.prompt, "Prompt")}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {agent.prompt}
                        </pre>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Criado em: {new Date(agent.createdAt).toLocaleString("pt-BR")}
                      {agent.updatedAt !== agent.createdAt && (
                        <> • Atualizado em: {new Date(agent.updatedAt).toLocaleString("pt-BR")}</>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {agents.length === 0 && isEditing && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agente configurado</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Adicione agentes de IA com prompts personalizados para diferentes setores
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Agente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
