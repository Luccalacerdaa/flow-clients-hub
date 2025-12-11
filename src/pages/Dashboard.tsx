import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { subscriptionsService } from "@/services/subscriptionsService";
import { clientsService } from "@/services/clientsService";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import { Subscription } from "@/types/subscription";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";

interface PaymentEvent {
  date: Date;
  subscriptions: Array<{
    subscription: Subscription;
    client: Client;
  }>;
  totalAmount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<Date>(today);

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptionsService.getAll(),
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.getAll(),
  });

  const isLoading = subscriptionsLoading || clientsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Agrupar pagamentos por data
  const getPaymentsByDate = (): Map<string, PaymentEvent> => {
    const paymentsMap = new Map<string, PaymentEvent>();

    subscriptions.forEach((subscription) => {
      if (subscription.status === "Cancelado" || subscription.status === "Pago") {
        return;
      }

      const client = clients.find((c: Client) => c.id === subscription.clientId);
      if (!client) return;

      // Para recorrências, calcular próximas datas de vencimento
      if (subscription.isRecurring && subscription.recurrenceDay) {
        const startDate = parseISO(subscription.startDate);
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        
        // Calcular todas as datas de vencimento no mês
        let currentDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), subscription.recurrenceDay);
        
        // Se a data já passou, ir para o próximo mês
        if (currentDate < today) {
          currentDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, subscription.recurrenceDay);
        }

        // Se está dentro do mês selecionado
        if (currentDate >= monthStart && currentDate <= monthEnd) {
          const dateKey = format(currentDate, "yyyy-MM-dd");
          
          if (!paymentsMap.has(dateKey)) {
            paymentsMap.set(dateKey, {
              date: currentDate,
              subscriptions: [],
              totalAmount: 0,
            });
          }

          const paymentEvent = paymentsMap.get(dateKey)!;
          paymentEvent.subscriptions.push({ subscription, client });
          paymentEvent.totalAmount += subscription.amount;
        }
      } else {
        // Para pagamentos únicos, usar a data de vencimento
        const dueDate = parseISO(subscription.dueDate);
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);

        if (dueDate >= monthStart && dueDate <= monthEnd) {
          const dateKey = format(dueDate, "yyyy-MM-dd");

          if (!paymentsMap.has(dateKey)) {
            paymentsMap.set(dateKey, {
              date: dueDate,
              subscriptions: [],
              totalAmount: 0,
            });
          }

          const paymentEvent = paymentsMap.get(dateKey)!;
          paymentEvent.subscriptions.push({ subscription, client });
          paymentEvent.totalAmount += subscription.amount;
        }
      }
    });

    return paymentsMap;
  };

  const paymentsByDate = getPaymentsByDate();
  const paymentsArray = Array.from(paymentsByDate.values());

  // Calcular totais
  const totalPending = subscriptions
    .filter((s) => s.status === "Pendente")
    .reduce((sum, s) => sum + s.amount, 0);

  const totalOverdue = subscriptions
    .filter((s) => {
      if (s.status === "Pago" || s.status === "Cancelado") return false;
      const dueDate = parseISO(s.dueDate);
      return dueDate < today;
    })
    .reduce((sum, s) => sum + s.amount, 0);

  const totalThisMonth = paymentsArray
    .filter((p) => {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      return p.date >= monthStart && p.date <= monthEnd;
    })
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Obter pagamentos do dia selecionado
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const selectedDatePayments = selectedDate
    ? paymentsArray.find((p) => isSameDay(p.date, selectedDate))
    : undefined;

  // Modificar o calendário para destacar dias com pagamentos
  const modifiers = {
    hasPayment: (date: Date) => {
      return paymentsArray.some((p) => isSameDay(p.date, date));
    },
    isToday: (date: Date) => isSameDay(date, today),
  };

  const modifiersClassNames = {
    hasPayment: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold",
    isToday: "bg-accent",
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Visão geral dos pagamentos e calendário de vencimentos
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Pendente</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {formatCurrency(totalPending)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Atrasado</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(totalOverdue)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Previsto Este Mês</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {formatCurrency(totalThisMonth)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Clientes</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {clients.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Calendário e Lista de Pagamentos */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendário de Pagamentos
              </CardTitle>
              <CardDescription>
                Clique em um dia para ver os pagamentos agendados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                locale={ptBR}
                className="rounded-md border"
              />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 rounded bg-blue-100 dark:bg-blue-900/30"></div>
                <span>Dia com pagamento</span>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pagamentos do Dia Selecionado */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Pagamentos - ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                  : "Selecione uma data no calendário"}
              </CardTitle>
              <CardDescription>
                {selectedDatePayments
                  ? `${selectedDatePayments.subscriptions.length} pagamento(s) agendado(s)`
                  : "Nenhuma data selecionada"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDatePayments ? (
                <div className="space-y-3">
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total do dia</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedDatePayments.totalAmount)}
                    </div>
                  </div>
                  {selectedDatePayments.subscriptions.map(({ subscription, client }) => (
                    <div
                      key={subscription.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold">{client.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.companyName}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            subscription.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : subscription.status === "Atrasado"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : ""
                          }
                        >
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-muted-foreground">
                          {subscription.description || "Sem descrição"}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(subscription.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma data no calendário para ver os pagamentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos Pagamentos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Próximos Pagamentos</CardTitle>
            <CardDescription>Pagamentos dos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsArray
              .filter((p) => {
                const daysDiff = Math.ceil(
                  (p.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysDiff >= 0 && daysDiff <= 7;
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 10)
              .map((payment) => (
                <div
                  key={format(payment.date, "yyyy-MM-dd")}
                  className="p-3 border rounded-lg mb-2 hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {format(payment.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.subscriptions.length} pagamento(s)
                      </div>
                    </div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(payment.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            {paymentsArray.filter((p) => {
              const daysDiff = Math.ceil(
                (p.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysDiff >= 0 && daysDiff <= 7;
            }).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pagamento nos próximos 7 dias
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

