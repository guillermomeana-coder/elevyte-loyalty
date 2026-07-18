import { requireRole } from "@/lib/auth";
import { WhitelabelForm } from "./whitelabel-form";

export default async function MyWhitelabelPage() {
  const user = await requireRole(["agency_admin"]);
  const agency = user.agency!;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Agencia</h1>
        <p className="text-muted-foreground">
          Configura lo que saldrá en tu panel y el de tus clientes
        </p>
      </div>
      <WhitelabelForm agency={agency} />
    </div>
  );
}
