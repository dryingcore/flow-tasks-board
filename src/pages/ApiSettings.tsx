
import { AppLayout } from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ApiTestButton } from "@/components/ApiTestButton";

const ApiSettings = () => {
  const { userData } = useAuth();
  const companyName = userData?.clinica || "DeskCenter";

  return (
    <AppLayout companyName={companyName}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configurações da API</h2>
        <p className="text-muted-foreground">
          Configure os endpoints e teste a conexão com a API
        </p>
      </div>
      <ApiTestButton />
    </AppLayout>
  );
};

export default ApiSettings;
