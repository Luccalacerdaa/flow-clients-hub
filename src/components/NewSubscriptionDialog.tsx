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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Calendar, Phone, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const newSubscriptionSchema = z.object({
  // Implementação
  implementationValue: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  implementationStartDate: z.string().min(1, "Data de início é obrigatória"),
  implementationInstallments: z.number().min(1).max(60),
  implementationMonthlyValue: z.number().min(0),
  
  // Mensalidade
  maintenanceValuePerNumber: z.number().min(0.01, "Valor deve ser maior que zero"),
  numberOfNumbers: z.number().min(1, "Deve ter pelo menos 1 número"),
  maintenanceStartDate: z.string().min(1, "Data de início é obrigatória"),
  contractDuration: z.number().min(1).max(60).default(12),
  totalMaintenanceValue: z.number().min(0),
  totalMonthlyWithImplementation: z.number().min(0),
  
  // Controle
  implementationPaid: z.boolean().default(false),
});

type NewSubscriptionFormValues = z.infer<typeof newSubscriptionSchema>;

interface NewSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSave: (subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[]) => void;
}

export function NewSubscriptionDialog({
  open,
  onOpenChange,
  clientId,
  onSave,
}: NewSubscriptionDialogProps) {
  const [calculatedValues, setCalculatedValues] = useState({
    implementationMonthlyValue: 0,
    totalMaintenanceValue: 0,
    totalMonthlyWithImplementation: 0,
  });

  const form = useForm<NewSubscriptionFormValues>({
    resolver: zodResolver(newSubscriptionSchema),
    defaultValues: {
      implementationValue: 2500,
      implementationStartDate: "2025-12-15",
      implementationInstallments: 10,
      implementationMonthlyValue: 0,
      maintenanceValuePerNumber: 350,
      numberOfNumbers: 3,
      maintenanceStartDate: "2026-01-15",
      contractDuration: 12,
      totalMaintenanceValue: 0,
      totalMonthlyWithImplementation: 0,
      implementationPaid: false,
    },
  });

  // Watch para recalcular valores automaticamente
  const watchedValues = form.watch([
    "implementationValue",
    "implementationInstallments",
    "maintenanceValuePerNumber", 
    "numberOfNumbers"
  ]);

  useEffect(() => {
    const [
      implementationValue,
      implementationInstallments,
      maintenanceValuePerNumber,
      numberOfNumbers
    ] = watchedValues;

    // Calcular valor mensal da implementação
    const implementationMonthlyValue = implementationInstallments > 0 
      ? (implementationValue || 0) / implementationInstallments 
      : 0;
    
    // Calcular valor total de mensalidade
    const totalMaintenanceValue = (maintenanceValuePerNumber || 0) * (numberOfNumbers || 1);
    
    // Calcular valor total mensal (com implementação)
    const totalMonthlyWithImplementation = totalMaintenanceValue + implementationMonthlyValue;

    setCalculatedValues({
      implementationMonthlyValue,
      totalMaintenanceValue,
      totalMonthlyWithImplementation,
    });

    // Atualizar os campos calculados no form
    form.setValue("implementationMonthlyValue", implementationMonthlyValue);
    form.setValue("totalMaintenanceValue", totalMaintenanceValue);
    form.setValue("totalMonthlyWithImplementation", totalMonthlyWithImplementation);
  }, [watchedValues, form]);

  const onSubmit = (values: NewSubscriptionFormValues) => {
    const subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[] = [];
    
    const implementationStartDate = new Date(values.implementationStartDate);
    const maintenanceStartDate = new Date(values.maintenanceStartDate);
    
    // Determinar qual data é mais cedo para começar
    const startDate = implementationStartDate <= maintenanceStartDate 
      ? implementationStartDate 
      : maintenanceStartDate;

    // Criar todas as mensalidades do contrato
    for (let month = 0; month < values.contractDuration; month++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + month);
      
      // Verificar se ainda está no período de implementação
      const implementationEndDate = new Date(implementationStartDate);
      implementationEndDate.setMonth(implementationEndDate.getMonth() + values.implementationInstallments);
      
      const isImplementationPeriod = currentDate < implementationEndDate;
      
      // Calcular valor da parcela
      let monthlyAmount = values.totalMaintenanceValue;
      if (isImplementationPeriod) {
        monthlyAmount = values.totalMonthlyWithImplementation;
      }

      const subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
        clientId,
        
        // Valores base
        implementationValue: values.implementationValue,
        maintenanceValuePerNumber: values.maintenanceValuePerNumber,
        numberOfNumbers: values.numberOfNumbers,
        
        // Configurações de pagamento
        implementationPaymentType: "parcelado",
        implementationInstallments: values.implementationInstallments,
        contractDuration: values.contractDuration,
        paymentDay: currentDate.getDate(),
        
        // Valores calculados
        monthlyImplementationAmount: isImplementationPeriod ? values.implementationMonthlyValue : 0,
        monthlyMaintenanceAmount: values.totalMaintenanceValue,
        totalMonthlyAmount: monthlyAmount,
        
        // Controle de parcelas
        currentInstallment: month + 1,
        totalInstallments: values.contractDuration,
        
        // Campos existentes (compatibilidade)
        amount: monthlyAmount,
        dueDate: currentDate.toISOString().split("T")[0],
        status: values.implementationPaid && month === 0 ? "Pago" : "Pendente",
        isRecurring: false, // Não é recorrente pois criamos todas as parcelas
        recurrenceDay: currentDate.getDate(),
        category: "Serviço",
        description: isImplementationPeriod 
          ? `Mensalidade ${month + 1}/${values.contractDuration} (Manutenção + Implementação)`
          : `Mensalidade ${month + 1}/${values.contractDuration} (Apenas Manutenção)`,
        startDate: values.implementationStartDate,
        isPaused: false,
        paymentDate: values.implementationPaid && month === 0 ? new Date().toISOString().split("T")[0] : undefined,
      };

      subscriptions.push(subscription);
    }

    onSave(subscriptions);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Nova Mensalidade - Configuração Completa
          </DialogTitle>
          <DialogDescription>
            Configure a implementação e mensalidade do cliente. Todas as parcelas serão criadas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Seção: Implementação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-4 w-4" />
                  VALOR DE IMPLEMENTAÇÃO COBRADO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="implementationValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="2500"
                            className="text-lg font-bold"
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
                    name="implementationStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">DATA DE INÍCIO DO PAGAMENTO</FormLabel>
                        <FormControl>
                          <Input type="date" className="text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="implementationInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">QUANTIDADE DE PARCELAS NEGOCIADO</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            placeholder="10"
                            className="text-lg font-bold"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormDescription>Número de vezes que o valor foi parcelado</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel className="text-base font-semibold">VALOR DILUÍDO NA MENSALIDADE</FormLabel>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {calculatedValues.implementationMonthlyValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção: Mensalidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-4 w-4" />
                  MENSALIDADE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maintenanceValuePerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Valor por Número (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="350"
                            className="text-lg font-bold"
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
                        <FormDescription>350 POR NÚMERO</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">QUANTIDADE DE NÚMEROS</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="3"
                            className="text-lg font-bold"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maintenanceStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">DATA DE INÍCIO DO PAGAMENTO</FormLabel>
                        <FormControl>
                          <Input type="date" className="text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">VIGÊNCIA (meses)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            placeholder="12"
                            className="text-lg font-bold"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 12)
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

            {/* Seção: Resumo Financeiro */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="text-xl">💰 RESUMO FINANCEIRO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="text-sm font-medium text-muted-foreground">VALOR TOTAL DE MENSALIDADE</div>
                      <div className="text-3xl font-bold text-blue-600">
                        R$ {calculatedValues.totalMaintenanceValue.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="text-sm font-medium text-muted-foreground">VALOR MENSAL COM IMPLEMENTAÇÃO</div>
                      <div className="text-3xl font-bold text-green-600">
                        R$ {calculatedValues.totalMonthlyWithImplementation.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Implementação mensal:</span>
                        <span className="font-medium">R$ {calculatedValues.implementationMonthlyValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manutenção total:</span>
                        <span className="font-medium">R$ {calculatedValues.totalMaintenanceValue.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total com implementação:</span>
                        <span>R$ {calculatedValues.totalMonthlyWithImplementation.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded">
                      <strong>Cronograma:</strong><br />
                      • Primeiros {form.watch("implementationInstallments")} meses: R$ {calculatedValues.totalMonthlyWithImplementation.toFixed(2)}<br />
                      • Últimos {form.watch("contractDuration") - form.watch("implementationInstallments")} meses: R$ {calculatedValues.totalMaintenanceValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção: Controle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controle de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="implementationPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold">O cliente pagou este valor?</FormLabel>
                        <FormDescription>
                          Se marcado, este valor entrará automaticamente no Relatório Financeiro
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Criar Todas as Mensalidades ({form.watch("contractDuration")} parcelas)
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}