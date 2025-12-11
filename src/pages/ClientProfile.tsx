import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useClients } from "@/contexts/ClientsContext";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import { clientsService } from "@/services/clientsService";
import { subscriptionsService } from "@/services/subscriptionsService";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CredentialsSection } from "@/components/CredentialsSection";
import { MultipleCredentialsManager } from "@/components/MultipleCredentialsManager";
import { EditClientDialog } from "@/components/EditClientDialog";
import { DeleteClientDialog } from "@/components/DeleteClientDialog";
import { SubscriptionsTable } from "@/components/SubscriptionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ClientStatus } from "@/types/client";

const statusColors: Record<ClientStatus, string> = {
  Lead: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Ativo: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Pausado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Encerrado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editClient, deleteClient } = useClients();
  const { addSubscription, addMultipleSubscriptions, editSubscription, deleteSubscription, markAsPaid } = useSubscriptions();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsService.getById(id!),
    enabled: !!id,
  });

  const {
    data: clientSubscriptions = [],
    isLoading: isLoadingSubscriptions,
  } = useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => subscriptionsService.getByClientId(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
            <p className="text-muted-foreground mt-2">
              {error ? "Erro ao carregar cliente" : "O cliente solicitado não existe"}
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Voltar para lista
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                  {client.fullName}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  {client.companyName}
                </p>
              </div>
              <Badge variant="secondary" className={statusColors[client.status]}>
                {client.status}
              </Badge>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive flex-1 sm:flex-none"
              >
                <Trash2 className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Remover</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="personal" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Dados da Empresa</span>
              <span className="sm:hidden">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Mensalidades</span>
              <span className="sm:hidden">Mensalidades</span>
            </TabsTrigger>
            <TabsTrigger value="credentials" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Credenciais da Infra</span>
              <span className="sm:hidden">Credenciais</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Dados de contato e informações do responsável</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-base font-medium">{client.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                  <p className="text-base">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone / WhatsApp</p>
                  <p className="text-base">{client.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cargo / Função</p>
                  <p className="text-base">{client.position}</p>
                </div>
                {client.personalNotes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-base">{client.personalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dados da Empresa */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Dados corporativos e informações do relacionamento</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome da Empresa</p>
                  <p className="text-base font-medium">{client.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                  <p className="text-base">{client.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Segmento</p>
                  <p className="text-base">{client.segment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamanho da Empresa</p>
                  <p className="text-base">{client.companySize}</p>
                </div>
                {client.website && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Site</p>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-accent hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <p className="text-base">
                      {client.address.street}, {client.address.number}
                      <br />
                      {client.address.city} - {client.address.state}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status do Relacionamento</p>
                  <Badge variant="secondary" className={statusColors[client.status]}>
                    {client.status}
                  </Badge>
                </div>
                {client.partnershipStartDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Início da Parceria</p>
                    <p className="text-base">
                      {new Date(client.partnershipStartDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {client.monthlyContractValue && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Mensal do Contrato</p>
                    <p className="text-base font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(client.monthlyContractValue)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mensalidades */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mensalidades</CardTitle>
                <CardDescription>
                  Gerencie as mensalidades e pagamentos deste cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSubscriptions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <SubscriptionsTable
                    subscriptions={clientSubscriptions}
                    clientId={client.id}
                    onAddSubscription={addSubscription}
                    onAddMultipleSubscriptions={addMultipleSubscriptions}
                    onEditSubscription={editSubscription}
                    onDeleteSubscription={deleteSubscription}
                    onMarkAsPaid={markAsPaid}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credenciais */}
          <TabsContent value="credentials" className="space-y-6">
            {/* Credenciais por Número */}
            {client.numberCredentials && client.numberCredentials.length > 0 ? (
              <div className="space-y-4">
                <MultipleCredentialsManager
                  credentials={client.numberCredentials}
                  numberOfPhones={client.numberOfPhones || 1}
                  onUpdate={() => {}}
                  isEditing={false}
                />
              </div>
            ) : client.infraCredentials ? (
              /* Credenciais Antigas (Compatibilidade) */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Credenciais da Infraestrutura (Sistema Antigo)</h3>
                <CredentialsSection 
                  credentials={client.infraCredentials}
                  isEditing={false}
                  onUpdate={() => {}}
                />
              </div>
            ) : (
              /* Caso não tenha credenciais */
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma credencial cadastrada ainda.</p>
                <p>Edite o cliente para adicionar credenciais por número.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <EditClientDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          client={client || null}
          onSave={(updatedClient) => {
            // Remover campos que não devem ser atualizados
            const { id, createdAt, updatedAt, ...clientData } = updatedClient;
            editClient(id, clientData);
            setIsEditDialogOpen(false);
          }}
        />

        <DeleteClientDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          client={client || null}
          onConfirm={(id) => {
            deleteClient(id);
            navigate("/");
          }}
        />
      </div>
    </Layout>
  );
}
