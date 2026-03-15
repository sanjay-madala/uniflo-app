-- ============================================================================
-- Row-Level Security (RLS) for Uniflo multi-tenant isolation
-- Every table with org_id gets org_isolation policies.
-- The app sets: SET app.current_org_id = '<uuid>' on each request.
-- ============================================================================

-- Helper: ensure the setting exists with a safe default
DO $$ BEGIN
  PERFORM set_config('app.current_org_id', '00000000-0000-0000-0000-000000000000', true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─── Core Tables ─────────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON users USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON users WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON locations USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON locations WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON roles USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON roles WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON role_permissions
  USING (role_id IN (SELECT id FROM roles WHERE org_id = current_setting('app.current_org_id')::uuid));
CREATE POLICY org_isolation_insert ON role_permissions
  WITH CHECK (role_id IN (SELECT id FROM roles WHERE org_id = current_setting('app.current_org_id')::uuid));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON user_roles
  USING (user_id IN (SELECT id FROM users WHERE org_id = current_setting('app.current_org_id')::uuid));
CREATE POLICY org_isolation_insert ON user_roles
  WITH CHECK (user_id IN (SELECT id FROM users WHERE org_id = current_setting('app.current_org_id')::uuid));

-- ─── Tickets ─────────────────────────────────────────────────────────────────

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON tickets USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON tickets WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON ticket_comments USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON ticket_comments WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON ticket_attachments USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON ticket_attachments WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Audits ──────────────────────────────────────────────────────────────────

ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audit_templates USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audit_templates WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE audit_template_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audit_template_sections USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audit_template_sections WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE audit_template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audit_template_items USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audit_template_items WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audits USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audits WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audit_results USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audit_results WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE audit_item_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON audit_item_results USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON audit_item_results WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── SOPs ────────────────────────────────────────────────────────────────────

ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sops USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sops WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE sop_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sop_steps USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sop_steps WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sop_versions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sop_versions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE sop_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sop_acknowledgments USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sop_acknowledgments WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── CAPA ────────────────────────────────────────────────────────────────────

ALTER TABLE capas ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON capas USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON capas WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE capa_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON capa_actions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON capa_actions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE capa_effectiveness_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON capa_effectiveness_reviews USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON capa_effectiveness_reviews WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Tasks ───────────────────────────────────────────────────────────────────

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON projects USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON projects WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON tasks USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON tasks WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON subtasks USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON subtasks WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON task_comments USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON task_comments WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Knowledge Base ──────────────────────────────────────────────────────────

ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON kb_categories USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON kb_categories WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON kb_articles USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON kb_articles WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE kb_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON kb_collections USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON kb_collections WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Automation ──────────────────────────────────────────────────────────────

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation_rules USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON automation_rules WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE rule_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON rule_conditions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON rule_conditions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE rule_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON rule_actions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON rule_actions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE rule_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON rule_executions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON rule_executions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── SLA ─────────────────────────────────────────────────────────────────────

ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sla_policies USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sla_policies WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE sla_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sla_targets USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sla_targets WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE sla_breaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON sla_breaches USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON sla_breaches WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Goals ───────────────────────────────────────────────────────────────────

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON goals USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON goals WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON key_results USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON key_results WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE kr_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON kr_progress USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON kr_progress WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Broadcasts ──────────────────────────────────────────────────────────────

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON broadcasts USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON broadcasts WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON read_receipts USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON read_receipts WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── Training ────────────────────────────────────────────────────────────────

ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON training_modules USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON training_modules WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE training_content_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON training_content_blocks USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON training_content_blocks WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON training_enrollments USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON training_enrollments WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON quiz_questions USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON quiz_questions WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON quiz_attempts USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON quiz_attempts WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON certificates USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON certificates WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);

-- ─── CSAT ────────────────────────────────────────────────────────────────────

ALTER TABLE csat_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON csat_surveys USING (org_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY org_isolation_insert ON csat_surveys WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);
