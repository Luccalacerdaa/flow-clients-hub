import { Client } from "@/types/client";

export const mockClients: Client[] = [
  {
    id: "1",
    fullName: "Carlos Silva",
    email: "carlos.silva@techsolutions.com.br",
    phone: "+55 11 98765-4321",
    position: "CTO",
    personalNotes: "Prefere comunicação via WhatsApp. Reuniões às terças.",
    companyName: "Tech Solutions Brasil",
    cnpj: "12.345.678/0001-90",
    segment: "Tecnologia",
    companySize: "Média",
    website: "https://techsolutions.com.br",
    address: {
      street: "Av. Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP"
    },
    status: "Ativo",
    partnershipStartDate: "2024-01-15",
    monthlyContractValue: 5000,
    infraCredentials: {
      n8n: {
        adminUrl: "https://n8n-techsolutions.flowtech.cloud",
        email: "admin@techsolutions.com.br",
        password: "Tech@2024Secure"
      },
      evolutionApi: {
        managerUrl: "https://evolution-techsolutions.flowtech.cloud",
        apiKey: "evo_1234567890abcdef"
      },
      chatwoot: {
        adminUrl: "https://chatwoot-techsolutions.flowtech.cloud",
        password: "Criar conta no primeiro login"
      },
      redis: {
        host: "redis-techsolutions.flowtech.cloud",
        port: "6379",
        user: "techsolutions",
        password: "Redis@2024Secure"
      },
      postgresql: {
        host: "postgres-techsolutions.flowtech.cloud",
        port: "5432",
        user: "techsolutions",
        database: "techsolutions_db",
        password: "Postgres@2024Secure"
      },
      notes: "Infra provisionada em 15/01/2024. Backup diário às 3h."
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    fullName: "Marina Oliveira",
    email: "marina@consultoriadigital.com",
    phone: "+55 21 99876-5432",
    position: "CEO",
    companyName: "Consultoria Digital Plus",
    cnpj: "98.765.432/0001-10",
    segment: "Consultoria",
    companySize: "Pequena",
    status: "Lead",
    createdAt: "2024-11-20T14:30:00Z",
    updatedAt: "2024-11-20T14:30:00Z"
  },
  {
    id: "3",
    fullName: "Roberto Almeida",
    email: "roberto.almeida@megavarejo.com.br",
    phone: "+55 11 97654-3210",
    position: "Diretor de TI",
    personalNotes: "Empresa em expansão. Interessado em escalar a infra.",
    companyName: "Mega Varejo SA",
    cnpj: "11.222.333/0001-44",
    segment: "Varejo",
    companySize: "Grande",
    website: "https://megavarejo.com.br",
    address: {
      street: "Rua das Flores",
      number: "500",
      city: "São Paulo",
      state: "SP"
    },
    status: "Ativo",
    partnershipStartDate: "2023-08-10",
    monthlyContractValue: 12000,
    infraCredentials: {
      n8n: {
        adminUrl: "https://n8n-megavarejo.flowtech.cloud",
        email: "admin@megavarejo.com.br",
        password: "Mega@2023Strong"
      },
      evolutionApi: {
        managerUrl: "https://evolution-megavarejo.flowtech.cloud",
        apiKey: "evo_mega9876xyz5432"
      },
      chatwoot: {
        adminUrl: "https://chatwoot-megavarejo.flowtech.cloud",
        password: "ChatMega@2023"
      },
      redis: {
        host: "redis-megavarejo.flowtech.cloud",
        port: "6379",
        user: "megavarejo",
        password: "RedisMega@2023"
      },
      postgresql: {
        host: "postgres-megavarejo.flowtech.cloud",
        port: "5432",
        user: "megavarejo",
        database: "megavarejo_db",
        password: "PostgresMega@2023"
      },
      notes: "Infra com alta disponibilidade. Monitoramento 24/7."
    },
    createdAt: "2023-08-10T09:00:00Z",
    updatedAt: "2023-08-10T09:00:00Z"
  },
  {
    id: "4",
    fullName: "Ana Costa",
    email: "ana@startuptech.io",
    phone: "+55 31 98888-7777",
    position: "Founder",
    companyName: "Startup Tech Innovations",
    cnpj: "33.444.555/0001-66",
    segment: "Startup/SaaS",
    companySize: "Pequena",
    status: "Pausado",
    partnershipStartDate: "2024-06-01",
    createdAt: "2024-06-01T11:00:00Z",
    updatedAt: "2024-10-15T16:00:00Z"
  }
];
