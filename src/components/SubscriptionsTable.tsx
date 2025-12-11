import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Subscription, PaymentStatus } from "@/types/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, CheckCircle2, Plus, Eye, Search, Phone, Calculator, Calendar } from "lucide-react";
import { EditSubscriptionDialog } from "@/components/EditSubscriptionDialog";
import { DeleteSubscriptionDialog } from "@/components/DeleteSubscriptionDialog";
import { NewSubscriptionDialog } from "@/components/NewSubscriptionDialog";

interface SubscriptionWithClient extends Subscription {
  clientName?: string;
  companyName?: string;
}

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithClient[];
  clientId?: string;
  onAddSubscription?: (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => void;
  onEditSubscription?: (id: string, subscriptionData: Partial<Subscription>) => void;
  onDeleteSubscription?: (id: string) => void;
  onMarkAsPaid?: (id: string) => void;
  showClientName?: boolean;
}

const statusColors: Record<PaymentStatus, string> = {
  Pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Pago: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Atrasado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Cancelado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  Pausado: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export function SubscriptionsTable({
  subscriptions,
  clientId,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onMarkAsPaid,
  showClientName = false,
}: SubscriptionsTableProps) {
  const navigate = useNavigate();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recurringFilter, setRecurringFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isOverdue = (subscription: Subscription) => {
    if (subscription.status === "Pago" || subscription.status === "Cancelado") return false;
    const dueDate = new Date(subscription.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesRecurring =
      recurringFilter === "all" ||
      (recurringFilter === "recurring" && sub.isRecurring) ||
      (recurringFilter === "unique" && !sub.isRecurring);
    const matchesSearch =
      !searchTerm ||
      (sub as any).clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub as any).companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesRecurring && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {showClientName && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Atrasado">Atrasado</SelectItem>
              <SelectItem value="Pausado">Pausado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="recurring">Recorrente</SelectItem>
              <SelectItem value="unique">Única</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onAddSubscription && (
          <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Mensalidade
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card/95 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {showClientName && <TableHead>Cliente</TableHead>}
              <TableHead>Detalhes do Contrato</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showClientName ? 8 : 7}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma mensalidade encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription, index) => {
                const overdue = isOverdue(subscription);
                return (
                  <TableRow
                    key={subscription.id}
                    className={`${
                      index % 2 === 0 ? "bg-card" : "bg-muted/30"
                    } ${overdue ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                  >
                    {showClientName && (
                      <TableCell className="font-medium">
                        <div>
                          <div>{subscription.clientName || "N/A"}</div>
                          {subscription.companyName && (
                            <div className="text-xs text-muted-foreground">
                              {subscription.companyName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{subscription.numberOfNumbers || 1} números</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calculator className="h-3 w-3" />
                          <span>Manutenção: {formatCurrency(subscription.maintenanceValuePerNumber || 0)}/nº</span>
                        </div>
                        {subscription.implementationValue && subscription.implementationValue > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Implementação: {formatCurrency(subscription.implementationValue)}</span>
                            {subscription.implementationPaymentType === "parcelado" && (
                              <span>({subscription.implementationInstallments}x)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="space-y-1">
                        <div>{formatCurrency(subscription.amount)}</div>
                        {subscription.monthlyImplementationAmount && subscription.monthlyImplementationAmount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Manutenção: {formatCurrency(subscription.monthlyMaintenanceAmount || 0)}
                            <br />
                            Implementação: {formatCurrency(subscription.monthlyImplementationAmount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatDate(subscription.dueDate)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Todo dia {subscription.paymentDay || subscription.recurrenceDay}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.paymentDate
                        ? formatDate(subscription.paymentDate)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[subscription.status]}
                      >
                        {subscription.status}
                        {overdue && " (Atrasado)"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {subscription.currentInstallment || 1}/{subscription.totalInstallments || subscription.contractDuration || 12}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subscription.contractDuration || 12} meses
                        </div>
                        {subscription.implementationInstallments && subscription.implementationPaymentType === "parcelado" && (
                          <div className="text-xs text-orange-600">
                            Impl: {Math.min(subscription.currentInstallment || 1, subscription.implementationInstallments)}/{subscription.implementationInstallments}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onMarkAsPaid &&
                          subscription.status !== "Pago" &&
                          subscription.status !== "Cancelado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsPaid(subscription.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        {onEditSubscription && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteSubscription && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {onAddSubscription && clientId && (
        <NewSubscriptionDialog
          open={isNewDialogOpen}
          onOpenChange={setIsNewDialogOpen}
          clientId={clientId}
          onSave={onAddSubscription}
        />
      )}

      {onEditSubscription && (
        <EditSubscriptionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          subscription={selectedSubscription}
          onSave={onEditSubscription}
        />
      )}

      {onDeleteSubscription && (
        <DeleteSubscriptionDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          subscription={selectedSubscription}
          onConfirm={onDeleteSubscription}
        />
      )}
    </div>
  );
}

