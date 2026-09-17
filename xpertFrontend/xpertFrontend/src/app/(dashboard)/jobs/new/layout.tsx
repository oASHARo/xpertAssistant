import { Card } from "@/components/ui/card";
import { WizardProvider } from "./components/wizard-context";
import { WizardStepper } from "./components/wizard-stepper";

/**
 * WizardProvider wraps ALL children here — this is what makes wizard
 * state (title, skills, criteria, etc.) survive as the user moves between
 * steps. Since step-switching is client-side (not separate URL routes),
 * page.tsx reads useWizard() to decide which step component to render.
 *
 * NewJobLayout itself stays a Server Component — WizardStepper is the
 * only piece that needs client-side state, so it's isolated into its
 * own small "use client" file rather than making this whole layout client-side.
 */
export default function NewJobLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <div className="flex flex-col h-full">
        <div className="shrink-0">
          <h1 className="text-2xl font-semibold text-text-main">Create a New Job</h1>
        <p className="mt-1 text-sm text-text-muted">Unlock the potential of your candidates</p>

        <div className="mt-6 bg-white rounded-[0.5rem] shadow-sm py-4 px-8 flex items-center justify-between w-full">
          <WizardStepper />
        </div>

        </div>

        <Card className="mt-6 p-6 min-h-0 shrink flex flex-col">
          {children}
        </Card>
      </div>
    </WizardProvider>
  );
}