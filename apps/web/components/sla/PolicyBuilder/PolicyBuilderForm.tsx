"use client";

import { useReducer, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, PageHeader } from "@uniflo/ui";
import { ArrowLeft, Ticket, ClipboardCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { users } from "@uniflo/mock-data";
import type {
  SLAPolicy,
  SLAModule,
  SLACondition,
  SLAConditionField,
  SLATarget,
  SLAMetricType,
  SLATimeUnit,
} from "@uniflo/mock-data";
import { ConditionBuilder } from "./ConditionBuilder";
import { TargetBuilder } from "./TargetBuilder";
import { EscalationConfig } from "./EscalationConfig";
import { BusinessHoursConfig } from "./BusinessHoursConfig";
import { PolicyBuilderSidebar } from "./PolicyBuilderSidebar";

// ---- State & Reducer ----

interface BuilderState {
  name: string;
  description: string;
  module: SLAModule | null;
  conditions: SLACondition[];
  conditionLogic: "AND" | "OR";
  targets: SLATarget[];
  escalation_enabled: boolean;
  escalation_config: {
    escalate_to: string;
    escalate_after_breach_minutes: number;
    notify_channels: string[];
  };
  business_hours: {
    timezone: string;
    start_hour: number;
    end_hour: number;
    working_days: number[];
  };
  priority_order: number;
  errors: Record<string, string>;
}

type BuilderAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_MODULE"; payload: SLAModule }
  | { type: "ADD_CONDITION" }
  | { type: "UPDATE_CONDITION"; payload: { id: string; updates: Partial<SLACondition> } }
  | { type: "REMOVE_CONDITION"; payload: string }
  | { type: "SET_CONDITION_LOGIC"; payload: "AND" | "OR" }
  | { type: "ADD_TARGET"; payload: SLAMetricType }
  | { type: "UPDATE_TARGET"; payload: { id: string; updates: Partial<SLATarget> } }
  | { type: "REMOVE_TARGET"; payload: string }
  | { type: "SET_ESCALATION_ENABLED"; payload: boolean }
  | { type: "UPDATE_ESCALATION"; payload: Partial<BuilderState["escalation_config"]> }
  | { type: "UPDATE_BUSINESS_HOURS"; payload: Partial<BuilderState["business_hours"]> }
  | { type: "SET_PRIORITY_ORDER"; payload: number }
  | { type: "VALIDATE" }
  | { type: "CLEAR_ERRORS" };

const metricLabels: Record<SLAMetricType, string> = {
  first_response: "First Response",
  resolution: "Resolution",
  completion: "Completion",
  update_interval: "Update Interval",
};

let conditionCounter = 100;
let targetCounter = 100;

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload, errors: { ...state.errors, name: "" } };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload };
    case "SET_MODULE":
      return {
        ...state,
        module: action.payload,
        conditions: [],
        targets: [],
        errors: { ...state.errors, module: "" },
      };
    case "ADD_CONDITION": {
      const id = `cond_new_${++conditionCounter}`;
      const newCond: SLACondition = {
        id,
        field: "priority" as SLAConditionField,
        operator: "equals",
        value: "",
      };
      return { ...state, conditions: [...state.conditions, newCond] };
    }
    case "UPDATE_CONDITION":
      return {
        ...state,
        conditions: state.conditions.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case "REMOVE_CONDITION":
      return {
        ...state,
        conditions: state.conditions.filter((c) => c.id !== action.payload),
      };
    case "SET_CONDITION_LOGIC":
      return { ...state, conditionLogic: action.payload };
    case "ADD_TARGET": {
      const id = `tgt_new_${++targetCounter}`;
      const newTarget: SLATarget = {
        id,
        metric: action.payload,
        label: metricLabels[action.payload],
        target_value: 1,
        target_unit: "hours" as SLATimeUnit,
        business_hours_only: false,
        warning_threshold_percent: 75,
      };
      return {
        ...state,
        targets: [...state.targets, newTarget],
        errors: { ...state.errors, targets: "" },
      };
    }
    case "UPDATE_TARGET":
      return {
        ...state,
        targets: state.targets.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case "REMOVE_TARGET":
      return {
        ...state,
        targets: state.targets.filter((t) => t.id !== action.payload),
      };
    case "SET_ESCALATION_ENABLED":
      return { ...state, escalation_enabled: action.payload };
    case "UPDATE_ESCALATION":
      return {
        ...state,
        escalation_config: { ...state.escalation_config, ...action.payload },
      };
    case "UPDATE_BUSINESS_HOURS":
      return {
        ...state,
        business_hours: { ...state.business_hours, ...action.payload },
      };
    case "SET_PRIORITY_ORDER":
      return { ...state, priority_order: action.payload };
    case "VALIDATE": {
      const errors: Record<string, string> = {};
      if (!state.name.trim()) errors.name = "Policy name is required";
      if (!state.module) errors.module = "Select which module this policy covers";
      if (state.targets.length === 0) errors.targets = "Add at least one SLA target";
      return { ...state, errors };
    }
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    default:
      return state;
  }
}

function buildInitialState(policy?: SLAPolicy): BuilderState {
  if (policy) {
    return {
      name: policy.name,
      description: policy.description,
      module: policy.module,
      conditions: policy.conditions,
      conditionLogic: "AND",
      targets: policy.targets,
      escalation_enabled: policy.escalation_enabled,
      escalation_config: policy.escalation_config ?? {
        escalate_to: "",
        escalate_after_breach_minutes: 30,
        notify_channels: ["email", "in_app"],
      },
      business_hours: policy.business_hours,
      priority_order: policy.priority_order,
      errors: {},
    };
  }
  return {
    name: "",
    description: "",
    module: null,
    conditions: [],
    conditionLogic: "AND",
    targets: [],
    escalation_enabled: false,
    escalation_config: {
      escalate_to: "",
      escalate_after_breach_minutes: 30,
      notify_channels: ["email", "in_app"],
    },
    business_hours: {
      timezone: "America/Chicago",
      start_hour: 9,
      end_hour: 17,
      working_days: [1, 2, 3, 4, 5],
    },
    priority_order: 1,
    errors: {},
  };
}

// ---- Component ----

interface PolicyBuilderFormProps {
  existingPolicy?: SLAPolicy;
}

const moduleOptions: { value: SLAModule; label: string; description: string; Icon: typeof Ticket }[] = [
  {
    value: "tickets",
    label: "Tickets",
    description: "Track response and resolution times for support tickets.",
    Icon: Ticket,
  },
  {
    value: "audits",
    label: "Audits",
    description: "Track completion deadlines for scheduled audits.",
    Icon: ClipboardCheck,
  },
  {
    value: "capa",
    label: "CAPA",
    description: "Track resolution deadlines for corrective actions.",
    Icon: AlertTriangle,
  },
];

export function PolicyBuilderForm({ existingPolicy }: PolicyBuilderFormProps) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, existingPolicy, (p) =>
    buildInitialState(p)
  );

  const isEdit = !!existingPolicy;
  const title = isEdit ? `Edit: ${state.name || "SLA Policy"}` : "New SLA Policy";

  const createdByName = useMemo(() => {
    if (existingPolicy) {
      const u = (users as Array<{ id: string; name: string }>).find(
        (u) => u.id === existingPolicy.created_by
      );
      return u?.name ?? existingPolicy.created_by;
    }
    return "Current User";
  }, [existingPolicy]);

  const handlePublish = useCallback(() => {
    dispatch({ type: "VALIDATE" });
    // Check validation inline
    const errors: Record<string, string> = {};
    if (!state.name.trim()) errors.name = "Policy name is required";
    if (!state.module) errors.module = "Select which module this policy covers";
    if (state.targets.length === 0) errors.targets = "Add at least one SLA target";
    if (Object.keys(errors).length > 0) return;

    // In a real app, this would save to API
    router.push(`/${locale}/sla/`);
  }, [state, locale, router]);

  const handleSaveDraft = useCallback(() => {
    // Save without validation
    router.push(`/${locale}/sla/`);
  }, [locale, router]);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/sla/`}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Policies
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button size="sm" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>

      <PageHeader
        title={title}
        subtitle="Define conditions and time targets for your SLA policy"
        className="px-0 py-0 border-0"
      />

      {/* Two-panel layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main form */}
        <div className="flex-1 space-y-6">
          {/* Module selector */}
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              What does this policy cover?
            </h3>
            {state.errors.module && (
              <p className="text-xs text-[var(--accent-red)] mb-2">
                {state.errors.module}
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-3 mt-2">
              {moduleOptions.map((opt) => {
                const isSelected = state.module === opt.value;
                return (
                  <button
                    key={opt.value}
                    className="rounded-md border p-3 text-left transition-all"
                    style={{
                      borderColor: isSelected ? "var(--accent-blue)" : "var(--border-default)",
                      borderInlineStartWidth: isSelected ? "4px" : "1px",
                      borderInlineStartColor: isSelected ? "var(--accent-blue)" : "var(--border-default)",
                      backgroundColor: isSelected
                        ? "color-mix(in srgb, var(--accent-blue) 5%, var(--bg-secondary))"
                        : "var(--bg-secondary)",
                    }}
                    onClick={() =>
                      dispatch({ type: "SET_MODULE", payload: opt.value })
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <opt.Icon
                        className="h-5 w-5"
                        style={{
                          color: isSelected
                            ? "var(--accent-blue)"
                            : "var(--text-muted)",
                        }}
                      />
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditions */}
          {state.module && (
            <ConditionBuilder
              conditions={state.conditions}
              conditionLogic={state.conditionLogic}
              module={state.module}
              onAdd={() => dispatch({ type: "ADD_CONDITION" })}
              onUpdate={(id, updates) =>
                dispatch({ type: "UPDATE_CONDITION", payload: { id, updates } })
              }
              onRemove={(id) => dispatch({ type: "REMOVE_CONDITION", payload: id })}
              onLogicChange={(logic) =>
                dispatch({ type: "SET_CONDITION_LOGIC", payload: logic })
              }
            />
          )}

          {/* Targets */}
          {state.module && (
            <TargetBuilder
              targets={state.targets}
              module={state.module}
              onAdd={(metric) =>
                dispatch({ type: "ADD_TARGET", payload: metric })
              }
              onUpdate={(id, updates) =>
                dispatch({ type: "UPDATE_TARGET", payload: { id, updates } })
              }
              onRemove={(id) => dispatch({ type: "REMOVE_TARGET", payload: id })}
              error={state.errors.targets}
            />
          )}

          {/* Escalation */}
          <EscalationConfig
            enabled={state.escalation_enabled}
            escalateTo={state.escalation_config.escalate_to}
            afterBreachMinutes={state.escalation_config.escalate_after_breach_minutes}
            notifyChannels={state.escalation_config.notify_channels}
            onToggle={(enabled) =>
              dispatch({ type: "SET_ESCALATION_ENABLED", payload: enabled })
            }
            onUpdate={(updates) =>
              dispatch({ type: "UPDATE_ESCALATION", payload: updates })
            }
          />

          {/* Business hours */}
          <BusinessHoursConfig
            timezone={state.business_hours.timezone}
            startHour={state.business_hours.start_hour}
            endHour={state.business_hours.end_hour}
            workingDays={state.business_hours.working_days}
            onUpdate={(updates) =>
              dispatch({ type: "UPDATE_BUSINESS_HOURS", payload: updates })
            }
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
          <PolicyBuilderSidebar
            name={state.name}
            description={state.description}
            priorityOrder={state.priority_order}
            status={existingPolicy?.status ?? "draft"}
            createdBy={createdByName}
            errors={state.errors}
            onNameChange={(v) => dispatch({ type: "SET_NAME", payload: v })}
            onDescriptionChange={(v) =>
              dispatch({ type: "SET_DESCRIPTION", payload: v })
            }
            onPriorityOrderChange={(v) =>
              dispatch({ type: "SET_PRIORITY_ORDER", payload: v })
            }
            onDelete={isEdit ? () => router.push(`/${locale}/sla/`) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
