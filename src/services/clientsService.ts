import { supabase } from '@/lib/supabase';
import { Client, ClientStatus, CompanySize } from '@/types/client';

// Tipo para dados do banco (snake_case)
interface ClientRow {
  id: string;
  full_name: string;
  email: string;
  emails?: string[] | null;
  phone: string;
  phones?: string[] | null;
  position: string | null;
  personal_notes: string | null;
  company_name: string;
  cnpj: string | null;
  segment: string | null;
  company_size: CompanySize | null;
  website: string | null;
  address: any;
  status: ClientStatus;
  partnership_start_date: string | null;
  monthly_contract_value: number | null;
  number_of_phones?: number | null;
  number_credentials: any;
  general_credentials: any;
  infra_credentials: any;
  created_at: string;
  updated_at: string;
}

// Converter do formato do banco para o formato da aplicação
function dbToClient(row: ClientRow): Client {
  if (!row) {
    throw new Error('Dados do banco são undefined ou null');
  }
  
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    emails: row.emails || undefined,
    phone: row.phone,
    phones: row.phones || undefined,
    position: row.position || '',
    personalNotes: row.personal_notes || undefined,
    companyName: row.company_name,
    cnpj: row.cnpj || '',
    segment: row.segment || '',
    companySize: row.company_size || 'Pequena',
    website: row.website || undefined,
    address: row.address || undefined,
    status: row.status,
    partnershipStartDate: row.partnership_start_date || undefined,
    monthlyContractValue: row.monthly_contract_value ? Number(row.monthly_contract_value) : undefined,
    numberOfPhones: row.number_of_phones || undefined,
    numberCredentials: row.number_credentials || undefined,
    generalCredentials: row.general_credentials || undefined,
    infraCredentials: row.infra_credentials || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Converter do formato da aplicação para o formato do banco
function clientToDb(client: Partial<Client>): Partial<ClientRow> {
  if (!client) {
    console.error('Cliente é undefined ou null na função clientToDb');
    return {};
  }
  
  const dbClient: Partial<ClientRow> = {};
  
  if (client.fullName !== undefined) dbClient.full_name = client.fullName;
  if (client.email !== undefined) dbClient.email = client.email;
  if (client.emails !== undefined) dbClient.emails = client.emails || null;
  if (client.phone !== undefined) dbClient.phone = client.phone;
  if (client.phones !== undefined) dbClient.phones = client.phones || null;
  if (client.position !== undefined) dbClient.position = client.position || null;
  if (client.personalNotes !== undefined) dbClient.personal_notes = client.personalNotes || null;
  if (client.companyName !== undefined) dbClient.company_name = client.companyName;
  if (client.cnpj !== undefined) dbClient.cnpj = client.cnpj || null;
  if (client.segment !== undefined) dbClient.segment = client.segment || null;
  if (client.companySize !== undefined) dbClient.company_size = client.companySize || null;
  if (client.website !== undefined) dbClient.website = client.website || null;
  if (client.address !== undefined) dbClient.address = client.address || null;
  if (client.status !== undefined) dbClient.status = client.status;
  if (client.partnershipStartDate !== undefined) dbClient.partnership_start_date = client.partnershipStartDate || null;
  if (client.monthlyContractValue !== undefined) dbClient.monthly_contract_value = client.monthlyContractValue || null;
  if (client.numberOfPhones !== undefined) dbClient.number_of_phones = client.numberOfPhones || null;
  if (client.numberCredentials !== undefined) dbClient.number_credentials = client.numberCredentials || null;
  if (client.generalCredentials !== undefined) dbClient.general_credentials = client.generalCredentials || null;
  if (client.infraCredentials !== undefined) dbClient.infra_credentials = client.infraCredentials || null;
  
  return dbClient;
}

export const clientsService = {
  // Buscar todos os clientes
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    return data ? data.map(dbToClient) : [];
  },

  // Buscar cliente por ID
  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }

    return data ? dbToClient(data) : null;
  },

  // Criar novo cliente
  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const dbClient = clientToDb(client);
    
    const { data, error } = await supabase
      .from('clients')
      .insert(dbClient)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }

    return dbToClient(data);
  },

  // Atualizar cliente
  async update(id: string, updates: Partial<Client>): Promise<Client> {
    if (!id) {
      throw new Error('ID do cliente é obrigatório para atualização');
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Dados de atualização não fornecidos');
    }
    
    console.log('Atualizando cliente:', { id, updates });
    
    const dbUpdates = clientToDb(updates);
    
    if (Object.keys(dbUpdates).length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }
    
    console.log('Dados para o banco:', dbUpdates);
    
    const { data, error } = await supabase
      .from('clients')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }

    return dbToClient(data);
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  },
};

