import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Client, ClientStatus } from "@/types/client";
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

const newClientSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  status: z.enum(["Lead", "Ativo", "Pausado", "Encerrado"]),
  emails: z.array(z.object({ value: z.string().email("Email inválido") })).optional(),
  phones: z.array(z.object({ value: z.string().min(10, "Telefone inválido") })).optional(),
  // Quantidade de números
  numberOfPhones: z.number().min(1, "Deve ter pelo menos 1 número").max(10, "Máximo 10 números"),
  // Credenciais gerais (compartilhadas)
  supabaseUrl: z.string().optional(),
  supabaseAnonKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  chatgptApiKey: z.string().optional(),
  chatgptOrgId: z.string().optional(),
});

type NewClientFormValues = z.infer<typeof newClientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewClientDialog({ open, onOpenChange, onSave }: NewClientDialogProps) {
  const form = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      status: "Lead",
      emails: [],
      phones: [],
      numberOfPhones: 1,
      supabaseUrl: "",
      supabaseAnonKey: "",
      supabaseServiceKey: "",
      chatgptApiKey: "",
      chatgptOrgId: "",
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

  const onSubmit = (values: NewClientFormValues) => {
    const emails = values.emails?.map(e => e.value).filter(Boolean) || [];
    const phones = values.phones?.map(p => p.value).filter(Boolean) || [];

    // Credenciais gerais (compartilhadas)
    const generalCredentials: Client["generalCredentials"] = {};
    
    if (values.supabaseUrl || values.supabaseAnonKey) {
      generalCredentials.supabase = {
        projectUrl: values.supabaseUrl || "",
        anonKey: values.supabaseAnonKey || "",
        serviceRoleKey: values.supabaseServiceKey,
      };
    }

    if (values.chatgptApiKey) {
      generalCredentials.chatgpt = {
        apiKey: values.chatgptApiKey || "",
        organizationId: values.chatgptOrgId,
      };
    }

    // Inicializar credenciais por número (vazias inicialmente)
    const numberCredentials: Client["numberCredentials"] = [];
    for (let i = 0; i < values.numberOfPhones; i++) {
      numberCredentials.push({
        id: `number-${i + 1}`,
        phoneNumber: "",
        instanceName: `instancia-${i + 1}`,
      });
    }

    const newClient: Omit<Client, "id" | "createdAt" | "updatedAt"> = {
      fullName: values.fullName,
      email: values.email || "",
      emails: emails.length > 0 ? emails : undefined,
      phone: values.phone,
      phones: phones.length > 0 ? phones : undefined,
      position: "",
      companyName: values.companyName,
      cnpj: "",
      segment: "",
      companySize: "Pequena",
      status: values.status as ClientStatus,
      numberOfPhones: values.numberOfPhones,
      numberCredentials,
      generalCredentials: Object.keys(generalCredentials).length > 0 ? generalCredentials : undefined,
    };

    onSave(newClient);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar um novo cliente ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                <TabsTrigger value="contacts">Contatos</TabsTrigger>
                <TabsTrigger value="general-credentials">Credenciais Gerais</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo" {...field} />
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
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da empresa" {...field} />
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
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                        <Input placeholder="Ex: +55 11 98765-4321" {...field} />
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4 mt-4">
                <div>
                  <FormLabel>Emails Adicionais (para automações)</FormLabel>
                  <FormDescription className="mb-2">
                    Adicione emails adicionais que serão usados nas automações
                  </FormDescription>
                  {emailFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mb-2">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendEmail({ value: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Email
                  </Button>
                </div>

                <div>
                  <FormLabel>Telefones Adicionais (para automações)</FormLabel>
                  <FormDescription className="mb-2">
                    Adicione telefones adicionais que serão usados nas automações
                  </FormDescription>
                  {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="+55 11 98765-4321" {...field} />
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPhone({ value: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Telefone
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="general-credentials" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Estas credenciais serão compartilhadas entre todos os números do cliente.</p>
                    <p>As credenciais específicas de cada número (n8n, Evolution API) serão configuradas após criar o cliente.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h4 className="font-semibold">Supabase</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="supabaseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://xxx.supabase.co" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="supabaseAnonKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anon Key</FormLabel>
                            <FormControl>
                              <Input placeholder="eyJhbGci..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="supabaseServiceKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Role Key (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="eyJhbGci..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h4 className="font-semibold">ChatGPT</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="chatgptApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk-..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="chatgptOrgId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization ID (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="org-xxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
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
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
