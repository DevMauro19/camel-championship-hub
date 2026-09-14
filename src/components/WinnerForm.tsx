import { useState } from "react";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/lib/store";
import { labelize, type Race } from "@/lib/types";

/**
 * Shown once a race is COMPLETED: lists the approved participants so an
 * organizer can mark the winner. The choice is persisted on the racing server.
 */
export function WinnerForm({ race }: { race: Race }) {
  const { registrations, competitors, results, setWinner } = useStore();
  const approved = registrations.filter((r) => r.raceId === race.id && r.status === "APPROVED");
  const currentWinner = results.find((r) => r.raceId === race.id && r.position === 1);
  const [pick, setPick] = useState<string>(
    currentWinner ? String(currentWinner.competitorId) : "",
  );
  const [saving, setSaving] = useState(false);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-warning" /> Marcar ganador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay participantes aprobados para esta carrera. Debes aprobar al menos una inscripción
            antes de registrar un resultado.
          </p>
        ) : (
          <>
            <RadioGroup value={pick} onValueChange={setPick} className="gap-2">
              {approved.map((registration) => {
                const competitor = competitors.find((c) => c.id === registration.competitorId);
                const value = String(registration.competitorId);
                return (
                  <div
                    key={registration.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <RadioGroupItem value={value} id={`winner-${value}`} />
                    <Label htmlFor={`winner-${value}`} className="cursor-pointer font-medium">
                      {competitor?.name ?? `Competidor #${registration.competitorId}`}
                      {competitor ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {labelize(competitor.type)}
                        </span>
                      ) : null}
                    </Label>
                    {currentWinner?.competitorId === registration.competitorId ? (
                      <span className="ml-auto text-xs font-semibold text-warning">
                        Ganador actual
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </RadioGroup>
            <Button
              disabled={saving || !pick}
              onClick={() => {
                const registration = approved.find((r) => String(r.competitorId) === pick);
                if (!pick || !registration?.id) {
                  toast.error("Selecciona un participante aprobado primero.");
                  return;
                }
                setSaving(true);
                void setWinner(race.id, Number(pick))
                  .then((saved) => {
                    if (saved) toast.success("Ganador registrado.");
                  })
                  .finally(() => setSaving(false));
              }}
            >
              <Trophy className="size-4" /> Guardar ganador
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
