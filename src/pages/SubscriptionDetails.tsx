import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscriptionsService";
import { paymentHistoryService } from "@/services/paymentHistoryService";
import { clientsService } from "@/services/clientsService";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Pause, Play, Edit, Trash2 } from "lucide-react";
import { PaymentStatus, PaymentMethod } from "@/types/subscription";
import { EditSubscriptionDialog } from "@/components/EditSubscriptionDialog";
import { DeleteSubscriptionDialog } from "@/components/DeleteSubscriptionDialog";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<PaymentStatus, string> = {
  Pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Pago: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Atrasado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Cancelado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  Pausado: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionsService.getById(id!),
    enabled: !!id,
  });

  const { data: client } = useQuery({
    queryKey: ["client", subscription?.clientId],
    queryFn: () => clientsService.getById(subscription!.clientId),
    enabled: !!subscription?.clientId,
  });

  const { data: paymentHistory = [] } = useQuery({
    queryKey: ["paymentHistory", id],
    queryFn: () => paymentHistoryService.getBySubscriptionId(id!),
    enabled: !!id,
  });

  const markAsPaidMutation = useMutation({
    mutationFn: () => subscriptionsService.markAsPaid(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Sucesso",
        description: "Mensalidade marcada como paga!",
      });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => subscriptionsService.pauseRecurrence(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
      toast({
        title: "Sucesso",
        description: "Recorrência pausada!",
      });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => subscriptionsService.resumeRecurrence(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
      toast({
        title: "Sucesso",
        description: "Recorrência reativada!",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!subscription) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Mensalidade não encontrada</h1>
            <Button onClick={() => navigate("/subscriptions")} className="mt-4">
              Voltar para lista
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = subscription.amount - totalPaid;

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Detalhes da Mensalidade</h1>
              <p className="text-muted-foreground">
                {client?.fullName} - {client?.companyName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {subscription.status !== "Pago" && subscription.status !== "Cancelado" && (
              <Button
                variant="outline"
                onClick={() => markAsPaidMutation.mutate()}
                className="text-green-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar como Pago
              </Button>
            )}
            {subscription.isRecurring && (
              <>
                {subscription.isPaused ? (
                  <Button variant="outline" onClick={() => resumeMutation.mutate()}>
                    <Play className="mr-2 h-4 w-4" />
                    Reativar
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => pauseMutation.mutate()}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Mensalidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor</p>
                <p className="text-2xl font-bold">{formatCurrency(subscription.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="secondary" className={statusColors[subscription.status]}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                <p className="text-base">{subscription.category || "Não informado"}</p>
              </div>
              {subscription.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-base">{subscription.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Vencimento</p>
                <p className="text-base">{formatDate(subscription.dueDate)}</p>
              </div>
              {subscription.paymentDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Pagamento</p>
                  <p className="text-base">{formatDate(subscription.paymentDate)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-base">
                  {subscription.isRecurring ? "Recorrente" : "Única"}
                </p>
              </div>
              {subscription.isRecurring && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dia do Vencimento</p>
                    <p className="text-base">Todo dia {subscription.recurrenceDay}</p>
                  </div>
                  {subscription.totalInstallments && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                      <p className="text-base">
                        {subscription.currentInstallment || 1} / {subscription.totalInstallments}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              {subscription.initialPaymentAmount && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagamento Inicial</p>
                  <p className="text-base font-semibold">
                    {formatCurrency(subscription.initialPaymentAmount)}
                  </p>
                  <Badge variant={subscription.initialPaymentPaid ? "default" : "secondary"}>
                    {subscription.initialPaymentPaid ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Registro de todos os pagamentos realizados para esta mensalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum pagamento registrado ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.paymentMethod || "Não informado"}</TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <EditSubscriptionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          subscription={subscription}
          onSave={async (id, data) => {
            await subscriptionsService.update(id, data);
            queryClient.invalidateQueries({ queryKey: ["subscription", id] });
            setIsEditDialogOpen(false);
          }}
        />

        <DeleteSubscriptionDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          subscription={subscription}
          onConfirm={async (id) => {
            await subscriptionsService.delete(id);
            navigate("/subscriptions");
          }}
        />
      </div>
    </Layout>
  );
}

