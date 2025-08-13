-- =====================================================
-- COMPLIANCE AND RISK MANAGEMENT SYSTEM
-- Version: 1.0.0
-- Description: Complete compliance monitoring, risk management, and audit system
-- =====================================================

-- =====================================================
-- COMPLIANCE FRAMEWORK
-- =====================================================

-- Regulatory Authorities
CREATE TABLE IF NOT EXISTS regulatory_authorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority_code VARCHAR(20) UNIQUE NOT NULL,
    authority_name VARCHAR(200) NOT NULL,
    country VARCHAR(100) DEFAULT 'Ghana',
    
    -- Contact Information
    official_website VARCHAR(500),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    headquarters_address TEXT,
    
    -- Authority Details
    jurisdiction_scope VARCHAR(100), -- 'NATIONAL', 'REGIONAL', 'LOCAL'
    regulatory_domain JSONB, -- ['PETROLEUM', 'ENVIRONMENTAL', 'TAX', 'FINANCIAL']
    establishment_date DATE,
    
    -- Compliance Requirements
    reporting_frequency VARCHAR(50), -- 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AD_HOC'
    mandatory_licenses JSONB,
    typical_penalties JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Requirements
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_code VARCHAR(50) UNIQUE NOT NULL,
    requirement_title VARCHAR(200) NOT NULL,
    regulatory_authority_id UUID REFERENCES regulatory_authorities(id),
    
    -- Requirement Details
    description TEXT NOT NULL,
    legal_reference VARCHAR(200),
    applicable_regulations JSONB,
    
    -- Compliance Specifications
    requirement_type VARCHAR(50), -- 'LICENSE', 'REPORT', 'AUDIT', 'INSPECTION', 'CERTIFICATION'
    compliance_frequency VARCHAR(50), -- 'CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    
    -- Applicability
    applicable_business_types JSONB, -- ['OMC', 'FILLING_STATION', 'DEPOT', 'TRANSPORT']
    applicable_operations JSONB,
    minimum_threshold_criteria JSONB,
    
    -- Timeline Requirements
    advance_notice_days INTEGER,
    submission_deadline_days INTEGER,
    response_time_days INTEGER,
    
    -- Penalties and Enforcement
    penalty_structure JSONB,
    enforcement_actions JSONB,
    
    -- Monitoring Configuration
    monitoring_required BOOLEAN DEFAULT TRUE,
    automated_monitoring BOOLEAN DEFAULT FALSE,
    alert_lead_time_days INTEGER DEFAULT 30,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_compliance_req_code (requirement_code),
    INDEX idx_compliance_req_authority (regulatory_authority_id),
    INDEX idx_compliance_req_type (requirement_type),
    INDEX idx_compliance_req_frequency (compliance_frequency)
);

-- Organizational Compliance Status
CREATE TABLE IF NOT EXISTS compliance_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Multi-tenant support
    compliance_requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),
    
    -- Current Status
    compliance_status VARCHAR(20) DEFAULT 'UNKNOWN', -- 'COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'PENDING', 'UNKNOWN'
    status_date DATE DEFAULT CURRENT_DATE,
    last_assessment_date DATE,
    next_assessment_due DATE,
    
    -- Compliance Details
    current_compliance_score DECIMAL(5, 2), -- 0-100
    compliance_trend VARCHAR(20), -- 'IMPROVING', 'STABLE', 'DECLINING'
    
    -- Supporting Evidence
    evidence_documents JSONB,
    compliance_certificates JSONB,
    audit_findings JSONB,
    
    -- Responsible Parties
    compliance_officer_id UUID REFERENCES users(id),
    responsible_department VARCHAR(100),
    assigned_personnel JSONB,
    
    -- Action Items
    pending_actions JSONB,
    remediation_plan TEXT,
    remediation_deadline DATE,
    
    -- Tracking
    last_violation_date DATE,
    violation_count_ytd INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, compliance_requirement_id),
    INDEX idx_compliance_status_tenant (tenant_id),
    INDEX idx_compliance_status_requirement (compliance_requirement_id),
    INDEX idx_compliance_status_status (compliance_status),
    INDEX idx_compliance_assessment_due (next_assessment_due)
);

-- Compliance Violations and Incidents
CREATE TABLE IF NOT EXISTS compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    compliance_requirement_id UUID REFERENCES compliance_requirements(id),
    
    -- Violation Details
    violation_date DATE NOT NULL,
    discovered_date DATE DEFAULT CURRENT_DATE,
    violation_title VARCHAR(200) NOT NULL,
    violation_description TEXT NOT NULL,
    
    -- Severity and Impact
    severity VARCHAR(20) NOT NULL, -- 'MINOR', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'
    business_impact VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'SEVERE'
    regulatory_impact VARCHAR(20),
    financial_impact DECIMAL(20, 2) DEFAULT 0,
    
    -- Discovery Information
    discovered_by VARCHAR(100), -- 'INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'REGULATOR', 'SELF_REPORTED'
    discovery_method VARCHAR(100),
    reporting_source UUID REFERENCES users(id),
    
    -- Location and Context
    affected_locations JSONB, -- Array of station IDs or locations
    affected_operations JSONB,
    related_incidents JSONB,
    
    -- Root Cause Analysis
    root_cause_category VARCHAR(100),
    root_cause_analysis TEXT,
    contributing_factors JSONB,
    
    -- Status and Resolution
    violation_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'REMEDIATION', 'CLOSED', 'APPEALING'
    
    -- Response Actions
    immediate_actions_taken TEXT,
    corrective_actions_required TEXT,
    preventive_actions_planned TEXT,
    
    -- Timeline
    investigation_deadline DATE,
    remediation_deadline DATE,
    regulatory_response_deadline DATE,
    
    -- Resolution Information
    resolved_date DATE,
    resolution_description TEXT,
    lessons_learned TEXT,
    
    -- Regulatory Interaction
    reported_to_regulator BOOLEAN DEFAULT FALSE,
    regulator_notified_date DATE,
    regulatory_response JSONB,
    
    -- Financial Impact
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    remediation_cost DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (penalty_amount + remediation_cost) STORED,
    
    -- Assignments
    assigned_to UUID REFERENCES users(id),
    investigation_team JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_violation_number (violation_number),
    INDEX idx_violation_tenant (tenant_id),
    INDEX idx_violation_requirement (compliance_requirement_id),
    INDEX idx_violation_status (violation_status),
    INDEX idx_violation_severity (severity),
    INDEX idx_violation_date (violation_date)
);

-- Compliance Assessments and Audits
CREATE TABLE IF NOT EXISTS compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Assessment Details
    assessment_title VARCHAR(200) NOT NULL,
    assessment_type VARCHAR(50) NOT NULL, -- 'INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'REGULATORY_INSPECTION', 'SELF_ASSESSMENT'
    assessment_scope VARCHAR(100), -- 'COMPREHENSIVE', 'FOCUSED', 'FOLLOW_UP'
    
    -- Timing
    planned_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    assessment_duration_days INTEGER,
    
    -- Assessor Information
    lead_assessor VARCHAR(200),
    assessment_team JSONB,
    external_auditor_firm VARCHAR(200),
    regulatory_inspector VARCHAR(200),
    
    -- Scope and Coverage
    requirements_assessed JSONB, -- Array of compliance requirement IDs
    locations_assessed JSONB, -- Array of station IDs or locations
    departments_assessed JSONB,
    processes_assessed JSONB,
    
    -- Methodology
    assessment_methodology TEXT,
    sampling_approach TEXT,
    testing_procedures JSONB,
    
    -- Results Summary
    overall_assessment_score DECIMAL(5, 2), -- 0-100
    compliance_rating VARCHAR(20), -- 'EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'POOR'
    
    -- Findings
    total_findings INTEGER DEFAULT 0,
    critical_findings INTEGER DEFAULT 0,
    major_findings INTEGER DEFAULT 0,
    minor_findings INTEGER DEFAULT 0,
    observations INTEGER DEFAULT 0,
    
    -- Status
    assessment_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    
    -- Documentation
    final_report_path VARCHAR(500),
    executive_summary TEXT,
    key_recommendations TEXT,
    
    -- Follow-up
    management_response TEXT,
    corrective_action_plan TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_assessment_number (assessment_number),
    INDEX idx_assessment_tenant (tenant_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_assessment_status (assessment_status),
    INDEX idx_assessment_date (actual_start_date)
);

-- Assessment Findings (Individual findings from assessments)
CREATE TABLE IF NOT EXISTS assessment_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compliance_assessment_id UUID NOT NULL REFERENCES compliance_assessments(id),
    finding_number VARCHAR(20) NOT NULL,
    
    -- Finding Details
    finding_title VARCHAR(200) NOT NULL,
    finding_description TEXT NOT NULL,
    compliance_requirement_id UUID REFERENCES compliance_requirements(id),
    
    -- Classification
    finding_type VARCHAR(20) NOT NULL, -- 'NON_COMPLIANCE', 'DEFICIENCY', 'IMPROVEMENT', 'OBSERVATION'
    severity VARCHAR(20) NOT NULL, -- 'CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'
    risk_level VARCHAR(20), -- 'HIGH', 'MEDIUM', 'LOW'
    
    -- Context
    affected_area VARCHAR(200),
    affected_process VARCHAR(200),
    related_controls JSONB,
    
    -- Evidence
    evidence_description TEXT,
    evidence_documents JSONB,
    
    -- Root Cause
    root_cause TEXT,
    contributing_factors JSONB,
    
    -- Recommendations
    recommendation TEXT NOT NULL,
    management_action_required TEXT,
    
    -- Timeline
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- Response
    management_response TEXT,
    corrective_action_taken TEXT,
    
    -- Status Tracking
    finding_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK'
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    responsible_department VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(compliance_assessment_id, finding_number),
    INDEX idx_finding_assessment (compliance_assessment_id),
    INDEX idx_finding_requirement (compliance_requirement_id),
    INDEX idx_finding_severity (severity),
    INDEX idx_finding_status (finding_status)
);

-- =====================================================
-- RISK MANAGEMENT
-- =====================================================

-- Risk Categories
CREATE TABLE IF NOT EXISTS risk_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id UUID REFERENCES risk_categories(id),
    description TEXT,
    
    -- Risk Assessment Guidelines
    assessment_methodology TEXT,
    common_risk_factors JSONB,
    typical_controls JSONB,
    
    -- Escalation Rules
    escalation_criteria JSONB,
    approval_requirements JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Risk Register
CREATE TABLE IF NOT EXISTS risk_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Risk Identification
    risk_title VARCHAR(200) NOT NULL,
    risk_description TEXT NOT NULL,
    risk_category_id UUID REFERENCES risk_categories(id),
    
    -- Risk Source and Context
    risk_source VARCHAR(100), -- 'INTERNAL', 'EXTERNAL', 'REGULATORY', 'OPERATIONAL', 'STRATEGIC'
    affected_areas JSONB, -- Departments, processes, locations affected
    stakeholders_affected JSONB,
    
    -- Risk Assessment - Inherent Risk (before controls)
    inherent_likelihood VARCHAR(20), -- 'VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'
    inherent_impact VARCHAR(20), -- 'VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'
    inherent_risk_score INTEGER, -- Calculated: likelihood × impact
    inherent_risk_level VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    -- Risk Assessment - Residual Risk (after controls)
    residual_likelihood VARCHAR(20),
    residual_impact VARCHAR(20),
    residual_risk_score INTEGER,
    residual_risk_level VARCHAR(20),
    
    -- Impact Analysis
    financial_impact_min DECIMAL(20, 2),
    financial_impact_max DECIMAL(20, 2),
    operational_impact TEXT,
    reputational_impact TEXT,
    regulatory_impact TEXT,
    
    -- Risk Tolerance and Appetite
    risk_tolerance VARCHAR(20), -- 'AVERSE', 'MINIMALIST', 'CAUTIOUS', 'OPEN', 'SEEKING'
    within_risk_appetite BOOLEAN,
    risk_appetite_rationale TEXT,
    
    -- Timeline
    risk_identification_date DATE DEFAULT CURRENT_DATE,
    last_assessment_date DATE,
    next_review_date DATE,
    
    -- Status and Monitoring
    risk_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'MONITORING', 'MITIGATED', 'CLOSED', 'ACCEPTED'
    monitoring_frequency VARCHAR(50), -- 'CONTINUOUS', 'WEEKLY', 'MONTHLY', 'QUARTERLY'
    
    -- Ownership and Accountability
    risk_owner_id UUID REFERENCES users(id), -- Person accountable for the risk
    risk_manager_id UUID REFERENCES users(id), -- Person managing the risk
    responsible_department VARCHAR(100),
    
    -- Trends and History
    risk_trend VARCHAR(20), -- 'INCREASING', 'STABLE', 'DECREASING'
    previous_materialization_count INTEGER DEFAULT 0,
    last_materialization_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_risk_id (risk_id),
    INDEX idx_risk_tenant (tenant_id),
    INDEX idx_risk_category (risk_category_id),
    INDEX idx_risk_level (residual_risk_level),
    INDEX idx_risk_status (risk_status),
    INDEX idx_risk_owner (risk_owner_id),
    INDEX idx_risk_review_date (next_review_date)
);

-- Risk Controls (Mitigation measures)
CREATE TABLE IF NOT EXISTS risk_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id VARCHAR(50) UNIQUE NOT NULL,
    risk_register_id UUID NOT NULL REFERENCES risk_register(id),
    
    -- Control Details
    control_name VARCHAR(200) NOT NULL,
    control_description TEXT NOT NULL,
    control_type VARCHAR(50), -- 'PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'COMPENSATING'
    control_nature VARCHAR(50), -- 'AUTOMATED', 'MANUAL', 'IT_DEPENDENT'
    
    -- Control Classification
    control_category VARCHAR(100), -- 'POLICY', 'PROCEDURE', 'SYSTEM', 'SUPERVISION', 'SEGREGATION'
    control_frequency VARCHAR(50), -- 'CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'
    
    -- Effectiveness Assessment
    control_effectiveness VARCHAR(20), -- 'HIGHLY_EFFECTIVE', 'EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE'
    effectiveness_rationale TEXT,
    last_testing_date DATE,
    testing_frequency VARCHAR(50),
    
    -- Implementation Details
    implementation_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'SUSPENDED'
    implementation_date DATE,
    implementation_cost DECIMAL(15, 2),
    ongoing_cost_annual DECIMAL(15, 2),
    
    -- Responsible Parties
    control_owner_id UUID REFERENCES users(id),
    control_operator_id UUID REFERENCES users(id),
    responsible_department VARCHAR(100),
    
    -- Monitoring and Testing
    monitoring_required BOOLEAN DEFAULT TRUE,
    evidence_requirements TEXT,
    key_performance_indicators JSONB,
    
    -- Dependencies
    dependent_controls JSONB, -- Array of control IDs this control depends on
    supporting_controls JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_control_id (control_id),
    INDEX idx_control_risk (risk_register_id),
    INDEX idx_control_type (control_type),
    INDEX idx_control_effectiveness (control_effectiveness),
    INDEX idx_control_owner (control_owner_id)
);

-- Risk Events (When risks materialize)
CREATE TABLE IF NOT EXISTS risk_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_number VARCHAR(50) UNIQUE NOT NULL,
    risk_register_id UUID NOT NULL REFERENCES risk_register(id),
    tenant_id UUID NOT NULL,
    
    -- Event Details
    event_date DATE NOT NULL,
    discovered_date DATE DEFAULT CURRENT_DATE,
    event_title VARCHAR(200) NOT NULL,
    event_description TEXT NOT NULL,
    
    -- Severity and Impact
    actual_likelihood VARCHAR(20), -- How likely was this specific occurrence
    actual_impact VARCHAR(20), -- Actual impact level
    
    -- Impact Assessment
    financial_impact_actual DECIMAL(20, 2),
    operational_impact_actual TEXT,
    reputational_impact_actual TEXT,
    regulatory_impact_actual TEXT,
    customer_impact_actual TEXT,
    
    -- Root Cause Analysis
    root_cause_analysis TEXT,
    control_failures JSONB, -- Which controls failed and why
    contributing_factors JSONB,
    
    -- Response and Recovery
    immediate_response_actions TEXT,
    recovery_actions TEXT,
    recovery_cost DECIMAL(15, 2),
    recovery_time_hours INTEGER,
    
    -- Status
    event_status VARCHAR(20) DEFAULT 'INVESTIGATING', -- 'INVESTIGATING', 'RESPONDING', 'RECOVERING', 'CLOSED'
    
    -- Lessons Learned
    lessons_learned TEXT,
    control_improvements_required TEXT,
    preventive_measures TEXT,
    
    -- Notifications
    stakeholders_notified JSONB,
    regulators_notified BOOLEAN DEFAULT FALSE,
    media_attention BOOLEAN DEFAULT FALSE,
    
    -- Investigation
    investigation_team JSONB,
    investigation_report_path VARCHAR(500),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_number (event_number),
    INDEX idx_event_risk (risk_register_id),
    INDEX idx_event_tenant (tenant_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_status (event_status)
);

-- Risk Mitigation Plans
CREATE TABLE IF NOT EXISTS risk_mitigation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_number VARCHAR(50) UNIQUE NOT NULL,
    risk_register_id UUID NOT NULL REFERENCES risk_register(id),
    
    -- Plan Details
    plan_title VARCHAR(200) NOT NULL,
    plan_objective TEXT NOT NULL,
    mitigation_strategy VARCHAR(50), -- 'AVOID', 'MITIGATE', 'TRANSFER', 'ACCEPT'
    
    -- Target Risk Levels
    target_likelihood VARCHAR(20),
    target_impact VARCHAR(20),
    target_risk_score INTEGER,
    target_completion_date DATE,
    
    -- Resource Requirements
    estimated_cost DECIMAL(20, 2),
    actual_cost DECIMAL(20, 2) DEFAULT 0,
    resource_requirements TEXT,
    budget_approved BOOLEAN DEFAULT FALSE,
    budget_approval_date DATE,
    
    -- Implementation
    implementation_approach TEXT,
    success_criteria TEXT,
    key_milestones JSONB,
    
    -- Status and Progress
    plan_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Ownership
    plan_owner_id UUID REFERENCES users(id),
    project_manager_id UUID REFERENCES users(id),
    steering_committee JSONB,
    
    -- Monitoring and Reporting
    monitoring_frequency VARCHAR(50),
    reporting_requirements TEXT,
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    approval_conditions TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_mitigation_plan_number (plan_number),
    INDEX idx_mitigation_plan_risk (risk_register_id),
    INDEX idx_mitigation_plan_status (plan_status),
    INDEX idx_mitigation_plan_owner (plan_owner_id)
);

-- Risk Assessments (Periodic risk reviews)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Assessment Scope
    assessment_type VARCHAR(50), -- 'COMPREHENSIVE', 'FOCUSED', 'ANNUAL', 'QUARTERLY', 'AD_HOC'
    assessment_scope TEXT,
    scope_areas JSONB, -- Departments, processes, risks in scope
    
    -- Timing
    assessment_period_start DATE,
    assessment_period_end DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    
    -- Methodology
    assessment_methodology TEXT,
    risk_criteria JSONB, -- How likelihood and impact are measured
    assessment_team JSONB,
    
    -- Results Summary
    total_risks_assessed INTEGER,
    high_risks INTEGER,
    medium_risks INTEGER,
    low_risks INTEGER,
    new_risks_identified INTEGER,
    risks_closed INTEGER,
    
    -- Key Findings
    key_findings TEXT,
    emerging_risks TEXT,
    risk_landscape_changes TEXT,
    
    -- Status
    assessment_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'
    
    -- Reporting
    executive_summary TEXT,
    recommendations TEXT,
    action_plan TEXT,
    report_path VARCHAR(500),
    
    -- Approval
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_risk_assessment_number (assessment_number),
    INDEX idx_risk_assessment_tenant (tenant_id),
    INDEX idx_risk_assessment_type (assessment_type),
    INDEX idx_risk_assessment_status (assessment_status),
    INDEX idx_risk_assessment_date (assessment_period_start, assessment_period_end)
);

-- =====================================================
-- AUDIT MANAGEMENT
-- =====================================================

-- Audit Types
CREATE TABLE IF NOT EXISTS audit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_type_code VARCHAR(20) UNIQUE NOT NULL,
    audit_type_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Audit Configuration
    typical_scope TEXT,
    standard_duration_days INTEGER,
    required_certifications JSONB,
    
    -- Reporting Requirements
    report_template TEXT,
    mandatory_sections JSONB,
    distribution_list JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Universe (All auditable areas)
CREATE TABLE IF NOT EXISTS audit_universe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_code VARCHAR(50) UNIQUE NOT NULL,
    area_name VARCHAR(200) NOT NULL,
    
    -- Area Classification
    area_category VARCHAR(100), -- 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'IT', 'STRATEGIC'
    business_process VARCHAR(200),
    risk_category VARCHAR(100),
    
    -- Risk Assessment
    inherent_risk_score INTEGER, -- 1-100
    control_risk_score INTEGER,
    audit_risk_score INTEGER,
    
    -- Audit Frequency
    audit_frequency VARCHAR(50), -- 'ANNUAL', 'BIENNIAL', 'TRIENNIAL', 'AS_NEEDED'
    last_audit_date DATE,
    next_due_date DATE,
    
    -- Coverage Information
    key_risks JSONB,
    key_controls JSONB,
    typical_audit_procedures JSONB,
    
    -- Ownership
    process_owner_id UUID REFERENCES users(id),
    responsible_department VARCHAR(100),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_universe_code (area_code),
    INDEX idx_audit_universe_category (area_category),
    INDEX idx_audit_universe_risk (audit_risk_score),
    INDEX idx_audit_universe_due_date (next_due_date)
);

-- Audit Plans (Annual or periodic audit plans)
CREATE TABLE IF NOT EXISTS audit_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Plan Details
    plan_title VARCHAR(200) NOT NULL,
    plan_period VARCHAR(50), -- '2025', 'Q1-2025', 'H1-2025'
    plan_start_date DATE NOT NULL,
    plan_end_date DATE NOT NULL,
    
    -- Plan Scope
    total_audit_hours INTEGER,
    total_audit_budget DECIMAL(20, 2),
    planned_audits_count INTEGER,
    
    -- Risk-Based Planning
    risk_assessment_basis TEXT,
    key_risk_areas JSONB,
    coverage_rationale TEXT,
    
    -- Resources
    audit_team_composition JSONB,
    external_resources_required TEXT,
    training_requirements JSONB,
    
    -- Status
    plan_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'ACTIVE', 'COMPLETED'
    
    -- Approval
    prepared_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Progress Tracking
    completed_audits INTEGER DEFAULT 0,
    actual_hours_used INTEGER DEFAULT 0,
    actual_budget_used DECIMAL(20, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_plan_number (plan_number),
    INDEX idx_audit_plan_tenant (tenant_id),
    INDEX idx_audit_plan_period (plan_start_date, plan_end_date),
    INDEX idx_audit_plan_status (plan_status)
);

-- Individual Audits
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_number VARCHAR(50) UNIQUE NOT NULL,
    audit_plan_id UUID REFERENCES audit_plans(id),
    tenant_id UUID NOT NULL,
    
    -- Audit Details
    audit_title VARCHAR(200) NOT NULL,
    audit_type_id UUID REFERENCES audit_types(id),
    audit_universe_id UUID REFERENCES audit_universe(id),
    
    -- Scope and Objectives
    audit_objectives TEXT NOT NULL,
    audit_scope TEXT NOT NULL,
    scope_limitations TEXT,
    
    -- Planning
    planned_start_date DATE,
    planned_end_date DATE,
    planned_hours INTEGER,
    planned_budget DECIMAL(15, 2),
    
    -- Execution
    actual_start_date DATE,
    actual_end_date DATE,
    actual_hours INTEGER,
    actual_cost DECIMAL(15, 2),
    
    -- Audit Team
    lead_auditor_id UUID REFERENCES users(id),
    audit_team JSONB,
    external_auditors JSONB,
    
    -- Auditee Information
    auditee_department VARCHAR(100),
    auditee_process_owner_id UUID REFERENCES users(id),
    key_contacts JSONB,
    
    -- Status
    audit_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'FIELDWORK', 'REPORTING', 'COMPLETED', 'CANCELLED'
    
    -- Methodology
    audit_approach TEXT,
    testing_strategy TEXT,
    sampling_methodology TEXT,
    
    -- Results Summary
    overall_audit_opinion VARCHAR(50), -- 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY', 'ADVERSE'
    total_findings INTEGER DEFAULT 0,
    high_findings INTEGER DEFAULT 0,
    medium_findings INTEGER DEFAULT 0,
    low_findings INTEGER DEFAULT 0,
    
    -- Key Findings
    key_findings TEXT,
    root_causes TEXT,
    systemic_issues TEXT,
    
    -- Reporting
    draft_report_date DATE,
    final_report_date DATE,
    report_distribution JSONB,
    management_response_due DATE,
    management_response_received DATE,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_number (audit_number),
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_plan (audit_plan_id),
    INDEX idx_audit_type (audit_type_id),
    INDEX idx_audit_status (audit_status),
    INDEX idx_audit_lead_auditor (lead_auditor_id),
    INDEX idx_audit_dates (actual_start_date, actual_end_date)
);

-- Audit Findings
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES audits(id),
    finding_number VARCHAR(20) NOT NULL,
    
    -- Finding Details
    finding_title VARCHAR(200) NOT NULL,
    finding_description TEXT NOT NULL,
    
    -- Classification
    finding_type VARCHAR(50), -- 'CONTROL_DEFICIENCY', 'NON_COMPLIANCE', 'INEFFICIENCY', 'BEST_PRACTICE'
    severity VARCHAR(20) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
    category VARCHAR(100),
    
    -- Risk Assessment
    risk_rating VARCHAR(20), -- 'HIGH', 'MEDIUM', 'LOW'
    potential_impact TEXT,
    likelihood_of_occurrence VARCHAR(20),
    
    -- Context
    affected_process VARCHAR(200),
    affected_controls JSONB,
    
    -- Evidence and Criteria
    audit_criteria TEXT, -- What standard/requirement was not met
    condition_found TEXT, -- What was actually found
    evidence TEXT,
    
    -- Root Cause
    root_cause TEXT,
    management_cause VARCHAR(100), -- 'DESIGN', 'OPERATING_EFFECTIVENESS', 'BOTH'
    
    -- Recommendation
    recommendation TEXT NOT NULL,
    business_justification TEXT,
    
    -- Management Response
    management_response TEXT,
    agreed_action TEXT,
    target_completion_date DATE,
    responsible_person_id UUID REFERENCES users(id),
    
    -- Status Tracking
    finding_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'ACCEPTED_RISK'
    actual_completion_date DATE,
    verification_required BOOLEAN DEFAULT TRUE,
    verified_by UUID REFERENCES users(id),
    verification_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(audit_id, finding_number),
    INDEX idx_audit_finding_audit (audit_id),
    INDEX idx_audit_finding_severity (severity),
    INDEX idx_audit_finding_status (finding_status),
    INDEX idx_audit_finding_responsible (responsible_person_id),
    INDEX idx_audit_finding_due_date (target_completion_date)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert Ghana regulatory authorities
INSERT INTO regulatory_authorities (authority_code, authority_name, regulatory_domain, reporting_frequency, jurisdiction_scope) VALUES
('NPA', 'National Petroleum Authority', '["PETROLEUM", "LICENSING", "PRICING"]', 'MONTHLY', 'NATIONAL'),
('EPA', 'Environmental Protection Agency', '["ENVIRONMENTAL", "WASTE_MANAGEMENT", "POLLUTION"]', 'QUARTERLY', 'NATIONAL'),
('GRA', 'Ghana Revenue Authority', '["TAX", "CUSTOMS", "REVENUE"]', 'MONTHLY', 'NATIONAL'),
('BOG', 'Bank of Ghana', '["FINANCIAL", "FOREIGN_EXCHANGE", "BANKING"]', 'QUARTERLY', 'NATIONAL'),
('UPPF', 'Unified Petroleum Price Fund', '["PETROLEUM", "PRICING", "SUBSIDIES"]', 'MONTHLY', 'NATIONAL'),
('DVLA', 'Driver and Vehicle Licensing Authority', '["TRANSPORT", "VEHICLE_LICENSING", "DRIVER_LICENSING"]', 'ANNUALLY', 'NATIONAL'),
('FIRE_SERVICE', 'Ghana National Fire Service', '["SAFETY", "FIRE_PREVENTION", "EMERGENCY_RESPONSE"]', 'ANNUALLY', 'NATIONAL'),
('LABOUR', 'Ministry of Employment and Labour Relations', '["LABOUR", "EMPLOYMENT", "SAFETY"]', 'ANNUALLY', 'NATIONAL')
ON CONFLICT (authority_code) DO NOTHING;

-- Insert default risk categories
INSERT INTO risk_categories (category_code, category_name, description) VALUES
('OPERATIONAL', 'Operational Risk', 'Risks related to day-to-day operations and processes'),
('FINANCIAL', 'Financial Risk', 'Risks affecting financial performance and position'),
('COMPLIANCE', 'Compliance Risk', 'Risks of non-compliance with laws and regulations'),
('STRATEGIC', 'Strategic Risk', 'Risks affecting strategic objectives and business model'),
('REPUTATIONAL', 'Reputational Risk', 'Risks affecting brand reputation and stakeholder confidence'),
('TECHNOLOGY', 'Technology Risk', 'Risks related to IT systems and technology infrastructure'),
('ENVIRONMENT', 'Environmental Risk', 'Environmental and sustainability risks'),
('SAFETY', 'Health and Safety Risk', 'Workplace safety and occupational health risks'),
('CYBERSECURITY', 'Cybersecurity Risk', 'Information security and cyber threats'),
('SUPPLY_CHAIN', 'Supply Chain Risk', 'Risks in the supply chain and vendor relationships')
ON CONFLICT (category_code) DO NOTHING;

-- Insert default audit types
INSERT INTO audit_types (audit_type_code, audit_type_name, description, standard_duration_days) VALUES
('FINANCIAL', 'Financial Audit', 'Audit of financial statements and controls', 21),
('OPERATIONAL', 'Operational Audit', 'Review of operational processes and efficiency', 14),
('COMPLIANCE', 'Compliance Audit', 'Assessment of regulatory compliance', 10),
('IT', 'IT Audit', 'Review of IT systems, controls, and security', 14),
('SAFETY', 'Safety Audit', 'Health, safety, and environmental audit', 7),
('VENDOR', 'Vendor Audit', 'Audit of suppliers and service providers', 3),
('FOLLOW_UP', 'Follow-up Audit', 'Verification of corrective actions', 2)
ON CONFLICT (audit_type_code) DO NOTHING;

-- Insert sample compliance requirements for Ghana
INSERT INTO compliance_requirements (requirement_code, requirement_title, regulatory_authority_id, requirement_type, compliance_frequency, description) VALUES
(
    'NPA_LICENSE_RENEWAL',
    'NPA License Renewal',
    (SELECT id FROM regulatory_authorities WHERE authority_code = 'NPA'),
    'LICENSE',
    'ANNUALLY',
    'Annual renewal of petroleum marketing license from National Petroleum Authority'
),
(
    'EPA_ENVIRONMENTAL_PERMIT',
    'Environmental Permit',
    (SELECT id FROM regulatory_authorities WHERE authority_code = 'EPA'),
    'CERTIFICATION',
    'ANNUALLY',
    'Environmental permit for fuel storage and dispensing operations'
),
(
    'GRA_VAT_RETURNS',
    'VAT Returns Submission',
    (SELECT id FROM regulatory_authorities WHERE authority_code = 'GRA'),
    'REPORT',
    'MONTHLY',
    'Monthly VAT returns submission to Ghana Revenue Authority'
),
(
    'UPPF_CLAIMS',
    'UPPF Claims Submission',
    (SELECT id FROM regulatory_authorities WHERE authority_code = 'UPPF'),
    'REPORT',
    'MONTHLY',
    'Monthly claims submission to Unified Petroleum Price Fund for dealer margins'
),
(
    'FIRE_SAFETY_CERTIFICATE',
    'Fire Safety Certificate',
    (SELECT id FROM regulatory_authorities WHERE authority_code = 'FIRE_SERVICE'),
    'CERTIFICATION',
    'ANNUALLY',
    'Annual fire safety certificate for fuel station operations'
)
ON CONFLICT (requirement_code) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Compliance and Risk Management System schema created successfully with Ghana regulatory framework!';
END $$;