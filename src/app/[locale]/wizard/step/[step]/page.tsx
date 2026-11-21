import { notFound } from "next/navigation";
import QuestionRenderer from "@/components/wizard/QuestionRenderer";
import { WizardProvider } from "@/components/wizard/WizardContext";

const VALID_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function generateStaticParams() {
  return VALID_STEPS.map((step) => ({ step: String(step) }));
}

export default function WizardStepPage({
  params,
}: {
  params: { step: string };
}) {
  const stepNum = parseInt(params.step, 10);

  if (!VALID_STEPS.includes(stepNum)) {
    notFound();
  }

  return (
    <WizardProvider>
      <QuestionRenderer />
    </WizardProvider>
  );
}