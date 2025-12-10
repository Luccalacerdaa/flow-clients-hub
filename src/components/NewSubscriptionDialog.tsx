import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Subscription, PaymentStatus, SubscriptionCategory } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const newSubscriptionSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  category: z.enum(["Produto", "Serviço", "Plano", "Outro"]),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  recurrenceDay: z.number().min(1).max(31).optional(),
  status: z.enum(["Pendente", "Pago", "Atrasado", "Cancelado", "Pausado"]),
  subscriptionType: z.enum(["unique", "recurring"]),
  totalInstallments: z.number().min(1).optional(),
  initialPaymentAmount: z.number().min(0).optional(),
  initialPaymentPaid: z.boolean(),
  notes: z.string().optional(),
});

type NewSubscriptionFormValues = z.infer<typeof newSubscriptionSchema>;

interface NewSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSave: (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewSubscriptionDialog({
  open,
  onOpenChange,
  clientId,
  onSave,
}: NewSubscriptionDialogProps) {
  const form = useForm<NewSubscriptionFormValues>({
    resolver: zodResolver(newSubscriptionSchema),
    defaultValues: {
      amount: 0,
      category: "Serviço",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      recurrenceDay: new Date().getDate(),
      status: "Pendente",
      subscriptionType: "recurring",
      totalInstallments: undefined,
      initialPaymentAmount: 0,
      initialPaymentPaid: false,
      notes: "",
    },
  });

  const subscriptionType = form.watch("subscriptionType");
  const isRecurring = subscriptionType === "recurring";
  const hasInitialPayment = form.watch("initialPaymentAmount") && form.watch("initialPaymentAmount")! > 0;

  const onSubmit = (values: NewSubscriptionFormValues) => {
    const newSubscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
      clientId,
      amount: values.amount,
      category: values.category as SubscriptionCategory,
      description: values.description,
      startDate: values.startDate,
      dueDate: values.dueDate,
      status: values.status as PaymentStatus,
      isRecurring: isRecurring,
      recurrenceDay: isRecurring ? values.recurrenceDay : undefined,
      totalInstallments: isRecurring ? (values.totalInstallments || undefined) : undefined,
      currentInstallment: 1,
      isPaused: values.status === "Pausado",
      initialPaymentAmount: values.initialPaymentAmount && values.initialPaymentAmount > 0 ? values.initialPaymentAmount : undefined,
      initialPaymentPaid: values.initialPaymentPaid || false,
      notes: values.notes,
      paymentDate: values.status === "Pago" ? new Date().toISOString().split("T")[0] : undefined,
    };

    onSave(newSubscription);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Mensalidade</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova mensalidade.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                      <SelectItem value="Plano">Plano</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Mensalidade (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a mensalidade..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscriptionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Mensalidade</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unique" id="unique" />
                        <Label htmlFor="unique">Única</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recurring" id="recurring" />
                        <Label htmlFor="recurring">Recorrente</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="recurrenceDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia do Vencimento (todo mês)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Ex: 15"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Dia do mês em que a mensalidade vence (1-31)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalInstallments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Parcelas (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Deixe vazio para infinito"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe vazio para recorrência contínua
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="border-t pt-4">
              <FormLabel className="text-base font-semibold">Pagamento Inicial</FormLabel>
              <FormDescription className="mb-4">
                O cliente já pagou a entrada/produto?
              </FormDescription>

              <FormField
                control={form.control}
                name="initialPaymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Pagamento Inicial (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasInitialPayment && (
                <FormField
                  control={form.control}
                  name="initialPaymentPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pagamento inicial já foi realizado</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Inicial</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
