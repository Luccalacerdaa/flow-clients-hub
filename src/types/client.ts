export type ClientStatus = "Lead" | "Ativo" | "Pausado" | "Encerrado";
export type CompanySize = "Pequena" | "Média" | "Grande";

// Credenciais para um número específico
export interface NumberCredentials {
  id: string;
  phoneNumber: string; // Número do WhatsApp (ex: +5511999999999)
  instanceName: string; // Nome da instância (ex: cliente-numero-1)
  displayName?: string; // Nome amigável para identificação (ex: "Vendas", "Suporte", "Marketing")
  description?: string; // Descrição do uso deste número
  
  // Credenciais específicas para este número
  n8n?: {
    adminUrl: string;
    email: string;
    password: string;
  };
  cloudfy?: {
    url: string;
    email: string;
    password: string;
  };
  evolution?: {
    managerUrl: string;
    apiKey: string;
    instanceName?: string;
  };
  supabase?: {
    projectUrl: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  chatgpt?: {
    apiKey: string;
    organizationId?: string;
  };
  // Novas credenciais por número
  typebot?: {
    apiUrl: string;
    apiKey: string;
  };
  make?: {
    apiKey: string;
    organizationId?: string;
  };
  zapier?: {
    apiKey: string;
  };
  notes?: string;
}

// Credenciais gerais do cliente (não vinculadas a números específicos)
export interface GeneralCredentials {
  // Credenciais compartilhadas
  supabase?: {
    projectUrl: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  chatgpt?: {
    apiKey: string;
    organizationId?: string;
  };
  notes?: string;
}

// Interface para compatibilidade (será removida gradualmente)
export interface InfraCredentials {
  n8n?: {
    adminUrl: string;
    email: string;
    password: string;
  };
  cloudfy?: {
    url: string;
    email: string;
    password: string;
  };
  evolution?: {
    managerUrl: string;
    apiKey: string;
    instanceName?: string;
  };
  supabase?: {
    projectUrl: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  chatgpt?: {
    apiKey: string;
    organizationId?: string;
  };
  evolutionApi?: {
    managerUrl: string;
    apiKey: string;
  };
  chatwoot?: {
    adminUrl: string;
    password: string;
  };
  redis?: {
    host: string;
    port: string;
    user: string;
    password: string;
  };
  postgresql?: {
    host: string;
    port: string;
    user: string;
    database: string;
    password: string;
  };
  notes?: string;
}

export interface Client {
  id: string;
  // Dados pessoais
  fullName: string;
  email: string;
  emails?: string[]; // Emails adicionais para automações
  phone: string;
  phones?: string[]; // Telefones adicionais para automações
  position: string;
  personalNotes?: string;
  
  // Dados da empresa
  companyName: string;
  cnpj: string;
  segment: string;
  companySize: CompanySize;
  website?: string;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
  };
  
  // Status do relacionamento
  status: ClientStatus;
  partnershipStartDate?: string;
  monthlyContractValue?: number;
  
  // Quantidade de números solicitados
  numberOfPhones?: number;
  
  // Credenciais por número (cada número tem suas próprias credenciais)
  numberCredentials?: NumberCredentials[];
  
  // Credenciais da infraestrutura (compatibilidade - será removido)
  infraCredentials?: InfraCredentials;
  
  createdAt: string;
  updatedAt: string;
}
