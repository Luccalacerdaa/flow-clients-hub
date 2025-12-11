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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Calendar, Phone } from "lucide-react";
import { useState, useEffect } from "react";

const newSubscriptionSchema = z.object({
  // Valores base
  implementationValue: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  maintenanceValuePerNumber: z.number().min(0.01, "Valor deve ser maior que zero"),
  numberOfNumbers: z.number().min(1, "Deve ter pelo menos 1 número"),
  
  // Configurações de pagamento
  implementationPaymentType: z.enum(["vista", "parcelado"]),
  implementationInstallments: z.number().min(1).max(24).optional(),
  contractDuration: z.number().min(1).max(60).default(12),
  paymentDay: z.number().min(1).max(31),
  
  // Dados gerais
  category: z.enum(["Produto", "Serviço", "Plano", "Outro"]).default("Serviço"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  status: z.enum(["Pendente", "Pago", "Atrasado", "Cancelado", "Pausado"]).default("Pendente"),
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
  const [calculatedValues, setCalculatedValues] = useState({
    monthlyImplementationAmount: 0,
    monthlyMaintenanceAmount: 0,
    totalMonthlyAmount: 0,
    totalContractValue: 0,
  });

  const form = useForm<NewSubscriptionFormValues>({
    resolver: zodResolver(newSubscriptionSchema),
    defaultValues: {
      implementationValue: 0,
      maintenanceValuePerNumber: 350,
      numberOfNumbers: 1,
      implementationPaymentType: "parcelado",
      implementationInstallments: 10,
      contractDuration: 12,
      paymentDay: 10,
      category: "Serviço",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      status: "Pendente",
      notes: "",
    },
  });

  // Watch para recalcular valores automaticamente
  const watchedValues = form.watch([
    "implementationValue",
    "maintenanceValuePerNumber", 
    "numberOfNumbers",
    "implementationPaymentType",
    "implementationInstallments",
    "contractDuration"
  ]);

  useEffect(() => {
    const [
      implementationValue,
      maintenanceValuePerNumber,
      numberOfNumbers,
      implementationPaymentType,
      implementationInstallments,
      contractDuration
    ] = watchedValues;

    // Calcular valor mensal de manutenção
    const monthlyMaintenanceAmount = (maintenanceValuePerNumber || 0) * (numberOfNumbers || 1);
    
    // Calcular valor mensal de implementação
    let monthlyImplementationAmount = 0;
    if (implementationPaymentType === "parcelado" && implementationInstallments && implementationValue > 0) {
      monthlyImplementationAmount = implementationValue / implementationInstallments;
    }
    
    // Calcular valor total mensal (durante período de implementação)
    const totalMonthlyAmount = monthlyMaintenanceAmount + monthlyImplementationAmount;
    
    // Calcular valor total do contrato
    const implementationPeriod = implementationPaymentType === "parcelado" ? (implementationInstallments || 0) : 0;
    const maintenancePeriod = contractDuration || 12;
    
    const totalImplementationValue = implementationValue || 0;
    const totalMaintenanceValue = monthlyMaintenanceAmount * maintenancePeriod;
    const totalContractValue = totalImplementationValue + totalMaintenanceValue;

    setCalculatedValues({
      monthlyImplementationAmount,
      monthlyMaintenanceAmount,
      totalMonthlyAmount,
      totalContractValue,
    });
  }, [watchedValues]);

  const implementationPaymentType = form.watch("implementationPaymentType");
  const isParcelado = implementationPaymentType === "parcelado";

  const onSubmit = (values: NewSubscriptionFormValues) => {
    const startDate = new Date(values.startDate);
    const firstDueDate = new Date(startDate);
    firstDueDate.setDate(values.paymentDay);
    
    // Se o dia já passou no mês atual, vai para o próximo mês
    if (firstDueDate <= startDate) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }

    const newSubscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
      clientId,
      
      // Valores base
      implementationValue: values.implementationValue,
      maintenanceValuePerNumber: values.maintenanceValuePerNumber,
      numberOfNumbers: values.numberOfNumbers,
      
      // Configurações de pagamento
      implementationPaymentType: values.implementationPaymentType,
      implementationInstallments: isParcelado ? values.implementationInstallments : undefined,
      contractDuration: values.contractDuration,
      paymentDay: values.paymentDay,
      
      // Valores calculados
      monthlyImplementationAmount: calculatedValues.monthlyImplementationAmount,
      monthlyMaintenanceAmount: calculatedValues.monthlyMaintenanceAmount,
      totalMonthlyAmount: calculatedValues.totalMonthlyAmount,
      
      // Controle de parcelas
      currentInstallment: 1,
      totalInstallments: values.contractDuration,
      
      // Campos existentes (compatibilidade)
      amount: calculatedValues.totalMonthlyAmount,
      dueDate: firstDueDate.toISOString().split("T")[0],
      status: values.status as PaymentStatus,
      isRecurring: true,
      recurrenceDay: values.paymentDay,
      category: values.category as SubscriptionCategory,
      description: values.description,
      startDate: values.startDate,
      isPaused: values.status === "Pausado",
      notes: values.notes,
      paymentDate: values.status === "Pago" ? new Date().toISOString().split("T")[0] : undefined,
    };

    onSave(newSubscription);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Nova Mensalidade
          </DialogTitle>
          <DialogDescription>
            Configure os valores de implementação e manutenção para o cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Seção: Valores Base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-4 w-4" />
                  Valores Base
                </CardTitle>
                <CardDescription>
                  Configure os valores de implementação e manutenção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="implementationValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Implementação (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="2500.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || value === null || value === undefined) {
                                field.onChange(0);
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maintenanceValuePerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manutenção por Número (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="350.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || value === null || value === undefined) {
                                field.onChange(0);
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Quantidade de Números
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="3"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção: Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Forma de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure como será o pagamento da implementação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="implementationPaymentType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Pagamento da Implementação</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vista" id="vista" />
                            <Label htmlFor="vista">À Vista</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="parcelado" id="parcelado" />
                            <Label htmlFor="parcelado">Parcelado na Mensalidade</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isParcelado && (
                    <FormField
                      control={form.control}
                      name="implementationInstallments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcelas da Implementação</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="24"
                              placeholder="10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Em quantas parcelas dividir a implementação
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="contractDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração do Contrato (meses)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            placeholder="12"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 12)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Vigência total do contrato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Vencimento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 10)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Todo dia 10, 15, 20, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção: Resumo Financeiro */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">💰 Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Manutenção Mensal:</span>
                      <span className="font-medium">
                        R$ {calculatedValues.monthlyMaintenanceAmount.toFixed(2)}
                      </span>
                    </div>
                    {isParcelado && calculatedValues.monthlyImplementationAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Implementação Mensal:</span>
                        <span className="font-medium">
                          R$ {calculatedValues.monthlyImplementationAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Mensal:</span>
                      <span className="font-bold text-lg">
                        R$ {calculatedValues.totalMonthlyAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor Total do Contrato:</span>
                      <span className="font-bold text-green-600">
                        R$ {calculatedValues.totalContractValue.toFixed(2)}
                      </span>
                    </div>
                    {isParcelado && form.watch("implementationInstallments") && (
                      <div className="text-xs text-muted-foreground">
                        * Implementação será cobrada por {form.watch("implementationInstallments")} meses,
                        depois apenas manutenção (R$ {calculatedValues.monthlyMaintenanceAmount.toFixed(2)}/mês)
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção: Dados Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os serviços incluídos..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </CardContent>
            </Card>

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
              <Button type="submit">Criar Mensalidade</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}