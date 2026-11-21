"use strict";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { WizardAnswers } from "@/lib/eligibility/engine";

const SESSION_KEY = "scheme-setu-wizard-answers";

const wizardFieldOrder: (keyof WizardAnswers)[] = [
  "age",
  "gender",
  "state",
  "residence",
  "occupation",
  "income",
  "category",
  "disability",
  "student",
  "bpl",
  "marital",
];

const STEP_LABELS: Record<string, string> = {
  age: "Age",
  gender: "Gender",
  state: "State",
  residence: "Residence",
  occupation: "Occupation",
  income: "Income",
  category: "Category",
  disability: "Disability",
  student: "Student",
  bpl: "BPL",
  marital: "Marital Status",
};

interface WizardContextType {
  answers: WizardAnswers;
  currentStep: number;
  totalSteps: number;
  stepKey: string;
  setAnswer: (field: keyof WizardAnswers, value: unknown) => void;
  clearAnswers: () => void;
  isComplete: () => boolean;
  getStepLabel: (step: number) => string;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  // Load saved answers from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setAnswers(parsed as WizardAnswers);
          // Find the next unanswered step
          let nextStep = 1;
          for (const field of wizardFieldOrder) {
            if (parsed[field] === undefined) break;
            nextStep++;
          }
          setCurrentStep(Math.min(nextStep, wizardFieldOrder.length));
        }
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist answers to sessionStorage on change
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(answers));
  }, [answers, hydrated]);

  const setAnswer = useCallback(
    (field: keyof WizardAnswers, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const clearAnswers = useCallback(() => {
    setAnswers({});
    setCurrentStep(1);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const stepKey = wizardFieldOrder[currentStep - 1];

  const isComplete = useCallback(() => {
    return currentStep >= wizardFieldOrder.length;
  }, [currentStep]);

  const getStepLabel = useCallback((step: number) => {
    const key = wizardFieldOrder[step - 1];
    return STEP_LABELS[key] || `Step ${step}`;
  }, []);

  if (!hydrated) return null;

  return (
    <WizardContext.Provider
      value={{
        answers,
        currentStep,
        totalSteps: wizardFieldOrder.length,
        stepKey,
        setAnswer,
        clearAnswers,
        isComplete,
        getStepLabel,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return ctx;
}