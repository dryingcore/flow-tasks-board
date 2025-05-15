
import { AppLayout } from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanContainer } from "@/components/KanbanContainer";

const Index = () => {
  const { userData } = useAuth();
  const companyName = userData?.clinica || "DeskCenter";

  return (
    <AppLayout companyName={companyName}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Kanban de Suporte</h2>
        <p className="text-muted-foreground">
          Gerencie tickets de suporte para melhorias e correções
        </p>
      </div>
      <KanbanContainer />
    </AppLayout>
  );
};

export default Index;
