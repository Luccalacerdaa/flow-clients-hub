import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Subscription, PaymentStatus, SubscriptionCategory, PaymentMethod } from "@/types/subscription";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clientsService";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewClientDialog } from "@/components/NewClientDialog";
import { useClients } from "@/contexts/ClientsContext";
import { UserPlus } from "lucide-react";

const addClientWithSubscriptionSchema = z.object({
  // Cliente
  clientId: z.string().min(1, "Selecione um cliente"),
  
  // Venda inicial
  productDescription: z.string().min(1, "Descrição do produto é obrigatória"),
  productTotalAmount: z.number().min(0.01, "Valor deve ser maior que zero"),
  productPaid: z.boolean(),
  installments: z.number().min(1, "Quantidade de parcelas deve ser pelo menos 1"),
  paymentMethod: z.enum(["PIX", "Cartão Crédito", "Cartão Débito", "Boleto", "Dinheiro", "Transferência", "Outro"]).optional(),
  paymentDate: z.string().optional(),
  
  // Mensalidade
  subscriptionAmount: z.number().min(0.01, "Valor da mensalidade deve ser maior que zero"),
  recurrenceDay: z.number().min(1).max(31, "Dia deve ser entre 1 e 31"),
  activateRecurrence: z.boolean(),
  category: z.enum(["Produto", "Serviço", "Plano", "Outro"]),
}).refine((data) => {
  // Se marcado como pago, forma de pagamento é obrigatória
  if (data.productPaid && !data.paymentMethod) {
    return false;
  }
  return true;
}, {
  message: "Forma de pagamento é obrigatória quando o pagamento está marcado como pago",
  path: ["paymentMethod"],
});

type AddClientWithSubscriptionFormValues = z.infer<typeof addClientWithSubscriptionSchema>;

interface AddClientWithSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    clientId: string;
    initialPayment: {
      amount: number;
      description: string;
      paid: boolean;
      installments: number;
      paymentMethod?: PaymentMethod;
      paymentDate?: string;
    };
    subscription: {
      amount: number;
      recurrenceDay: number;
      activateRecurrence: boolean;
      category: SubscriptionCategory;
    };
  }) => void;
}

export function AddClientWithSubscriptionDialog({
  open,
  onOpenChange,
  onSave,
}: AddClientWithSubscriptionDialogProps) {
  const { clients, addClient } = useClients();
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);

  const form = useForm<AddClientWithSubscriptionFormValues>({
    resolver: zodResolver(addClientWithSubscriptionSchema),
    defaultValues: {
      clientId: "",
      productDescription: "",
      productTotalAmount: 0,
      productPaid: false,
      installments: 1,
      paymentMethod: undefined,
      paymentDate: new Date().toISOString().split("T")[0],
      subscriptionAmount: 0,
      recurrenceDay: new Date().getDate(),
      activateRecurrence: true,
      category: "Serviço",
    },
  });

  const selectedClientId = form.watch("clientId");
  const productPaid = form.watch("productPaid");
  const activateRecurrence = form.watch("activateRecurrence");

  const handleNewClientCreated = async (clientData: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addClient(clientData);
      setTimeout(async () => {
        const allClients = await clientsService.getAll();
        const newClient = allClients.find(
          (c) => c.fullName === clientData.fullName && c.companyName === clientData.companyName
        );
        if (newClient) {
          setNewClientId(newClient.id);
          form.setValue("clientId", newClient.id);
        }
      }, 500);
      setIsNewClientDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  const onSubmit = (values: AddClientWithSubscriptionFormValues) => {
    const clientIdToUse = newClientId || values.clientId;
    
    if (!clientIdToUse) {
      form.setError("clientId", { message: "Selecione ou crie um cliente" });
      return;
    }

    onSave({
      clientId: clientIdToUse,
      initialPayment: {
        amount: values.productTotalAmount,
        description: values.productDescription,
        paid: values.productPaid,
        installments: values.installments,
        paymentMethod: values.paymentMethod as PaymentMethod,
        paymentDate: values.productPaid ? (values.paymentDate || new Date().toISOString().split("T")[0]) : undefined,
      },
      subscription: {
        amount: values.subscriptionAmount,
        recurrenceDay: values.recurrenceDay,
        activateRecurrence: values.activateRecurrence,
        category: values.category as SubscriptionCategory,
      },
    });

    form.reset();
    setNewClientId(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Adicionar Cliente + Mensalidade
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Cadastre uma nova venda e configure a mensalidade recorrente do cliente
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção: Seleção de Cliente */}
              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Selecionar Cliente
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Escolha um cliente existente ou crie um novo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-3">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setNewClientId(null);
                            }}
                            value={newClientId || field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Selecione um cliente existente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.fullName} - {client.companyName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsNewClientDialogOpen(true)}
                            className="gap-2 border-gray-300 hover:bg-gray-100"
                          >
                            <UserPlus className="h-4 w-4" />
                            Novo Cliente
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Seção: Venda Inicial */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Venda Inicial (Produto/Serviço)
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Registre os detalhes da venda realizada para o cliente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-900">
                          Descrição do Produto/Serviço
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva detalhadamente o produto ou serviço vendido..."
                            className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="productTotalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Valor Total do Produto (R$)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 2500.00"
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Valor total que o cliente pagou ou pagará
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="installments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Quantidade de Parcelas
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ex: 1x, 2x, 3x..."
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Número de vezes que o valor foi parcelado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border-2 border-gray-200 bg-green-50/50 p-5">
                    <FormField
                      control={form.control}
                      name="productPaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <div className="space-y-1 flex-1">
                            <FormLabel className="text-base font-semibold text-gray-900">
                              O cliente pagou este valor?
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600">
                              Se marcado, este valor entrará automaticamente no Relatório Financeiro
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {productPaid && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">
                              Forma de Pagamento *
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              required
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Selecione a forma de pagamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                                <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                                <SelectItem value="Boleto">Boleto</SelectItem>
                                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="Transferência">Transferência</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">
                              Data do Pagamento
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Seção: Mensalidade Recorrente */}
              <Card className="border-gray-200 bg-blue-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Mensalidade Recorrente do Cliente
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Configure a mensalidade fixa que será cobrada mensalmente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Categoria
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                      name="subscriptionAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Valor da Mensalidade Fixa (R$)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 49.90"
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Valor que será cobrado mensalmente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="recurrenceDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Dia do Vencimento
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              placeholder="Ex: 10"
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Todo dia {field.value || "X"} de cada mês
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <div className="rounded-lg border-2 border-gray-200 bg-white p-4 w-full">
                        <FormField
                          control={form.control}
                          name="activateRecurrence"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                              <div className="space-y-1 flex-1">
                                <FormLabel className="text-base font-semibold text-gray-900">
                                  Ativar recorrência mensal
                                </FormLabel>
                                <FormDescription className="text-sm text-gray-600">
                                  Se ativo, criará automaticamente a primeira mensalidade pendente
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator className="my-6" />

              <DialogFooter className="gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setNewClientId(null);
                    onOpenChange(false);
                  }}
                  className="h-11 px-6 border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Salvar e Criar Mensalidade
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <NewClientDialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        onSave={handleNewClientCreated}
      />
    </>
  );
}
