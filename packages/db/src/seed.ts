import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// ─── Stable UUIDs (deterministic for dev, matching mock data patterns) ──────

const ORG_ID = '00000000-0000-0000-0000-000000000001';

const USER_IDS = {
  admin: '10000000-0000-0000-0000-000000000001',
  manager: '10000000-0000-0000-0000-000000000002',
  auditor: '10000000-0000-0000-0000-000000000003',
  support_agent: '10000000-0000-0000-0000-000000000004',
  field_staff: '10000000-0000-0000-0000-000000000005',
};

const LOC_IDS = {
  hq: '20000000-0000-0000-0000-000000000001',
  west_coast: '20000000-0000-0000-0000-000000000002',
  east_coast: '20000000-0000-0000-0000-000000000003',
  la_store: '20000000-0000-0000-0000-000000000004',
  nyc_store: '20000000-0000-0000-0000-000000000005',
};

const ROLE_IDS = {
  admin: '30000000-0000-0000-0000-000000000001',
  manager: '30000000-0000-0000-0000-000000000002',
  auditor: '30000000-0000-0000-0000-000000000003',
  support_agent: '30000000-0000-0000-0000-000000000004',
  field_staff: '30000000-0000-0000-0000-000000000005',
};

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/uniflo',
  });

  const db = drizzle(pool, { schema });

  console.log('Seeding Uniflo database...');

  // ── Organization ─────────────────────────────────────────────────────────

  await db.insert(schema.organizations).values({
    id: ORG_ID,
    name: 'Demo Corp',
    slug: 'demo-corp',
    domain: 'democorp.com',
    plan: 'enterprise',
    settings: { features: { ai_assist: true, advanced_analytics: true } },
    branding: { primaryColor: '#3B82F6', logo: null },
  });
  console.log('  + 1 organization');

  // ── Users ────────────────────────────────────────────────────────────────

  await db.insert(schema.users).values([
    { id: USER_IDS.admin, orgId: ORG_ID, email: 'sarah.chen@democorp.com', name: 'Sarah Chen', firebaseUid: 'fb_usr_001', locale: 'en', timezone: 'America/New_York' },
    { id: USER_IDS.manager, orgId: ORG_ID, email: 'marcus.j@democorp.com', name: 'Marcus Johnson', firebaseUid: 'fb_usr_002', locale: 'en', timezone: 'America/New_York' },
    { id: USER_IDS.auditor, orgId: ORG_ID, email: 'p.sharma@democorp.com', name: 'Priya Sharma', firebaseUid: 'fb_usr_003', locale: 'en', timezone: 'America/Los_Angeles' },
    { id: USER_IDS.support_agent, orgId: ORG_ID, email: 't.riley@democorp.com', name: 'Tom Riley', firebaseUid: 'fb_usr_004', locale: 'en', timezone: 'America/Chicago' },
    { id: USER_IDS.field_staff, orgId: ORG_ID, email: 'a.kowalski@democorp.com', name: 'Ana Kowalski', firebaseUid: 'fb_usr_005', locale: 'en', timezone: 'America/Los_Angeles' },
  ]);
  console.log('  + 5 users');

  // ── Locations ────────────────────────────────────────────────────────────

  await db.insert(schema.locations).values([
    { id: LOC_IDS.hq, orgId: ORG_ID, name: 'HQ - New York', type: 'headquarters', parentId: null, address: { city: 'New York', state: 'NY', country: 'US' } },
    { id: LOC_IDS.west_coast, orgId: ORG_ID, name: 'West Coast Hub - LA', type: 'regional', parentId: LOC_IDS.hq, address: { city: 'Los Angeles', state: 'CA', country: 'US' } },
    { id: LOC_IDS.east_coast, orgId: ORG_ID, name: 'East Coast Hub - Boston', type: 'regional', parentId: LOC_IDS.hq, address: { city: 'Boston', state: 'MA', country: 'US' } },
    { id: LOC_IDS.la_store, orgId: ORG_ID, name: 'LA Downtown Store', type: 'store', parentId: LOC_IDS.west_coast, address: { city: 'Los Angeles', state: 'CA', country: 'US' } },
    { id: LOC_IDS.nyc_store, orgId: ORG_ID, name: 'NYC Midtown Store', type: 'store', parentId: LOC_IDS.east_coast, address: { city: 'New York', state: 'NY', country: 'US' } },
  ]);
  console.log('  + 5 locations');

  // ── Roles ────────────────────────────────────────────────────────────────

  await db.insert(schema.roles).values([
    { id: ROLE_IDS.admin, orgId: ORG_ID, name: 'Admin', isSystem: true },
    { id: ROLE_IDS.manager, orgId: ORG_ID, name: 'Manager', isSystem: true },
    { id: ROLE_IDS.auditor, orgId: ORG_ID, name: 'Auditor', isSystem: true },
    { id: ROLE_IDS.support_agent, orgId: ORG_ID, name: 'Support Agent', isSystem: true },
    { id: ROLE_IDS.field_staff, orgId: ORG_ID, name: 'Field Staff', isSystem: true },
  ]);
  console.log('  + 5 roles');

  // ── Role Permissions ─────────────────────────────────────────────────────

  const allModules = ['tickets', 'audits', 'sops', 'capa', 'tasks', 'knowledge', 'automation', 'sla', 'goals', 'broadcasts', 'training', 'csat'];
  const allActions = ['view', 'create', 'edit', 'delete', 'approve'];

  // Admin: full access on all modules
  await db.insert(schema.rolePermissions).values(
    allModules.map((mod) => ({
      roleId: ROLE_IDS.admin,
      module: mod,
      actions: allActions,
      locationScope: 'all' as const,
    }))
  );

  // Manager: CRUD + approve on key modules, location scoped to children
  await db.insert(schema.rolePermissions).values(
    allModules.map((mod) => ({
      roleId: ROLE_IDS.manager,
      module: mod,
      actions: ['view', 'create', 'edit', 'approve'],
      locationScope: 'children' as const,
    }))
  );

  // Auditor: audits full, view others
  await db.insert(schema.rolePermissions).values([
    { roleId: ROLE_IDS.auditor, module: 'audits', actions: allActions, locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.auditor, module: 'capa', actions: ['view', 'create'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.auditor, module: 'sops', actions: ['view'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.auditor, module: 'tickets', actions: ['view'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.auditor, module: 'tasks', actions: ['view'], locationScope: 'assigned' as const },
  ]);

  // Support Agent: tickets + capa
  await db.insert(schema.rolePermissions).values([
    { roleId: ROLE_IDS.support_agent, module: 'tickets', actions: ['view', 'create', 'edit'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.support_agent, module: 'capa', actions: ['view', 'create'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.support_agent, module: 'sops', actions: ['view'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.support_agent, module: 'knowledge', actions: ['view'], locationScope: 'assigned' as const },
  ]);

  // Field Staff: view + submit only
  await db.insert(schema.rolePermissions).values([
    { roleId: ROLE_IDS.field_staff, module: 'tasks', actions: ['view', 'edit'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.field_staff, module: 'audits', actions: ['view'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.field_staff, module: 'sops', actions: ['view'], locationScope: 'assigned' as const },
    { roleId: ROLE_IDS.field_staff, module: 'training', actions: ['view'], locationScope: 'assigned' as const },
  ]);

  console.log('  + role permissions');

  // ── User-Role Assignments ────────────────────────────────────────────────

  await db.insert(schema.userRoles).values([
    { userId: USER_IDS.admin, roleId: ROLE_IDS.admin, locationIds: null },
    { userId: USER_IDS.manager, roleId: ROLE_IDS.manager, locationIds: [LOC_IDS.hq, LOC_IDS.west_coast, LOC_IDS.east_coast] },
    { userId: USER_IDS.auditor, roleId: ROLE_IDS.auditor, locationIds: [LOC_IDS.west_coast, LOC_IDS.la_store] },
    { userId: USER_IDS.support_agent, roleId: ROLE_IDS.support_agent, locationIds: [LOC_IDS.nyc_store] },
    { userId: USER_IDS.field_staff, roleId: ROLE_IDS.field_staff, locationIds: [LOC_IDS.la_store] },
  ]);
  console.log('  + 5 user-role assignments');

  // ── Tickets ──────────────────────────────────────────────────────────────

  const TICKET_IDS = [
    '40000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000005',
  ];

  await db.insert(schema.tickets).values([
    { id: TICKET_IDS[0], orgId: ORG_ID, locationId: LOC_IDS.nyc_store, createdBy: USER_IDS.support_agent, title: 'HVAC unit making unusual noise', status: 'open', priority: 'high', category: 'maintenance', assigneeId: USER_IDS.field_staff, reporterId: USER_IDS.support_agent, tags: ['hvac', 'urgent'] },
    { id: TICKET_IDS[1], orgId: ORG_ID, locationId: LOC_IDS.la_store, createdBy: USER_IDS.field_staff, title: 'Floor cleaning schedule conflict', status: 'in_progress', priority: 'medium', category: 'housekeeping', assigneeId: USER_IDS.manager, reporterId: USER_IDS.field_staff },
    { id: TICKET_IDS[2], orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.admin, title: 'Fire extinguisher inspection overdue', status: 'open', priority: 'critical', category: 'compliance', assigneeId: USER_IDS.manager, tags: ['safety', 'compliance'] },
    { id: TICKET_IDS[3], orgId: ORG_ID, locationId: LOC_IDS.west_coast, createdBy: USER_IDS.auditor, title: 'Temperature log missing for cold storage', status: 'resolved', priority: 'high', category: 'fb', assigneeId: USER_IDS.field_staff, resolvedAt: new Date('2026-03-12T15:30:00Z') },
    { id: TICKET_IDS[4], orgId: ORG_ID, locationId: LOC_IDS.east_coast, createdBy: USER_IDS.manager, title: 'Guest complaint about room cleanliness', status: 'open', priority: 'medium', category: 'guest_relations', assigneeId: USER_IDS.support_agent },
  ]);
  console.log('  + 5 tickets');

  // ── Audit Templates ──────────────────────────────────────────────────────

  const TEMPLATE_IDS = [
    '50000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002',
  ];
  const SECTION_IDS = [
    '51000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000002',
  ];
  const ITEM_IDS = [
    '52000000-0000-0000-0000-000000000001',
    '52000000-0000-0000-0000-000000000002',
    '52000000-0000-0000-0000-000000000003',
    '52000000-0000-0000-0000-000000000004',
  ];

  await db.insert(schema.auditTemplates).values([
    { id: TEMPLATE_IDS[0], orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'Food Safety Compliance', description: 'Monthly food safety audit', category: 'food_safety', totalItems: 10, passThreshold: 80, version: '2.0' },
    { id: TEMPLATE_IDS[1], orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'Housekeeping Standards', description: 'Weekly housekeeping checklist', category: 'housekeeping', totalItems: 8, passThreshold: 85 },
  ]);

  await db.insert(schema.auditTemplateSections).values([
    { id: SECTION_IDS[0], orgId: ORG_ID, templateId: TEMPLATE_IDS[0], title: 'Temperature Control', weight: 1.5, sortOrder: 0 },
    { id: SECTION_IDS[1], orgId: ORG_ID, templateId: TEMPLATE_IDS[0], title: 'Hygiene & Sanitation', weight: 1.0, sortOrder: 1 },
  ]);

  await db.insert(schema.auditTemplateItems).values([
    { id: ITEM_IDS[0], orgId: ORG_ID, sectionId: SECTION_IDS[0], question: 'Are all refrigerators below 4C?', type: 'yes_no', required: true, severityIfFail: 'critical', photoRequiredOnFail: true, sortOrder: 0 },
    { id: ITEM_IDS[1], orgId: ORG_ID, sectionId: SECTION_IDS[0], question: 'Are hot-hold items above 63C?', type: 'yes_no', required: true, severityIfFail: 'major', photoRequiredOnFail: false, sortOrder: 1 },
    { id: ITEM_IDS[2], orgId: ORG_ID, sectionId: SECTION_IDS[1], question: 'Hand wash stations adequately stocked?', type: 'yes_no', required: true, severityIfFail: 'minor', photoRequiredOnFail: false, sortOrder: 0 },
    { id: ITEM_IDS[3], orgId: ORG_ID, sectionId: SECTION_IDS[1], question: 'Surface cleaning log up to date?', type: 'yes_no', required: true, severityIfFail: 'minor', photoRequiredOnFail: false, sortOrder: 1 },
  ]);
  console.log('  + 2 audit templates, 2 sections, 4 items');

  // ── Audits ───────────────────────────────────────────────────────────────

  const AUDIT_IDS = [
    '53000000-0000-0000-0000-000000000001',
    '53000000-0000-0000-0000-000000000002',
    '53000000-0000-0000-0000-000000000003',
  ];

  await db.insert(schema.audits).values([
    { id: AUDIT_IDS[0], orgId: ORG_ID, locationId: LOC_IDS.la_store, createdBy: USER_IDS.auditor, templateId: TEMPLATE_IDS[0], title: 'March Food Safety - LA Store', status: 'completed', auditorId: USER_IDS.auditor, scheduledAt: new Date('2026-03-10T09:00:00Z'), startedAt: new Date('2026-03-10T09:15:00Z'), completedAt: new Date('2026-03-10T11:00:00Z'), score: 85, pass: true, findings: ['Minor: surface cleaning log gap on 3/8'] },
    { id: AUDIT_IDS[1], orgId: ORG_ID, locationId: LOC_IDS.nyc_store, createdBy: USER_IDS.admin, templateId: TEMPLATE_IDS[0], title: 'March Food Safety - NYC Store', status: 'scheduled', auditorId: USER_IDS.auditor, scheduledAt: new Date('2026-03-20T09:00:00Z') },
    { id: AUDIT_IDS[2], orgId: ORG_ID, locationId: LOC_IDS.west_coast, createdBy: USER_IDS.admin, templateId: TEMPLATE_IDS[1], title: 'Weekly Housekeeping - West Coast', status: 'in_progress', auditorId: USER_IDS.field_staff, startedAt: new Date('2026-03-14T08:00:00Z') },
  ]);
  console.log('  + 3 audits');

  // ── SOPs ─────────────────────────────────────────────────────────────────

  const SOP_IDS = [
    '60000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000003',
  ];

  await db.insert(schema.sops).values([
    { id: SOP_IDS[0], orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.admin, title: 'Food Temperature Monitoring', description: 'Standard procedure for temperature checks', version: '2.1', status: 'published', category: 'safety', tags: ['food-safety', 'temperature'], publishedAt: new Date('2026-02-01T10:00:00Z'), acknowledgmentRequired: true, estimatedReadTimeMinutes: 15 },
    { id: SOP_IDS[1], orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.admin, title: 'Guest Complaint Handling', description: 'Steps for resolving guest complaints', version: '1.0', status: 'published', category: 'customer_service', tags: ['guest-relations'], publishedAt: new Date('2026-01-15T10:00:00Z'), estimatedReadTimeMinutes: 10 },
    { id: SOP_IDS[2], orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.manager, title: 'Emergency Evacuation Procedure', description: 'Fire and emergency evacuation steps', version: '3.0', status: 'in_review', category: 'safety', tags: ['safety', 'emergency'] },
  ]);

  await db.insert(schema.sopSteps).values([
    { orgId: ORG_ID, sopId: SOP_IDS[0], sortOrder: 0, title: 'Check refrigerator temperatures', description: 'Use calibrated thermometer to check all refrigerators', type: 'instruction', required: true },
    { orgId: ORG_ID, sopId: SOP_IDS[0], sortOrder: 1, title: 'Record in temperature log', description: 'Document readings in the daily log sheet', type: 'checklist', required: true, checklistItems: ['Date/time recorded', 'All units checked', 'Signed by staff'] },
    { orgId: ORG_ID, sopId: SOP_IDS[0], sortOrder: 2, title: 'Temperature out of range?', description: 'If any unit is above 4C, take immediate action', type: 'decision', required: true },
  ]);
  console.log('  + 3 SOPs, 3 steps');

  // ── CAPAs ────────────────────────────────────────────────────────────────

  const CAPA_IDS = [
    '70000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000002',
  ];

  await db.insert(schema.capas).values([
    { id: CAPA_IDS[0], orgId: ORG_ID, locationId: LOC_IDS.la_store, createdBy: USER_IDS.auditor, title: 'Surface cleaning log gaps', status: 'in_progress', severity: 'medium', source: 'audit', sourceId: AUDIT_IDS[0], rootCause: 'Staff not trained on new logging procedure', correctiveAction: 'Retrain all staff on cleaning log requirements', preventiveAction: 'Add automated reminders to shift start checklist', ownerId: USER_IDS.manager, dueDate: new Date('2026-03-25T00:00:00Z') },
    { id: CAPA_IDS[1], orgId: ORG_ID, locationId: LOC_IDS.nyc_store, createdBy: USER_IDS.support_agent, title: 'Repeated guest complaints about room temperature', status: 'open', severity: 'high', source: 'ticket', rootCause: 'HVAC system needs recalibration', correctiveAction: 'Schedule HVAC maintenance', preventiveAction: 'Implement quarterly HVAC inspections', ownerId: USER_IDS.manager, dueDate: new Date('2026-03-20T00:00:00Z') },
  ]);

  await db.insert(schema.capaActions).values([
    { orgId: ORG_ID, capaId: CAPA_IDS[0], type: 'corrective', description: 'Conduct cleaning log training session', assigneeId: USER_IDS.manager, dueDate: new Date('2026-03-18T00:00:00Z'), status: 'in_progress' },
    { orgId: ORG_ID, capaId: CAPA_IDS[0], type: 'preventive', description: 'Set up automated shift reminders', assigneeId: USER_IDS.admin, dueDate: new Date('2026-03-22T00:00:00Z'), status: 'pending' },
  ]);
  console.log('  + 2 CAPAs, 2 actions');

  // ── Projects & Tasks ─────────────────────────────────────────────────────

  const PROJECT_ID = '80000000-0000-0000-0000-000000000001';
  const TASK_IDS = [
    '81000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000003',
    '81000000-0000-0000-0000-000000000004',
    '81000000-0000-0000-0000-000000000005',
  ];

  await db.insert(schema.projects).values({
    id: PROJECT_ID, orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.admin, name: 'Q1 Compliance Push', description: 'Ensure all locations pass Q1 audits', status: 'active', ownerId: USER_IDS.manager, dueDate: new Date('2026-03-31T00:00:00Z'), color: '#3B82F6',
  });

  await db.insert(schema.tasks).values([
    { id: TASK_IDS[0], orgId: ORG_ID, locationId: LOC_IDS.la_store, createdBy: USER_IDS.manager, title: 'Complete cleaning log training', status: 'in_progress', priority: 'high', assigneeId: USER_IDS.field_staff, projectId: PROJECT_ID, dueDate: new Date('2026-03-18T00:00:00Z'), source: 'capa', linkedCapaId: CAPA_IDS[0] },
    { id: TASK_IDS[1], orgId: ORG_ID, locationId: LOC_IDS.nyc_store, createdBy: USER_IDS.admin, title: 'Schedule HVAC maintenance', status: 'todo', priority: 'high', assigneeId: USER_IDS.support_agent, dueDate: new Date('2026-03-17T00:00:00Z'), source: 'ticket', linkedTicketId: TICKET_IDS[0] },
    { id: TASK_IDS[2], orgId: ORG_ID, locationId: LOC_IDS.hq, createdBy: USER_IDS.admin, title: 'Update fire extinguisher inspection records', status: 'todo', priority: 'critical', assigneeId: USER_IDS.manager, projectId: PROJECT_ID, dueDate: new Date('2026-03-16T00:00:00Z'), source: 'manual' },
    { id: TASK_IDS[3], orgId: ORG_ID, locationId: LOC_IDS.west_coast, createdBy: USER_IDS.auditor, title: 'Review audit findings and close gaps', status: 'in_review', priority: 'medium', assigneeId: USER_IDS.manager, projectId: PROJECT_ID, dueDate: new Date('2026-03-20T00:00:00Z'), source: 'audit', linkedAuditId: AUDIT_IDS[0] },
    { id: TASK_IDS[4], orgId: ORG_ID, locationId: LOC_IDS.east_coast, createdBy: USER_IDS.manager, title: 'Prepare for NYC food safety audit', status: 'todo', priority: 'medium', assigneeId: USER_IDS.field_staff, projectId: PROJECT_ID, dueDate: new Date('2026-03-19T00:00:00Z'), source: 'manual' },
  ]);
  console.log('  + 1 project, 5 tasks');

  // ── Knowledge Base ───────────────────────────────────────────────────────

  const KB_CAT_ID = '90000000-0000-0000-0000-000000000001';
  const KB_ART_IDS = [
    '91000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000002',
    '91000000-0000-0000-0000-000000000003',
  ];

  await db.insert(schema.kbCategories).values({
    id: KB_CAT_ID, orgId: ORG_ID, name: 'Food Safety', slug: 'food-safety', description: 'Food handling, storage, and safety compliance guidelines', icon: 'ShieldCheck', color: '#3FB950', sortOrder: 0,
  });

  await db.insert(schema.kbArticles).values([
    { id: KB_ART_IDS[0], orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'Temperature Monitoring Best Practices', slug: 'temperature-monitoring', excerpt: 'How to properly monitor food temperatures', bodyHtml: '<h2>Introduction</h2><p>Temperature monitoring is critical...</p>', status: 'published', visibility: 'internal', categoryId: KB_CAT_ID, authorId: USER_IDS.admin, lastEditedBy: USER_IDS.admin, publishedAt: new Date('2026-02-01T10:00:00Z'), viewsCount: 142 },
    { id: KB_ART_IDS[1], orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'HACCP Guidelines Overview', slug: 'haccp-guidelines', excerpt: 'Overview of HACCP principles', bodyHtml: '<h2>HACCP Principles</h2><p>Seven principles of HACCP...</p>', status: 'published', visibility: 'internal', categoryId: KB_CAT_ID, authorId: USER_IDS.admin, lastEditedBy: USER_IDS.manager, publishedAt: new Date('2026-01-20T10:00:00Z'), viewsCount: 98 },
    { id: KB_ART_IDS[2], orgId: ORG_ID, createdBy: USER_IDS.manager, title: 'Cleaning and Sanitation Protocols', slug: 'cleaning-sanitation', excerpt: 'Standard cleaning procedures', bodyHtml: '<h2>Daily Cleaning</h2><p>All surfaces must be...</p>', status: 'draft', visibility: 'internal', categoryId: KB_CAT_ID, authorId: USER_IDS.manager, lastEditedBy: USER_IDS.manager },
  ]);
  console.log('  + 1 KB category, 3 articles');

  // ── Automation Rules ─────────────────────────────────────────────────────

  const RULE_IDS = [
    'A0000000-0000-0000-0000-000000000001',
    'A0000000-0000-0000-0000-000000000002',
  ];

  await db.insert(schema.automationRules).values([
    { id: RULE_IDS[0], orgId: ORG_ID, createdBy: USER_IDS.admin, name: 'Failed Audit → Create CAPA', description: 'Automatically create CAPA when audit fails', status: 'active', triggerEvent: 'audit_failed', triggerModule: 'audits', executionCount: 3, successCount: 3, failureCount: 0 },
    { id: RULE_IDS[1], orgId: ORG_ID, createdBy: USER_IDS.admin, name: 'SLA Breach → Escalate Ticket', description: 'Escalate ticket when SLA is breached', status: 'active', triggerEvent: 'sla_breach', triggerModule: 'sla', executionCount: 7, successCount: 6, failureCount: 1 },
  ]);

  await db.insert(schema.ruleConditions).values([
    { orgId: ORG_ID, ruleId: RULE_IDS[0], field: 'score', operator: 'less_than', value: 80, logic: 'AND', sortOrder: 0 },
  ]);

  await db.insert(schema.ruleActions).values([
    { orgId: ORG_ID, ruleId: RULE_IDS[0], type: 'create_capa', label: 'Create CAPA', config: { severity: 'high', assign_to_role: 'manager' }, sortOrder: 0 },
    { orgId: ORG_ID, ruleId: RULE_IDS[1], type: 'assign_to', label: 'Assign to Manager', config: { role: 'manager', location: 'same_as_trigger' }, sortOrder: 0 },
  ]);
  console.log('  + 2 automation rules');

  // ── SLA Policies ─────────────────────────────────────────────────────────

  const SLA_POLICY_ID = 'B0000000-0000-0000-0000-000000000001';

  await db.insert(schema.slaPolicies).values({
    id: SLA_POLICY_ID, orgId: ORG_ID, createdBy: USER_IDS.admin, name: 'Critical Ticket Response', description: 'Critical tickets must get first response within 1 hour', module: 'tickets', status: 'active', conditions: [{ field: 'priority', operator: 'equals', value: 'critical' }], escalationEnabled: true, escalationConfig: { escalate_to: 'manager', escalate_after_breach_minutes: 30, notify_channels: ['email', 'in_app'] }, businessHours: { timezone: 'America/New_York', start_hour: 8, end_hour: 18, working_days: [1, 2, 3, 4, 5] }, priorityOrder: 1,
  });

  await db.insert(schema.slaTargets).values([
    { orgId: ORG_ID, policyId: SLA_POLICY_ID, metric: 'first_response', label: 'First Response', targetValue: 60, targetUnit: 'minutes', businessHoursOnly: true, warningThresholdPercent: 75 },
    { orgId: ORG_ID, policyId: SLA_POLICY_ID, metric: 'resolution', label: 'Resolution', targetValue: 4, targetUnit: 'hours', businessHoursOnly: true, warningThresholdPercent: 80 },
  ]);
  console.log('  + 1 SLA policy, 2 targets');

  // ── Goals ────────────────────────────────────────────────────────────────

  const GOAL_ID = 'C0000000-0000-0000-0000-000000000001';
  const KR_IDS = [
    'C1000000-0000-0000-0000-000000000001',
    'C1000000-0000-0000-0000-000000000002',
  ];

  await db.insert(schema.goals).values({
    id: GOAL_ID, orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'Achieve 95% Compliance Score', description: 'Raise overall compliance score to 95% by end of Q1', level: 'organization', status: 'active', health: 'on_track', ownerId: USER_IDS.admin, timeframe: 'Q1', timeframeLabel: 'Q1 2026', startDate: new Date('2026-01-01T00:00:00Z'), endDate: new Date('2026-03-31T23:59:59Z'), progressPct: 72,
  });

  await db.insert(schema.keyResults).values([
    { id: KR_IDS[0], orgId: ORG_ID, goalId: GOAL_ID, title: 'Average audit score >= 90%', sortOrder: 0, unit: 'percent', direction: 'increase', startValue: 78, currentValue: 85, targetValue: 90, progressPct: 58, trackingType: 'auto', dataSource: 'audit_compliance_score', health: 'on_track', ownerId: USER_IDS.auditor },
    { id: KR_IDS[1], orgId: ORG_ID, goalId: GOAL_ID, title: 'Close all open CAPAs', sortOrder: 1, unit: 'number', direction: 'decrease', startValue: 12, currentValue: 5, targetValue: 0, progressPct: 58, trackingType: 'auto', dataSource: 'capa_overdue_count', health: 'at_risk', ownerId: USER_IDS.manager },
  ]);
  console.log('  + 1 goal, 2 key results');

  // ── Broadcasts ───────────────────────────────────────────────────────────

  const BROADCAST_ID = 'D0000000-0000-0000-0000-000000000001';

  await db.insert(schema.broadcasts).values({
    id: BROADCAST_ID, orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'New Food Safety SOP Published', bodyHtml: '<p>A new version of the Food Temperature Monitoring SOP has been published. Please review and acknowledge by March 20.</p>', bodyPlain: 'A new version of the Food Temperature Monitoring SOP has been published.', status: 'sent', priority: 'urgent', audience: { region_ids: [], zone_ids: [], store_ids: [], role_ids: [], total_recipients: 5 }, acknowledgmentRequired: true, sentAt: new Date('2026-03-12T10:00:00Z'), stats: { total_recipients: 5, delivered: 5, read: 3, acknowledged: 2, failed: 0, open_rate: 60, ack_rate: 40 }, tags: ['sop-update', 'food-safety'],
  });

  await db.insert(schema.readReceipts).values([
    { orgId: ORG_ID, broadcastId: BROADCAST_ID, userId: USER_IDS.admin, locationId: LOC_IDS.hq, status: 'acknowledged', deliveredAt: new Date('2026-03-12T10:01:00Z'), readAt: new Date('2026-03-12T10:05:00Z'), acknowledgedAt: new Date('2026-03-12T10:06:00Z') },
    { orgId: ORG_ID, broadcastId: BROADCAST_ID, userId: USER_IDS.manager, locationId: LOC_IDS.hq, status: 'acknowledged', deliveredAt: new Date('2026-03-12T10:01:00Z'), readAt: new Date('2026-03-12T10:15:00Z'), acknowledgedAt: new Date('2026-03-12T10:16:00Z') },
    { orgId: ORG_ID, broadcastId: BROADCAST_ID, userId: USER_IDS.auditor, locationId: LOC_IDS.west_coast, status: 'read', deliveredAt: new Date('2026-03-12T10:02:00Z'), readAt: new Date('2026-03-12T11:00:00Z') },
    { orgId: ORG_ID, broadcastId: BROADCAST_ID, userId: USER_IDS.support_agent, locationId: LOC_IDS.nyc_store, status: 'delivered', deliveredAt: new Date('2026-03-12T10:01:00Z') },
    { orgId: ORG_ID, broadcastId: BROADCAST_ID, userId: USER_IDS.field_staff, locationId: LOC_IDS.la_store, status: 'delivered', deliveredAt: new Date('2026-03-12T10:03:00Z') },
  ]);
  console.log('  + 1 broadcast, 5 read receipts');

  // ── Training ─────────────────────────────────────────────────────────────

  const TRAINING_MOD_ID = 'E0000000-0000-0000-0000-000000000001';
  const ENROLLMENT_ID = 'E1000000-0000-0000-0000-000000000001';

  await db.insert(schema.trainingModules).values({
    id: TRAINING_MOD_ID, orgId: ORG_ID, createdBy: USER_IDS.admin, title: 'Food Safety Fundamentals', description: 'Core food safety training for all staff', status: 'published', category: 'safety', difficulty: 'beginner', tags: ['food-safety', 'mandatory'], estimatedDurationMinutes: 45, version: '1.0', publishedAt: new Date('2026-02-01T10:00:00Z'), linkedSopId: SOP_IDS[0], passThreshold: 80, maxAttempts: 3,
  });

  await db.insert(schema.trainingContentBlocks).values([
    { orgId: ORG_ID, moduleId: TRAINING_MOD_ID, sortOrder: 0, type: 'text', title: 'Introduction to Food Safety', bodyHtml: '<h2>Why Food Safety Matters</h2><p>Foodborne illness affects millions...</p>' },
    { orgId: ORG_ID, moduleId: TRAINING_MOD_ID, sortOrder: 1, type: 'video', title: 'Temperature Control Video', mediaUrl: 'https://storage.example.com/videos/temp-control.mp4', durationSeconds: 300 },
  ]);

  await db.insert(schema.quizQuestions).values([
    { orgId: ORG_ID, moduleId: TRAINING_MOD_ID, sortOrder: 0, questionText: 'What is the maximum safe temperature for refrigerated food?', type: 'single_choice', options: [{ id: 'a', label: '0°C', is_correct: false }, { id: 'b', label: '4°C', is_correct: true }, { id: 'c', label: '8°C', is_correct: false }], points: 1 },
    { orgId: ORG_ID, moduleId: TRAINING_MOD_ID, sortOrder: 1, questionText: 'Hot-held food must be kept above 63°C', type: 'true_false', options: [{ id: 'a', label: 'True', is_correct: true }, { id: 'b', label: 'False', is_correct: false }], points: 1 },
  ]);

  await db.insert(schema.trainingEnrollments).values({
    id: ENROLLMENT_ID, orgId: ORG_ID, moduleId: TRAINING_MOD_ID, userId: USER_IDS.field_staff, status: 'in_progress', assignedBy: USER_IDS.admin, assignmentTrigger: 'manual', startedAt: new Date('2026-03-13T09:00:00Z'), dueDate: new Date('2026-03-20T00:00:00Z'), progressPercent: 50,
  });
  console.log('  + 1 training module, 2 content blocks, 2 quiz questions, 1 enrollment');

  // ── CSAT Surveys ─────────────────────────────────────────────────────────

  await db.insert(schema.csatSurveys).values([
    { orgId: ORG_ID, locationId: LOC_IDS.nyc_store, ticketId: TICKET_IDS[3], token: 'csat_tok_001', customerName: 'Jane Doe', customerEmail: 'jane@example.com', ratingMode: 'stars', score: 4, comment: 'Quick resolution, thank you!', submittedAt: new Date('2026-03-12T16:00:00Z'), expiresAt: new Date('2026-04-12T16:00:00Z') },
    { orgId: ORG_ID, locationId: LOC_IDS.la_store, ticketId: TICKET_IDS[1], token: 'csat_tok_002', customerName: 'John Smith', customerEmail: 'john.s@example.com', ratingMode: 'stars', score: null, comment: null, expiresAt: new Date('2026-04-15T00:00:00Z') },
  ]);
  console.log('  + 2 CSAT surveys');

  // ── Done ─────────────────────────────────────────────────────────────────

  console.log('\nSeed complete!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
