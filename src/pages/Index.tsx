import { Layout } from "@/components/Layout";
import { ClientsTable } from "@/components/ClientsTable";
import { mockClients } from "@/data/mockClients";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes da Flow Tech</p>
        </div>
        <ClientsTable clients={mockClients} />
      </div>
    </Layout>
  );
};

export default Index;
