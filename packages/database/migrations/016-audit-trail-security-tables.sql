-- =====================================================
-- AUDIT TRAIL AND SECURITY TABLES
-- Version: 1.0.0
-- Description: Comprehensive audit trail, security monitoring, and data governance tables
-- =====================================================

-- =====================================================
-- ENHANCED AUDIT TRAIL SYSTEM
-- =====================================================

-- Comprehensive audit trail for all database changes
CREATE TABLE IF NOT EXISTS audit_trails_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Transaction Information
    transaction_id UUID DEFAULT gen_random_uuid(),
    session_id UUID,
    correlation_id VARCHAR(100),
    
    -- Record Information
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'SELECT')),
    
    -- Change Tracking
    old_values JSONB,
    new_values JSONB,
    changed_columns TEXT[],
    
    -- User and Context Information
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    impersonated_by_user_id UUID,
    
    -- System Information
    application_name VARCHAR(100),
    client_ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Timing Information
    action_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_duration_ms INTEGER,
    
    -- Business Context
    business_process VARCHAR(100),
    business_reason TEXT,
    approval_workflow_id UUID,
    
    -- Technical Details
    database_user NAME DEFAULT current_user,
    backend_pid INTEGER DEFAULT pg_backend_pid(),
    query_text TEXT,
    
    -- Security and Risk
    risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    security_classification VARCHAR(50) DEFAULT 'INTERNAL',
    data_sensitivity_level VARCHAR(20) DEFAULT 'NORMAL' CHECK (data_sensitivity_level IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
    
    -- Compliance and Retention
    retention_period_days INTEGER DEFAULT 2555, -- 7 years for regulatory compliance
    compliance_tags TEXT[],
    legal_hold BOOLEAN DEFAULT FALSE,
    
    -- Index for performance
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Partition audit trails by month for better performance
CREATE TABLE audit_trails_enhanced_y2024m01 PARTITION OF audit_trails_enhanced 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_trails_enhanced_y2024m02 PARTITION OF audit_trails_enhanced 
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Continue partitioning as needed...

-- =====================================================
-- USER AUTHENTICATION AND SESSION MANAGEMENT
-- =====================================================

-- Enhanced user sessions with security tracking
CREATE TABLE IF NOT EXISTS user_sessions_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Session Information
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    session_type VARCHAR(20) DEFAULT 'WEB' CHECK (session_type IN ('WEB', 'MOBILE', 'API', 'SERVICE')),
    
    -- User Information
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_roles TEXT[],
    permissions TEXT[],
    
    -- Device and Location Information
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    
    -- Network Information
    ip_address INET NOT NULL,
    ip_location JSONB, -- Country, region, city from IP geolocation
    network_type VARCHAR(50), -- Corporate, VPN, Public, etc.
    
    -- Security Information
    login_method VARCHAR(50), -- PASSWORD, SSO, MFA, BIOMETRIC
    mfa_verified BOOLEAN DEFAULT FALSE,
    mfa_methods TEXT[], -- SMS, EMAIL, TOTP, HARDWARE_KEY
    
    -- Session Lifecycle
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    termination_reason VARCHAR(100),
    
    -- Security Flags
    is_suspicious BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    concurrent_sessions_count INTEGER DEFAULT 1,
    
    -- Compliance
    privacy_consent_given BOOLEAN DEFAULT FALSE,
    privacy_consent_date TIMESTAMPTZ,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_date TIMESTAMPTZ
);

-- =====================================================
-- SECURITY MONITORING AND THREAT DETECTION
-- =====================================================

-- Security events and threat detection
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Event Classification
    event_type VARCHAR(50) NOT NULL, -- LOGIN_FAILED, SUSPICIOUS_ACTIVITY, DATA_BREACH, etc.
    event_category VARCHAR(50) NOT NULL, -- AUTHENTICATION, AUTHORIZATION, DATA_ACCESS, etc.
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Event Details
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_metadata JSONB,
    
    -- User and Session Context
    user_id UUID,
    session_id UUID,
    user_email VARCHAR(255),
    user_roles TEXT[],
    
    -- System Context
    source_system VARCHAR(100),
    source_ip INET,
    user_agent TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    
    -- Risk Assessment
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
    false_positive_probability DECIMAL(5,2),
    
    -- Detection Information
    detection_method VARCHAR(50), -- RULE_ENGINE, ML_ALGORITHM, MANUAL_REVIEW
    detection_rules_triggered TEXT[],
    
    -- Response and Status
    incident_status VARCHAR(20) DEFAULT 'OPEN' CHECK (incident_status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    assigned_to UUID,
    response_actions TEXT[],
    
    -- Timing
    event_timestamp TIMESTAMPTZ NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Compliance and Legal
    regulatory_impact BOOLEAN DEFAULT FALSE,
    breach_notification_required BOOLEAN DEFAULT FALSE,
    evidence_preservation_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Attempt Information
    email_attempted VARCHAR(255) NOT NULL,
    password_hash_attempted VARCHAR(255), -- For pattern analysis (one-way hash)
    
    -- Source Information
    source_ip INET NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    
    -- Timing and Patterns
    attempt_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    attempts_in_last_hour INTEGER DEFAULT 1,
    attempts_in_last_day INTEGER DEFAULT 1,
    is_brute_force_pattern BOOLEAN DEFAULT FALSE,
    
    -- Geo and Network Analysis
    ip_location JSONB,
    is_tor_network BOOLEAN DEFAULT FALSE,
    is_vpn_network BOOLEAN DEFAULT FALSE,
    is_known_bad_ip BOOLEAN DEFAULT FALSE,
    
    -- Response Actions
    account_locked BOOLEAN DEFAULT FALSE,
    ip_blocked BOOLEAN DEFAULT FALSE,
    captcha_required BOOLEAN DEFAULT FALSE,
    
    -- Investigation
    security_analyst_reviewed BOOLEAN DEFAULT FALSE,
    investigation_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ACCESS CONTROL AND PERMISSIONS AUDIT
-- =====================================================

-- Permission changes audit
CREATE TABLE IF NOT EXISTS permission_changes_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Change Information
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('GRANTED', 'REVOKED', 'MODIFIED')),
    permission_type VARCHAR(50) NOT NULL, -- ROLE, RESOURCE, FUNCTION
    
    -- Target Information
    target_user_id UUID,
    target_role_id UUID,
    target_resource VARCHAR(255),
    
    -- Permission Details
    old_permissions JSONB,
    new_permissions JSONB,
    permission_scope VARCHAR(100),
    effective_from TIMESTAMPTZ,
    effective_until TIMESTAMPTZ,
    
    -- Authorization Context
    authorized_by_user_id UUID NOT NULL,
    authorization_method VARCHAR(50), -- MANUAL, AUTOMATED, WORKFLOW
    approval_workflow_id UUID,
    business_justification TEXT,
    
    -- Review and Compliance
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    compliance_review_required BOOLEAN DEFAULT FALSE,
    
    -- System Information
    system_generated BOOLEAN DEFAULT FALSE,
    change_source VARCHAR(100), -- ADMIN_PANEL, API, BULK_IMPORT, etc.
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Role membership audit
CREATE TABLE IF NOT EXISTS role_membership_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Membership Change
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('ASSIGNED', 'REMOVED', 'MODIFIED')),
    
    -- Previous and New States
    previous_roles JSONB,
    current_roles JSONB,
    
    -- Authorization
    changed_by_user_id UUID NOT NULL,
    change_reason VARCHAR(255),
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by_user_id UUID,
    
    -- Timing
    effective_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMPTZ,
    change_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DATA PRIVACY AND GDPR COMPLIANCE
-- =====================================================

-- Personal data processing audit
CREATE TABLE IF NOT EXISTS data_processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Processing Activity
    activity_name VARCHAR(255) NOT NULL,
    processing_purpose VARCHAR(255) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- CONSENT, CONTRACT, LEGAL_OBLIGATION, etc.
    
    -- Data Subject Information
    data_subject_id UUID,
    data_subject_type VARCHAR(50), -- CUSTOMER, EMPLOYEE, SUPPLIER, etc.
    
    -- Data Categories
    data_categories TEXT[], -- PERSONAL, SENSITIVE, FINANCIAL, etc.
    data_fields TEXT[],
    
    -- Processing Details
    processing_type VARCHAR(50), -- COLLECTION, STORAGE, ANALYSIS, TRANSMISSION, etc.
    automated_processing BOOLEAN DEFAULT FALSE,
    profiling_involved BOOLEAN DEFAULT FALSE,
    
    -- Recipients and Transfers
    internal_recipients TEXT[],
    external_recipients TEXT[],
    third_country_transfers BOOLEAN DEFAULT FALSE,
    transfer_mechanisms TEXT[],
    
    -- Retention and Disposal
    retention_period_months INTEGER,
    disposal_method VARCHAR(100),
    disposal_date DATE,
    
    -- Consent Management
    consent_obtained BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMPTZ,
    consent_method VARCHAR(100),
    consent_withdrawn BOOLEAN DEFAULT FALSE,
    consent_withdrawn_timestamp TIMESTAMPTZ,
    
    -- Security Measures
    encryption_applied BOOLEAN DEFAULT FALSE,
    access_controls_applied BOOLEAN DEFAULT FALSE,
    anonymization_applied BOOLEAN DEFAULT FALSE,
    
    -- Compliance
    dpia_required BOOLEAN DEFAULT FALSE,
    dpia_completed BOOLEAN DEFAULT FALSE,
    dpia_completion_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Data subject rights requests (GDPR Article 15-22)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Request Information
    request_id VARCHAR(100) UNIQUE NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN 
        ('ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECTION')),
    
    -- Data Subject
    data_subject_id UUID,
    data_subject_email VARCHAR(255),
    data_subject_name VARCHAR(255),
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_verification_method VARCHAR(100),
    
    -- Request Details
    request_description TEXT,
    specific_data_requested TEXT[],
    request_source VARCHAR(50), -- EMAIL, WEB_FORM, PHONE, LETTER
    
    -- Processing
    received_date DATE NOT NULL,
    acknowledged_date DATE,
    response_due_date DATE NOT NULL, -- Usually 30 days from receipt
    completed_date DATE,
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'RECEIVED' CHECK (status IN 
        ('RECEIVED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'PARTIALLY_FULFILLED')),
    assigned_to_user_id UUID,
    complexity_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (complexity_level IN 
        ('SIMPLE', 'STANDARD', 'COMPLEX')),
    
    -- Response
    response_method VARCHAR(50), -- EMAIL, POSTAL, SECURE_PORTAL
    response_sent_date DATE,
    response_format VARCHAR(50), -- PDF, JSON, CSV, XML
    data_provided JSONB,
    
    -- Special Cases
    rejection_reason TEXT,
    partial_fulfillment_reason TEXT,
    fee_charged DECIMAL(10,2),
    fee_justification TEXT,
    
    -- Compliance Tracking
    deadline_extended BOOLEAN DEFAULT FALSE,
    extension_reason TEXT,
    extension_days INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM SECURITY CONFIGURATION
-- =====================================================

-- Security policies and configurations
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Policy Information
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- PASSWORD, ACCESS, DATA, NETWORK, etc.
    policy_category VARCHAR(50),
    
    -- Policy Definition
    policy_description TEXT,
    policy_rules JSONB NOT NULL,
    enforcement_level VARCHAR(20) DEFAULT 'MANDATORY' CHECK (enforcement_level IN 
        ('ADVISORY', 'RECOMMENDED', 'MANDATORY', 'CRITICAL')),
    
    -- Scope and Applicability
    applies_to_roles TEXT[],
    applies_to_users UUID[],
    applies_to_resources TEXT[],
    
    -- Lifecycle
    effective_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Compliance and Standards
    regulatory_basis TEXT[], -- GDPR, SOX, PCI_DSS, etc.
    compliance_frameworks TEXT[], -- ISO27001, NIST, COBIT, etc.
    
    -- Management
    policy_owner_user_id UUID,
    approved_by_user_id UUID,
    approval_date TIMESTAMPTZ,
    review_frequency_months INTEGER DEFAULT 12,
    next_review_date DATE,
    
    -- Change Tracking
    version VARCHAR(20) DEFAULT '1.0',
    previous_version_id UUID,
    change_summary TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Security violations and incidents
CREATE TABLE IF NOT EXISTS security_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Violation Information
    violation_id VARCHAR(100) UNIQUE NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Policy Reference
    violated_policy_id UUID REFERENCES security_policies(id),
    violated_rules TEXT[],
    
    -- User and Context
    user_id UUID,
    session_id UUID,
    source_ip INET,
    user_agent TEXT,
    
    -- Violation Details
    violation_description TEXT NOT NULL,
    violation_timestamp TIMESTAMPTZ NOT NULL,
    detection_method VARCHAR(50),
    
    -- Impact Assessment
    data_accessed TEXT[],
    systems_affected TEXT[],
    estimated_impact_level VARCHAR(20),
    
    -- Response
    incident_response_triggered BOOLEAN DEFAULT FALSE,
    response_team_notified BOOLEAN DEFAULT FALSE,
    remediation_actions TEXT[],
    
    -- Investigation
    investigated_by_user_id UUID,
    investigation_status VARCHAR(20) DEFAULT 'PENDING',
    investigation_findings TEXT,
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolution_date TIMESTAMPTZ,
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DATA CLASSIFICATION AND HANDLING
-- =====================================================

-- Data classification catalog
CREATE TABLE IF NOT EXISTS data_classification_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    
    -- Data Asset Information
    data_asset_name VARCHAR(255) NOT NULL,
    data_asset_type VARCHAR(50) NOT NULL, -- TABLE, VIEW, FILE, API, etc.
    database_schema VARCHAR(100),
    table_name VARCHAR(100),
    column_names TEXT[],
    
    -- Classification
    classification_level VARCHAR(20) NOT NULL CHECK (classification_level IN 
        ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET')),
    data_sensitivity VARCHAR(20) NOT NULL CHECK (data_sensitivity IN 
        ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    
    -- Data Categories
    contains_pii BOOLEAN DEFAULT FALSE,
    contains_phi BOOLEAN DEFAULT FALSE, -- Protected Health Information
    contains_pci BOOLEAN DEFAULT FALSE, -- Payment Card Industry data
    contains_financial_data BOOLEAN DEFAULT FALSE,
    
    -- Regulatory Classifications
    gdpr_relevant BOOLEAN DEFAULT FALSE,
    hipaa_relevant BOOLEAN DEFAULT FALSE,
    sox_relevant BOOLEAN DEFAULT FALSE,
    pci_relevant BOOLEAN DEFAULT FALSE,
    
    -- Handling Requirements
    encryption_required BOOLEAN DEFAULT FALSE,
    access_logging_required BOOLEAN DEFAULT TRUE,
    backup_encryption_required BOOLEAN DEFAULT FALSE,
    geographic_restrictions TEXT[],
    
    -- Retention and Disposal
    retention_period_years INTEGER,
    disposal_method VARCHAR(100),
    legal_hold_applicable BOOLEAN DEFAULT FALSE,
    
    -- Access Controls
    minimum_clearance_level VARCHAR(50),
    authorized_roles TEXT[],
    authorized_users UUID[],
    
    -- Ownership and Stewardship
    data_owner_user_id UUID,
    data_steward_user_id UUID,
    business_owner_user_id UUID,
    
    -- Lifecycle
    classification_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_review_date DATE,
    next_review_date DATE,
    classification_status VARCHAR(20) DEFAULT 'ACTIVE',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECURITY MONITORING VIEWS
-- =====================================================

-- Comprehensive security dashboard view
CREATE OR REPLACE VIEW v_security_dashboard AS
SELECT 
    CURRENT_DATE as dashboard_date,
    
    -- Today's Security Metrics
    (SELECT COUNT(*) FROM security_events 
     WHERE event_timestamp::DATE = CURRENT_DATE AND severity_level IN ('HIGH', 'CRITICAL')) as critical_events_today,
    (SELECT COUNT(*) FROM failed_login_attempts 
     WHERE attempt_timestamp::DATE = CURRENT_DATE) as failed_logins_today,
    (SELECT COUNT(*) FROM security_violations 
     WHERE violation_timestamp::DATE = CURRENT_DATE) as violations_today,
    
    -- Active Security Status
    (SELECT COUNT(*) FROM user_sessions_enhanced 
     WHERE terminated_at IS NULL AND is_suspicious = TRUE) as suspicious_active_sessions,
    (SELECT COUNT(*) FROM security_events 
     WHERE incident_status = 'OPEN' AND severity_level IN ('HIGH', 'CRITICAL')) as open_critical_incidents,
    (SELECT COUNT(*) FROM data_subject_requests 
     WHERE status IN ('RECEIVED', 'IN_PROGRESS') AND response_due_date <= CURRENT_DATE + INTERVAL '7 days') as gdpr_requests_due_soon,
    
    -- Weekly Trends
    (SELECT COUNT(*) FROM security_events 
     WHERE event_timestamp >= CURRENT_DATE - INTERVAL '7 days') as security_events_7d,
    (SELECT COUNT(*) FROM failed_login_attempts 
     WHERE attempt_timestamp >= CURRENT_DATE - INTERVAL '7 days') as failed_logins_7d,
    
    -- Compliance Status
    (SELECT COUNT(*) FROM security_policies 
     WHERE is_active = TRUE AND next_review_date <= CURRENT_DATE + INTERVAL '30 days') as policies_due_review,
    (SELECT COUNT(*) FROM data_classification_catalog 
     WHERE next_review_date <= CURRENT_DATE + INTERVAL '30 days') as data_classifications_due_review;

-- Failed login pattern analysis view
CREATE OR REPLACE VIEW v_failed_login_patterns AS
SELECT 
    source_ip,
    email_attempted,
    DATE_TRUNC('hour', attempt_timestamp) as attempt_hour,
    COUNT(*) as attempt_count,
    COUNT(DISTINCT email_attempted) as unique_emails_attempted,
    BOOL_OR(is_brute_force_pattern) as is_brute_force,
    BOOL_OR(account_locked) as resulted_in_lockout,
    MIN(attempt_timestamp) as first_attempt,
    MAX(attempt_timestamp) as latest_attempt
FROM failed_login_attempts
WHERE attempt_timestamp >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY source_ip, email_attempted, DATE_TRUNC('hour', attempt_timestamp)
HAVING COUNT(*) > 3
ORDER BY attempt_count DESC, latest_attempt DESC;

-- =====================================================
-- AUDIT TRIGGERS FOR AUTOMATIC LOGGING
-- =====================================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    changed_columns TEXT[];
    current_user_id UUID;
    current_session_id UUID;
BEGIN
    -- Get current user context (from application context if available)
    current_user_id := current_setting('app.current_user_id', true)::UUID;
    current_session_id := current_setting('app.current_session_id', true)::UUID;
    
    -- Determine operation and values
    IF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        new_values := NULL;
        changed_columns := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        -- Calculate changed columns
        SELECT ARRAY_AGG(key) INTO changed_columns
        FROM jsonb_each_text(old_values) o
        JOIN jsonb_each_text(new_values) n ON o.key = n.key
        WHERE o.value IS DISTINCT FROM n.value;
    ELSIF TG_OP = 'INSERT' THEN
        old_values := NULL;
        new_values := to_jsonb(NEW);
        changed_columns := NULL;
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_trails_enhanced (
        table_name,
        record_id,
        operation_type,
        old_values,
        new_values,
        changed_columns,
        user_id,
        session_id,
        database_user,
        backend_pid
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE((to_jsonb(COALESCE(NEW, OLD))->>'id')::UUID, gen_random_uuid()),
        TG_OP,
        old_values,
        new_values,
        changed_columns,
        current_user_id,
        current_session_id,
        current_user,
        pg_backend_pid()
    );
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECURITY MONITORING FUNCTIONS
-- =====================================================

-- Function to detect suspicious login patterns
CREATE OR REPLACE FUNCTION detect_suspicious_login_activity(
    p_user_id UUID,
    p_ip_address INET,
    p_user_agent TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_recent_ips INTEGER;
    v_failed_attempts INTEGER;
    v_different_locations INTEGER;
    v_is_suspicious BOOLEAN := FALSE;
BEGIN
    -- Check for multiple IP addresses in last 24 hours
    SELECT COUNT(DISTINCT ip_address)
    INTO v_recent_ips
    FROM user_sessions_enhanced
    WHERE user_id = p_user_id 
    AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours';
    
    -- Check failed login attempts from this IP
    SELECT COUNT(*)
    INTO v_failed_attempts
    FROM failed_login_attempts
    WHERE source_ip = p_ip_address
    AND attempt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
    
    -- Determine if suspicious
    IF v_recent_ips > 5 OR v_failed_attempts > 10 THEN
        v_is_suspicious := TRUE;
        
        -- Log security event
        INSERT INTO security_events (
            event_type, event_category, severity_level,
            event_title, event_description,
            user_id, source_ip, user_agent,
            risk_score, detection_method
        ) VALUES (
            'SUSPICIOUS_LOGIN_PATTERN', 'AUTHENTICATION', 'MEDIUM',
            'Suspicious login activity detected',
            'Multiple IPs or excessive failed attempts detected',
            p_user_id, p_ip_address, p_user_agent,
            70, 'RULE_ENGINE'
        );
    END IF;
    
    RETURN v_is_suspicious;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit records based on retention policies
CREATE OR REPLACE FUNCTION cleanup_audit_records() RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_retention_date DATE;
BEGIN
    -- Calculate retention cutoff (7 years for regulatory compliance)
    v_retention_date := CURRENT_DATE - INTERVAL '7 years';
    
    -- Delete old audit records not under legal hold
    DELETE FROM audit_trails_enhanced
    WHERE action_timestamp::DATE < v_retention_date
    AND legal_hold = FALSE;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Delete old failed login attempts (1 year retention)
    DELETE FROM failed_login_attempts
    WHERE attempt_timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Delete resolved security events older than 2 years
    DELETE FROM security_events
    WHERE incident_status = 'RESOLVED'
    AND event_timestamp < CURRENT_TIMESTAMP - INTERVAL '2 years';
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate compliance reports
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_start_date DATE,
    p_end_date DATE,
    p_report_type VARCHAR DEFAULT 'GDPR'
) RETURNS JSON AS $$
DECLARE
    v_report_data JSON;
BEGIN
    IF p_report_type = 'GDPR' THEN
        -- GDPR compliance report
        SELECT json_build_object(
            'report_period', json_build_object('start_date', p_start_date, 'end_date', p_end_date),
            'data_subject_requests', json_build_object(
                'total_requests', (SELECT COUNT(*) FROM data_subject_requests WHERE received_date BETWEEN p_start_date AND p_end_date),
                'completed_on_time', (SELECT COUNT(*) FROM data_subject_requests WHERE received_date BETWEEN p_start_date AND p_end_date AND completed_date <= response_due_date),
                'overdue_requests', (SELECT COUNT(*) FROM data_subject_requests WHERE received_date BETWEEN p_start_date AND p_end_date AND response_due_date < CURRENT_DATE AND status != 'COMPLETED')
            ),
            'data_breaches', (SELECT COUNT(*) FROM security_events WHERE event_timestamp::DATE BETWEEN p_start_date AND p_end_date AND event_type = 'DATA_BREACH'),
            'processing_activities', (SELECT COUNT(*) FROM data_processing_activities WHERE created_at::DATE BETWEEN p_start_date AND p_end_date)
        )
        INTO v_report_data;
    END IF;
    
    RETURN v_report_data;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Comprehensive audit trail and security system created successfully!
    - Enhanced audit trails with full change tracking and metadata
    - Security monitoring and threat detection capabilities
    - GDPR and data privacy compliance features  
    - Access control and permission auditing
    - Data classification and handling requirements
    - Security policy management and violation tracking
    - Automated compliance reporting and retention management
    Complete enterprise-grade security and audit infrastructure deployed!';
END $$;