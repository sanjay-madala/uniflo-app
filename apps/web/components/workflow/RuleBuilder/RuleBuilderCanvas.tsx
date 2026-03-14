"use client";

import { useReducer, useCallback } from "react";
import type { RuleTrigger, RuleCondition, RuleAction, ActionType, AutomationRule, RuleStatus } from "@uniflo/mock-data";
import { TriggerBlock } from "./TriggerBlock";
import { ConditionGroup } from "./ConditionGroup";
import { ActionList } from "./ActionList";
import { FlowConnector } from "./FlowConnector";
import { RuleBuilderSidebar } from "./RuleBuilderSidebar";

// --- State ---
interface RuleBuilderState {
  name: string;
  description: string;
  trigger: RuleTrigger | null;
  conditions: RuleCondition[];
  conditionLogic: "AND" | "OR";
  actions: RuleAction[];
  locationScope: string[];
  createdBy: string;
  status: RuleStatus;
  isDirty: boolean;
  errors: Record<string, string>;
}

type RuleBuilderAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_TRIGGER"; payload: RuleTrigger }
  | { type: "ADD_CONDITION" }
  | { type: "UPDATE_CONDITION"; payload: { id: string; updates: Partial<RuleCondition> } }
  | { type: "REMOVE_CONDITION"; payload: string }
  | { type: "SET_CONDITION_LOGIC"; payload: "AND" | "OR" }
  | { type: "ADD_ACTION"; payload: ActionType }
  | { type: "UPDATE_ACTION"; payload: { id: string; updates: Partial<RuleAction> } }
  | { type: "REMOVE_ACTION"; payload: string }
  | { type: "SET_LOCATION_SCOPE"; payload: string }
  | { type: "VALIDATE" }
  | { type: "CLEAR_ERRORS" };

let conditionCounter = 100;
let actionCounter = 100;

const actionDefaults: Record<ActionType, { label: string; icon: string; config: Record<string, string | number | boolean> }> = {
  create_ticket: { label: "Create Ticket", icon: "ClipboardList", config: { title: "", priority: "medium" } },
  create_capa: { label: "Create CAPA", icon: "AlertTriangle", config: { title: "", owner_id: "", severity: "high" } },
  create_task: { label: "Create Task", icon: "CheckSquare", config: { title: "", assignee_id: "", priority: "medium" } },
  assign_to: { label: "Assign To", icon: "UserPlus", config: { user_id: "" } },
  send_notification: { label: "Send Notification", icon: "Bell", config: { channel: "email", recipients: "manager", message: "" } },
  change_status: { label: "Change Status", icon: "ArrowRightCircle", config: { status: "" } },
  add_tag: { label: "Add Tag", icon: "Tag", config: { tag: "" } },
  update_field: { label: "Update Field", icon: "Edit", config: { field: "", value: "" } },
  trigger_audit: { label: "Trigger Audit", icon: "ClipboardCheck", config: { template: "" } },
};

function reducer(state: RuleBuilderState, action: RuleBuilderAction): RuleBuilderState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload, isDirty: true, errors: { ...state.errors, name: "" } };

    case "SET_DESCRIPTION":
      return { ...state, description: action.payload, isDirty: true };

    case "SET_TRIGGER":
      return {
        ...state,
        trigger: action.payload,
        conditions: [],
        isDirty: true,
        errors: { ...state.errors, trigger: "" },
      };

    case "ADD_CONDITION": {
      const id = `cond_new_${++conditionCounter}`;
      const newCondition: RuleCondition = {
        id,
        field: "priority",
        operator: "equals",
        value: "",
      };
      return { ...state, conditions: [...state.conditions, newCondition], isDirty: true };
    }

    case "UPDATE_CONDITION":
      return {
        ...state,
        conditions: state.conditions.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c,
        ),
        isDirty: true,
      };

    case "REMOVE_CONDITION":
      return {
        ...state,
        conditions: state.conditions.filter(c => c.id !== action.payload),
        isDirty: true,
      };

    case "SET_CONDITION_LOGIC":
      return { ...state, conditionLogic: action.payload, isDirty: true };

    case "ADD_ACTION": {
      const id = `act_new_${++actionCounter}`;
      const defaults = actionDefaults[action.payload];
      const newAction: RuleAction = {
        id,
        type: action.payload,
        label: defaults.label,
        icon: defaults.icon,
        config: { ...defaults.config },
      };
      return {
        ...state,
        actions: [...state.actions, newAction],
        isDirty: true,
        errors: { ...state.errors, actions: "" },
      };
    }

    case "UPDATE_ACTION":
      return {
        ...state,
        actions: state.actions.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a,
        ),
        isDirty: true,
      };

    case "REMOVE_ACTION":
      return {
        ...state,
        actions: state.actions.filter(a => a.id !== action.payload),
        isDirty: true,
      };

    case "SET_LOCATION_SCOPE": {
      const locId = action.payload;
      const newScope = state.locationScope.includes(locId)
        ? state.locationScope.filter(l => l !== locId)
        : [...state.locationScope, locId];
      return { ...state, locationScope: newScope, isDirty: true };
    }

    case "VALIDATE": {
      const errors: Record<string, string> = {};
      if (!state.name.trim()) errors.name = "Rule name is required";
      if (!state.trigger) errors.trigger = "Select a trigger event";
      if (state.actions.length === 0) errors.actions = "Add at least one action";
      return { ...state, errors };
    }

    case "CLEAR_ERRORS":
      return { ...state, errors: {} };

    default:
      return state;
  }
}

function createInitialState(existingRule?: AutomationRule): RuleBuilderState {
  if (existingRule) {
    return {
      name: existingRule.name,
      description: existingRule.description,
      trigger: existingRule.trigger,
      conditions: existingRule.conditions,
      conditionLogic: existingRule.conditions[0]?.logic ?? "AND",
      actions: existingRule.actions,
      locationScope: existingRule.location_scope,
      createdBy: existingRule.created_by,
      status: existingRule.status,
      isDirty: false,
      errors: {},
    };
  }
  return {
    name: "",
    description: "",
    trigger: null,
    conditions: [],
    conditionLogic: "AND",
    actions: [],
    locationScope: [],
    createdBy: "usr_001",
    status: "draft",
    isDirty: false,
    errors: {},
  };
}

interface RuleBuilderCanvasProps {
  existingRule?: AutomationRule;
  onSaveDraft: (state: RuleBuilderState) => void;
  onPublish: (state: RuleBuilderState) => void;
  onDelete?: () => void;
  onBack: () => void;
}

export function RuleBuilderCanvas({
  existingRule,
  onSaveDraft,
  onPublish,
  onDelete,
  onBack,
}: RuleBuilderCanvasProps) {
  const [state, dispatch] = useReducer(reducer, existingRule, createInitialState);

  const handlePublish = useCallback(() => {
    dispatch({ type: "VALIDATE" });
    // Check if valid after validation
    const errors: Record<string, string> = {};
    if (!state.name.trim()) errors.name = "Rule name is required";
    if (!state.trigger) errors.trigger = "Select a trigger event";
    if (state.actions.length === 0) errors.actions = "Add at least one action";

    if (Object.keys(errors).length === 0) {
      onPublish(state);
    }
  }, [state, onPublish]);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm text-[var(--accent-blue)] hover:underline"
          >
            &larr; Back to Rules
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {existingRule ? "Edit Automation Rule" : "New Automation Rule"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveDraft(state)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] rounded-sm transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-4 py-2 bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue)]/90 rounded-sm transition-colors"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Builder content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mobile notice for small screens */}
          <div className="block lg:hidden mb-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              The rule builder requires a screen width of 1024px or larger.
            </p>
            <button onClick={onBack} className="mt-2 text-sm text-[var(--accent-blue)] hover:underline">
              View rules
            </button>
          </div>

          <div className="hidden lg:block max-w-2xl mx-auto space-y-0">
            {/* Trigger */}
            <TriggerBlock
              trigger={state.trigger}
              onSelect={trigger => dispatch({ type: "SET_TRIGGER", payload: trigger })}
              error={state.errors.trigger}
            />

            {/* Connector (dashed if no trigger) */}
            <FlowConnector variant={state.trigger ? "solid" : "dashed"} />

            {/* Conditions */}
            <ConditionGroup
              conditions={state.conditions}
              logic={state.conditionLogic}
              module={state.trigger?.module ?? "tickets"}
              onSetLogic={logic => dispatch({ type: "SET_CONDITION_LOGIC", payload: logic })}
              onAddCondition={() => dispatch({ type: "ADD_CONDITION" })}
              onUpdateCondition={(id, updates) =>
                dispatch({ type: "UPDATE_CONDITION", payload: { id, updates } })
              }
              onRemoveCondition={id => dispatch({ type: "REMOVE_CONDITION", payload: id })}
            />

            {/* Connector */}
            <FlowConnector variant="solid" />

            {/* Actions */}
            <ActionList
              actions={state.actions}
              onAddAction={type => dispatch({ type: "ADD_ACTION", payload: type })}
              onUpdateAction={(id, updates) =>
                dispatch({ type: "UPDATE_ACTION", payload: { id, updates } })
              }
              onRemoveAction={id => dispatch({ type: "REMOVE_ACTION", payload: id })}
              error={state.errors.actions}
            />
          </div>
        </div>

        {/* Sidebar (desktop only) */}
        <div className="hidden lg:block w-[320px] shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 overflow-y-auto">
          <RuleBuilderSidebar
            name={state.name}
            description={state.description}
            locationScope={state.locationScope}
            createdBy={state.createdBy}
            status={state.status}
            errors={state.errors}
            onNameChange={v => dispatch({ type: "SET_NAME", payload: v })}
            onDescriptionChange={v => dispatch({ type: "SET_DESCRIPTION", payload: v })}
            onLocationToggle={id => dispatch({ type: "SET_LOCATION_SCOPE", payload: id })}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export type { RuleBuilderState };
