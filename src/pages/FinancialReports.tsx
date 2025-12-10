import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { subscriptionsService } from "@/services/subscriptionsService";
import { paymentHistoryService } from "@/services/paymentHistoryService";
import { clientsService } from "@/services/clientsService";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FinancialReports() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptionsService.getAll(),
  });

  // Buscar clientes para exibir nomes
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.getAll(),
  });

  // Buscar histórico de pagamentos para cálculos mais precisos
  const { data: allPaymentHistory = [] } = useQuery({
    queryKey: ["allPaymentHistory"],
    queryFn: async () => {
      const allHistory = await Promise.all(
        subscriptions.map((sub) => paymentHistoryService.getBySubscriptionId(sub.id))
      );
      return allHistory.flat();
    },
    enabled: subscriptions.length > 0,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Cálculos
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);
  const next30Days = new Date(today);
  next30Days.setDate(today.getDate() + 30);

  // Calcular total recebido no mês (apenas valores pagos)
  // Inclui: mensalidades pagas + pagamentos iniciais pagos + histórico de pagamentos
  const paidThisMonth = (() => {
    let total = 0;

    // 1. Mensalidades pagas este mês
    const paidSubscriptions = subscriptions.filter((sub) => {
      if (sub.status !== "Pago" || !sub.paymentDate) return false;
      const paymentDate = new Date(sub.paymentDate);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });
    total += paidSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    // 2. Pagamentos iniciais pagos este mês
    const initialPayments = subscriptions.filter((sub) => {
      if (!sub.initialPaymentPaid || !sub.initialPaymentAmount) return false;
      const createdDate = new Date(sub.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    });
    total += initialPayments.reduce((sum, sub) => sum + (sub.initialPaymentAmount || 0), 0);

    // 3. Histórico de pagamentos deste mês
    const historyThisMonth = allPaymentHistory.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });
    total += historyThisMonth.reduce((sum, payment) => sum + payment.amount, 0);

    return total;
  })();

  const pending = subscriptions
    .filter((sub) => sub.status === "Pendente" || sub.status === "Atrasado")
    .reduce((sum, sub) => sum + sub.amount, 0);

  const overdue = subscriptions
    .filter((sub) => sub.status === "Atrasado")
    .reduce((sum, sub) => sum + sub.amount, 0);

  const nextMonthExpected = subscriptions
    .filter((sub) => {
      if (sub.status === "Pago" || sub.status === "Cancelado") return false;
      const dueDate = new Date(sub.dueDate);
      return (
        dueDate >= nextMonth &&
        dueDate.getMonth() === nextMonth.getMonth() &&
        dueDate.getFullYear() === nextMonth.getFullYear()
      );
    })
    .reduce((sum, sub) => sum + sub.amount, 0);

  const next7DaysDue = subscriptions
    .filter((sub) => {
      if (sub.status === "Pago" || sub.status === "Cancelado") return false;
      const dueDate = new Date(sub.dueDate);
      return dueDate >= today && dueDate <= next7Days;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const next30DaysDue = subscriptions
    .filter((sub) => {
      if (sub.status === "Pago" || sub.status === "Cancelado") return false;
      const dueDate = new Date(sub.dueDate);
      return dueDate >= today && dueDate <= next30Days;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Skeleton className="h-9 w-48 mb-8" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Visão geral das finanças e previsões de recebimento
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Recebido (Mês Atual)</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(paidThisMonth)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Pendente</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {formatCurrency(pending)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Atrasado</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(overdue)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Previsto Próximo Mês</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {formatCurrency(nextMonthExpected)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimentos (7 dias)</CardTitle>
              <CardDescription>
                Mensalidades que vencerão nos próximos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {next7DaysDue.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum vencimento nos próximos 7 dias
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {next7DaysDue.map((sub) => {
                      const client = clients.find((c: Client) => c.id === sub.clientId);
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {client?.fullName || `Cliente ID: ${sub.clientId.slice(0, 8)}`}
                          </TableCell>
                          <TableCell>{formatCurrency(sub.amount)}</TableCell>
                          <TableCell>{formatDate(sub.dueDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                sub.status === "Atrasado"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {sub.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimentos (30 dias)</CardTitle>
              <CardDescription>
                Mensalidades que vencerão nos próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {next30DaysDue.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum vencimento nos próximos 30 dias
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {next30DaysDue.map((sub) => {
                        const client = clients.find((c: Client) => c.id === sub.clientId);
                        return (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                              {client?.fullName || `Cliente ID: ${sub.clientId.slice(0, 8)}`}
                            </TableCell>
                            <TableCell>{formatCurrency(sub.amount)}</TableCell>
                            <TableCell>{formatDate(sub.dueDate)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  sub.status === "Atrasado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {sub.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

