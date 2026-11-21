"use strict";

import { useWizard } from "./WizardContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuestionDef {
  type: "number" | "select";
  min?: number;
  max?: number;
  options?: Array<{ value: string; labelKey: string }>;
}

const QUESTIONS: Record<string, QuestionDef> = {
  age: { type: "number", min: 0, max: 120 },
  gender: {
    type: "select",
    options: [
      { value: "male", labelKey: "options.male" },
      { value: "female", labelKey: "options.female" },
      { value: "other", labelKey: "options.other" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  state: {
    type: "select",
    options: [
      { value: "AS", labelKey: "schemes.states.AS" },
      { value: "DL", labelKey: "schemes.states.DL" },
      { value: "MH", labelKey: "schemes.states.MH" },
      { value: "UP", labelKey: "schemes.states.UP" },
      { value: "WB", labelKey: "schemes.states.WB" },
      { value: "TN", labelKey: "schemes.states.TN" },
      { value: "KA", labelKey: "schemes.states.KA" },
      { value: "GJ", labelKey: "schemes.states.GJ" },
      { value: "RJ", labelKey: "schemes.states.RJ" },
      { value: "PB", labelKey: "schemes.states.PB" },
      { value: "HR", labelKey: "schemes.states.HR" },
      { value: "BR", labelKey: "schemes.states.BR" },
      { value: "OD", labelKey: "schemes.states.OD" },
    ],
  },
  residence: {
    type: "select",
    options: [
      { value: "rural", labelKey: "options.rural" },
      { value: "urban", labelKey: "options.urban" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  occupation: {
    type: "select",
    options: [
      { value: "farmer", labelKey: "options.farmer" },
      { value: "labourer", labelKey: "options.labourer" },
      { value: "salaried", labelKey: "options.salaried" },
      { value: "selfEmployed", labelKey: "options.selfEmployed" },
      { value: "studentOcc", labelKey: "options.studentOcc" },
      { value: "unemployed", labelKey: "options.unemployed" },
      { value: "retired", labelKey: "options.retired" },
      { value: "otherOcc", labelKey: "options.otherOcc" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  income: {
    type: "select",
    options: [
      { value: "under1L", labelKey: "options.under1L" },
      { value: "oneToTwoL", labelKey: "options.oneToTwoL" },
      { value: "twoToThreeL", labelKey: "options.twoToThreeL" },
      { value: "threeToFiveL", labelKey: "options.threeToFiveL" },
      { value: "fiveToEightL", labelKey: "options.fiveToEightL" },
      { value: "eightToTwelveL", labelKey: "options.eightToTwelveL" },
      { value: "aboveTwelveL", labelKey: "options.aboveTwelveL" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  category: {
    type: "select",
    options: [
      { value: "general", labelKey: "options.general" },
      { value: "sc", labelKey: "options.sc" },
      { value: "st", labelKey: "options.st" },
      { value: "obc", labelKey: "options.obc" },
      { value: "ews", labelKey: "options.ews" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  disability: {
    type: "select",
    options: [
      { value: "yes", labelKey: "options.yes" },
      { value: "no", labelKey: "options.no" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  student: {
    type: "select",
    options: [
      { value: "yes", labelKey: "options.yes" },
      { value: "no", labelKey: "options.no" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  bpl: {
    type: "select",
    options: [
      { value: "yes", labelKey: "options.yes" },
      { value: "no", labelKey: "options.no" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
  marital: {
    type: "select",
    options: [
      { value: "single", labelKey: "options.single" },
      { value: "married", labelKey: "options.married" },
      { value: "widowed", labelKey: "options.widowed" },
      { value: "divorced", labelKey: "options.divorced" },
      { value: "prefer-not-to-say", labelKey: "options.preferNotToSay" },
    ],
  },
};

const QUESTION_LABELS: Record<string, string> = {
  age: "questions.age.label",
  gender: "questions.gender.label",
  state: "questions.state.label",
  residence: "questions.residence.label",
  occupation: "questions.occupation.label",
  income: "questions.income.label",
  category: "questions.category.label",
  disability: "questions.disability.label",
  student: "questions.student.label",
  bpl: "questions.bpl.label",
  marital: "questions.marital.label",
};

const QUESTION_HINTS: Record<string, string> = {
  age: "questions.age.hint",
  gender: "questions.gender.hint",
  state: "questions.state.hint",
  residence: "questions.residence.hint",
  occupation: "questions.occupation.hint",
  income: "questions.income.hint",
  category: "questions.category.hint",
  disability: "questions.disability.hint",
  student: "questions.student.hint",
  bpl: "questions.bpl.hint",
  marital: "questions.marital.hint",
};

export default function QuestionRenderer() {
  const { stepKey, answers, setAnswer, currentStep, totalSteps } = useWizard();
  const router = useRouter();
  const t = getTranslations({ namespace: "wizard" });
  const ct = getTranslations({ namespace: "common" });

  const question = QUESTIONS[stepKey];
  const labelKey = QUESTION_LABELS[stepKey];
  const hintKey = QUESTION_HINTS[stepKey];
  const currentValue = answers[stepKey as keyof typeof answers];
  const [inputValue, setInputValue] = useState<string | number | "">("");

  useEffect(() => {
    if (currentValue !== undefined && currentValue !== null) {
      setInputValue(currentValue);
    }
  }, [currentValue]);

  const handleNext = () => {
    const val = inputValue === "" ? undefined : inputValue;
    if (val !== undefined) {
      setAnswer(stepKey as keyof typeof answers, val);
    }

    if (currentStep >= totalSteps) {
      router.push("/wizard/results");
    } else {
      router.push(`/wizard/step/${currentStep + 1}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/wizard/step/${currentStep - 1}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
          {ct("wizard.progress", { step: currentStep, total: totalSteps })}
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">
          {t(labelKey)}
        </h2>
        <p className="text-slate-600 mt-2">{t(hintKey)}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {question.type === "number" ? (
          <div className="space-y-4">
            <input
              type="number"
              min={question.min}
              max={question.max}
              value={typeof inputValue === "number" ? inputValue : ""}
              onChange={(e) =>
                setInputValue(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder={t("questions.age.placeholder")}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
            />
            <button
              onClick={() => {
                setAnswer(stepKey as keyof typeof answers, undefined);
                if (currentStep >= totalSteps) {
                  router.push("/wizard/results");
                } else {
                  router.push(`/wizard/step/${currentStep + 1}`);
                }
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"
            >
              {ct("wizard.options.skip")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAnswer(stepKey as keyof typeof answers, opt.value);
                  if (currentStep >= totalSteps) {
                    router.push("/wizard/results");
                  } else {
                    router.push(`/wizard/step/${currentStep + 1}`);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg text-left text-sm font-medium transition-colors ${
                  currentValue === opt.value
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
            <button
              onClick={() => {
                setAnswer(stepKey as keyof typeof answers, undefined);
                if (currentStep >= totalSteps) {
                  router.push("/wizard/results");
                } else {
                  router.push(`/wizard/step/${currentStep + 1}`);
                }
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"
            >
              {ct("wizard.options.skip")}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            {ct("wizard.buttons.back")}
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          {currentStep >= totalSteps
            ? ct("wizard.buttons.finish")
            : ct("wizard.buttons.next")}
        </button>
      </div>
    </div>
  );
}