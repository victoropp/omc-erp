-- Ghana OMC ERP - Regulatory Documents Migration
-- Migration: 003-regulatory-documents
-- Created: 2025-01-15
-- Description: Create tables for regulatory document management, compliance tracking, and audit controls

-- Regulatory Documents table (NPA documents, guidelines, templates, circulars)
CREATE TABLE regulatory_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- pricing_guideline, pbu_template, circular, act, regulation, policy
    title VARCHAR(200) NOT NULL,
    description TEXT,
    document_number VARCHAR(50) NOT NULL, -- NPA reference number
    version VARCHAR(20) NOT NULL,
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash for integrity verification
    file_name VARCHAR(100) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    effective_date DATE NOT NULL,
    expiry_date DATE,
    publication_date DATE NOT NULL,
    source_url TEXT, -- Original NPA URL
    is_active BOOLEAN DEFAULT true,
    metadata JSONB, -- Document-specific metadata
    parsed_content JSONB, -- Extracted content (components, requirements, etc.)
    notes TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    superseded_by UUID REFERENCES regulatory_documents(id), -- Reference to newer version
    supersedes UUID REFERENCES regulatory_documents(id), -- Reference to older version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Tracking table (track compliance with regulatory requirements)
CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES regulatory_documents(id) ON DELETE CASCADE,
    compliance_type VARCHAR(50) NOT NULL, -- submission, implementation, training, audit
    requirement_description TEXT NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, overdue, exempted
    compliance_evidence JSONB, -- Links to evidence documents/records
    responsible_person UUID REFERENCES users(id),
    reviewer UUID REFERENCES users(id),
    review_notes TEXT,
    risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    penalty_amount DECIMAL(12,2), -- Potential penalty for non-compliance
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table (comprehensive audit trail for all system activities)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
    record_id UUID NOT NULL,
    old_values JSONB, -- Previous values for UPDATE operations
    new_values JSONB, -- New values for INSERT/UPDATE operations
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    api_endpoint VARCHAR(200), -- Which API endpoint was called
    request_id UUID, -- Correlation ID for request tracing
    business_context JSONB, -- Additional business context (window_id, station_id, etc.)
    compliance_relevant BOOLEAN DEFAULT false, -- Flag for compliance-related changes
    data_classification VARCHAR(20) DEFAULT 'internal' -- public, internal, confidential, restricted
);

-- NPA Submissions table (track all submissions to NPA)
CREATE TABLE npa_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    submission_type VARCHAR(50) NOT NULL, -- pricing_update, uppf_claims, compliance_report
    window_id VARCHAR(20) REFERENCES pricing_windows(window_id),
    submission_reference VARCHAR(100) UNIQUE NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    submission_data JSONB NOT NULL, -- The actual submission content
    file_attachments JSONB, -- Array of attached files
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, acknowledged, approved, rejected, queried
    npa_reference VARCHAR(100), -- NPA acknowledgment reference
    npa_response JSONB, -- NPA response/feedback
    response_date TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Configuration table (for system settings and feature flags)
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- feature_flag, system_setting, business_rule
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_restart BOOLEAN DEFAULT false,
    environment VARCHAR(20) DEFAULT 'production', -- development, staging, production
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, config_key, environment)
);

-- Document Access Logs table (track who accesses sensitive documents)
CREATE TABLE document_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES regulatory_documents(id) ON DELETE CASCADE,
    accessed_by UUID NOT NULL REFERENCES users(id),
    access_type VARCHAR(20) NOT NULL, -- view, download, print, share
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    access_purpose TEXT, -- Why was the document accessed
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Price Change Approvals table (workflow for price change approvals)
CREATE TABLE price_change_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    window_id VARCHAR(20) NOT NULL REFERENCES pricing_windows(window_id),
    change_type VARCHAR(50) NOT NULL, -- component_update, manual_override, emergency_change
    affected_components JSONB NOT NULL, -- Array of component codes affected
    change_details JSONB NOT NULL, -- Before/after values and justifications
    business_justification TEXT NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, implemented
    approval_level INTEGER DEFAULT 1, -- 1=manager, 2=director, 3=board
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    implementation_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and compliance queries
CREATE INDEX idx_regulatory_docs_tenant_type ON regulatory_documents(tenant_id, type);
CREATE INDEX idx_regulatory_docs_effective_date ON regulatory_documents(effective_date, expiry_date);
CREATE INDEX idx_regulatory_docs_hash ON regulatory_documents(file_hash);
CREATE INDEX idx_regulatory_docs_active ON regulatory_documents(is_active) WHERE is_active = true;
CREATE INDEX idx_regulatory_docs_supersedes ON regulatory_documents(supersedes) WHERE supersedes IS NOT NULL;

CREATE INDEX idx_compliance_records_tenant_due ON compliance_records(tenant_id, due_date);
CREATE INDEX idx_compliance_records_status ON compliance_records(status);
CREATE INDEX idx_compliance_records_overdue ON compliance_records(due_date) WHERE status IN ('pending', 'in_progress') AND due_date < CURRENT_DATE;

CREATE INDEX idx_audit_logs_tenant_table ON audit_logs(tenant_id, table_name);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_compliance ON audit_logs(compliance_relevant) WHERE compliance_relevant = true;
CREATE INDEX idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(changed_by, changed_at);

CREATE INDEX idx_npa_submissions_tenant_type ON npa_submissions(tenant_id, submission_type);
CREATE INDEX idx_npa_submissions_window ON npa_submissions(window_id) WHERE window_id IS NOT NULL;
CREATE INDEX idx_npa_submissions_status ON npa_submissions(status);
CREATE INDEX idx_npa_submissions_date ON npa_submissions(submission_date);
CREATE INDEX idx_npa_submissions_follow_up ON npa_submissions(follow_up_date) WHERE follow_up_required = true;

CREATE INDEX idx_system_config_tenant_key ON system_configurations(tenant_id, config_key);
CREATE INDEX idx_system_config_active ON system_configurations(is_active, effective_from, effective_until);
CREATE INDEX idx_system_config_env ON system_configurations(environment);

CREATE INDEX idx_doc_access_logs_document ON document_access_logs(document_id, access_timestamp);
CREATE INDEX idx_doc_access_logs_user ON document_access_logs(accessed_by, access_timestamp);
CREATE INDEX idx_doc_access_logs_tenant ON document_access_logs(tenant_id, access_timestamp);

CREATE INDEX idx_price_approvals_window ON price_change_approvals(window_id);
CREATE INDEX idx_price_approvals_status ON price_change_approvals(status);
CREATE INDEX idx_price_approvals_pending ON price_change_approvals(approval_level) WHERE status = 'pending';

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_regulatory_documents_updated_at BEFORE UPDATE ON regulatory_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON compliance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_npa_submissions_updated_at BEFORE UPDATE ON npa_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configurations_updated_at BEFORE UPDATE ON system_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_change_approvals_updated_at BEFORE UPDATE ON price_change_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log changes to important tables
    IF TG_TABLE_NAME IN ('transactions', 'station_prices', 'uppf_claims', 'dealer_settlements', 'pbu_components', 'pricing_windows') THEN
        INSERT INTO audit_logs (
            tenant_id,
            table_name,
            operation,
            record_id,
            old_values,
            new_values,
            changed_by,
            changed_at,
            compliance_relevant
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id),
            TG_TABLE_NAME,
            TG_OP,
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
            COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by), -- Get user from record
            NOW(),
            true -- Mark as compliance relevant
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_station_prices AFTER INSERT OR UPDATE OR DELETE ON station_prices FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_uppf_claims AFTER INSERT OR UPDATE OR DELETE ON uppf_claims FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_dealer_settlements AFTER INSERT OR UPDATE OR DELETE ON dealer_settlements FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_pbu_components AFTER INSERT OR UPDATE OR DELETE ON pbu_components FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_pricing_windows AFTER INSERT OR UPDATE OR DELETE ON pricing_windows FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Insert default system configurations
INSERT INTO system_configurations (tenant_id, config_key, config_value, config_type, description) VALUES
('00000000-0000-0000-0000-000000000001', 'pricing_window_auto_close', '{"enabled": true, "grace_period_hours": 2}', 'system_setting', 'Automatically close pricing windows after end date with grace period'),
('00000000-0000-0000-0000-000000000001', 'uppf_claims_auto_submit', '{"enabled": false, "batch_size": 50}', 'system_setting', 'Automatically submit UPPF claims in batches'),
('00000000-0000-0000-0000-000000000001', 'inventory_alerts_enabled', '{"low_stock": true, "critical_stock": true, "email_notifications": true}', 'feature_flag', 'Enable inventory level alerts and notifications'),
('00000000-0000-0000-0000-000000000001', 'audit_retention_days', '2555', 'system_setting', 'Number of days to retain audit logs (7 years for compliance)'),
('00000000-0000-0000-0000-000000000001', 'npa_submission_deadline_hours', '48', 'business_rule', 'Hours after pricing window activation to submit to NPA'),
('00000000-0000-0000-0000-000000000001', 'dealer_settlement_grace_days', '3', 'business_rule', 'Grace period for dealer settlement payments'),
('00000000-0000-0000-0000-000000000001', 'price_variance_threshold', '{"percentage": 5, "absolute": 1.0}', 'business_rule', 'Thresholds for price change approval requirements');

-- Insert sample compliance requirements based on current NPA regulations
INSERT INTO compliance_records (tenant_id, document_id, compliance_type, requirement_description, due_date, status, risk_level, created_by) VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'submission', 'Submit bi-weekly pricing updates to NPA', CURRENT_DATE + INTERVAL '14 days', 'pending', 'high', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', NULL, 'implementation', 'Update all station pricing systems with new rates', CURRENT_DATE + INTERVAL '7 days', 'pending', 'medium', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', NULL, 'audit', 'Quarterly UPPF claims audit and reconciliation', CURRENT_DATE + INTERVAL '90 days', 'pending', 'medium', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', NULL, 'training', 'Staff training on new pricing procedures', CURRENT_DATE + INTERVAL '30 days', 'pending', 'low', '00000000-0000-0000-0000-000000000002');

-- Add table comments
COMMENT ON TABLE regulatory_documents IS 'Repository of all NPA guidelines, PBU templates, circulars, and regulatory documents';
COMMENT ON TABLE compliance_records IS 'Track compliance with regulatory requirements and deadlines';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system activities and changes';
COMMENT ON TABLE npa_submissions IS 'Track all submissions made to the National Petroleum Authority';
COMMENT ON TABLE system_configurations IS 'System settings and feature flags for operational control';
COMMENT ON TABLE document_access_logs IS 'Track access to sensitive regulatory documents';
COMMENT ON TABLE price_change_approvals IS 'Approval workflow for pricing changes and overrides';

-- Migration completion marker
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('003', NOW())
ON CONFLICT (version) DO NOTHING;