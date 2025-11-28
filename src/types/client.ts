export type ClientStatus = "Lead" | "Ativo" | "Pausado" | "Encerrado";
export type CompanySize = "Pequena" | "Média" | "Grande";

export interface InfraCredentials {
  n8n: {
    adminUrl: string;
    email: string;
    password: string;
  };
  evolutionApi: {
    managerUrl: string;
    apiKey: string;
  };
  chatwoot: {
    adminUrl: string;
    password: string;
  };
  redis: {
    host: string;
    port: string;
    user: string;
    password: string;
  };
  postgresql: {
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
  phone: string;
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
  
  // Credenciais da infraestrutura
  infraCredentials?: InfraCredentials;
  
  createdAt: string;
  updatedAt: string;
}
