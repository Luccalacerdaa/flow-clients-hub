import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Client, ClientStatus, NumberCredentials } from "@/types/client";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { MultipleCredentialsManager } from "./MultipleCredentialsManager";

const editClientSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  status: z.enum(["Lead", "Ativo", "Pausado", "Encerrado"]),
  emails: z.array(z.object({ value: z.string().email("Email inválido") })).optional(),
  phones: z.array(z.object({ value: z.string().min(10, "Telefone inválido") })).optional(),
  numberOfPhones: z.number().min(1, "Deve ter pelo menos 1 número").max(10, "Máximo 10 números"),
});

type EditClientFormValues = z.infer<typeof editClientSchema>;

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: (client: Client) => void;
}

export function EditClientDialog({ open, onOpenChange, client, onSave }: EditClientDialogProps) {
  const [numberCredentials, setNumberCredentials] = useState<NumberCredentials[]>([]);
  
  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      status: "Lead",
      emails: [],
      phones: [],
      numberOfPhones: 1,
    },
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  useEffect(() => {
    if (client && open) {
      const emails = client.emails?.map(email => ({ value: email })) || [];
      const phones = client.phones?.map(phone => ({ value: phone })) || [];

      form.reset({
        fullName: client.fullName,
        companyName: client.companyName,
        email: client.email,
        phone: client.phone,
        status: client.status,
        emails,
        phones,
        numberOfPhones: client.numberOfPhones || 1,
      });

      // Inicializar credenciais por número
      if (client.numberCredentials) {
        setNumberCredentials(client.numberCredentials);
      } else {
        // Migrar credenciais antigas se existirem
        const migratedCredentials: NumberCredentials[] = [];
        const numberOfPhones = client.numberOfPhones || 1;
        
        for (let i = 0; i < numberOfPhones; i++) {
          const credential: NumberCredentials = {
            id: `number-${i + 1}`,
            phoneNumber: "",
            instanceName: `instancia-${i + 1}`,
            displayName: `Número ${i + 1}`,
            description: "",
            agents: [],
          };

          // Se é o primeiro número e temos credenciais antigas, migrar
          if (i === 0 && client.infraCredentials) {
            if (client.infraCredentials.n8n) {
              credential.n8n = client.infraCredentials.n8n;
            }
            if (client.infraCredentials.evolution) {
              credential.evolution = client.infraCredentials.evolution;
            }
          }

          migratedCredentials.push(credential);
        }
        
        setNumberCredentials(migratedCredentials);
      }
    }
  }, [client, open, form]);

  const onSubmit = (values: EditClientFormValues) => {
    if (!client) return;

    const emails = values.emails?.map(e => e.value).filter(Boolean) || [];
    const phones = values.phones?.map(p => p.value).filter(Boolean) || [];

    const updatedClient: Client = {
      ...client,
      fullName: values.fullName,
      email: values.email || "",
      emails: emails.length > 0 ? emails : undefined,
      phone: values.phone,
      phones: phones.length > 0 ? phones : undefined,
      companyName: values.companyName,
      status: values.status as ClientStatus,
      numberOfPhones: values.numberOfPhones,
      numberCredentials,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedClient);
    onOpenChange(false);
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente e suas credenciais.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                <TabsTrigger value="contacts">Contatos</TabsTrigger>
                <TabsTrigger value="number-credentials">Credenciais por Número</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa LTDA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Principal</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="joao@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfPhones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Números</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="1"
                            value={field.value}
                            onChange={(e) => {
                              const newCount = parseInt(e.target.value) || 1;
                              field.onChange(newCount);
                              
                              // Ajustar credenciais por número
                              const updatedCredentials = [...numberCredentials];
                              
                              // Adicionar credenciais se aumentou
                              while (updatedCredentials.length < newCount) {
                              updatedCredentials.push({
                                id: `number-${updatedCredentials.length + 1}`,
                                phoneNumber: "",
                                instanceName: `instancia-${updatedCredentials.length + 1}`,
                                displayName: `Número ${updatedCredentials.length + 1}`,
                                description: "",
                                agents: [],
                              });
                              }
                              
                              // Remover credenciais se diminuiu
                              if (updatedCredentials.length > newCount) {
                                updatedCredentials.splice(newCount);
                              }
                              
                              setNumberCredentials(updatedCredentials);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Quantos números de WhatsApp este cliente vai usar? (1-10)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                            <SelectItem value="Encerrado">Encerrado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                {/* Emails */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Emails Adicionais</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEmail({ value: "" })}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Email
                    </Button>
                  </div>
                  {emailFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`emails.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeEmail(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Telefones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Telefones Adicionais</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPhone({ value: "" })}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Telefone
                    </Button>
                  </div>
                  {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePhone(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>


              <TabsContent value="number-credentials" className="space-y-4">
                <MultipleCredentialsManager
                  credentials={numberCredentials}
                  numberOfPhones={form.watch("numberOfPhones")}
                  onUpdate={setNumberCredentials}
                  isEditing={true}
                />
              </TabsContent>
            </Tabs>

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
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}