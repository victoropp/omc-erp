-- =====================================================
-- CRM AND CUSTOMER SERVICE MANAGEMENT SYSTEM
-- Version: 1.0.0
-- Description: Complete Customer Relationship Management and Customer Service system
-- =====================================================

-- =====================================================
-- ENHANCED CUSTOMER MANAGEMENT
-- =====================================================

-- Customer Segments
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_code VARCHAR(20) UNIQUE NOT NULL,
    segment_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Segment Criteria
    criteria_type VARCHAR(50), -- 'VOLUME', 'REVENUE', 'FREQUENCY', 'GEOGRAPHIC', 'BEHAVIORAL'
    criteria_value DECIMAL(20, 2),
    criteria_conditions JSONB,
    
    -- Benefits and Treatments
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    loyalty_multiplier DECIMAL(4, 2) DEFAULT 1.0,
    special_pricing BOOLEAN DEFAULT FALSE,
    dedicated_support BOOLEAN DEFAULT FALSE,
    
    -- Target Metrics
    target_revenue DECIMAL(20, 2),
    target_transactions INTEGER,
    target_retention_rate DECIMAL(5, 2),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer Credit Profiles
CREATE TABLE IF NOT EXISTS customer_credit_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Credit Assessment
    credit_rating VARCHAR(20), -- 'AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D'
    credit_score INTEGER, -- 0-1000
    risk_category VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'
    
    -- Credit Limits
    approved_credit_limit DECIMAL(20, 2),
    current_credit_limit DECIMAL(20, 2),
    utilized_credit DECIMAL(20, 2) DEFAULT 0,
    available_credit DECIMAL(20, 2) GENERATED ALWAYS AS (current_credit_limit - utilized_credit) STORED,
    
    -- Credit Terms
    payment_terms_days INTEGER DEFAULT 30,
    grace_period_days INTEGER DEFAULT 5,
    interest_rate_overdue DECIMAL(5, 2) DEFAULT 2.0, -- Monthly rate
    
    -- Assessment History
    last_assessment_date DATE,
    next_review_date DATE,
    assessment_notes TEXT,
    
    -- Guarantees and Security
    guarantor_information JSONB,
    collateral_details JSONB,
    security_deposit DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    credit_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'UNDER_REVIEW'
    status_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id),
    INDEX idx_credit_profile_rating (credit_rating),
    INDEX idx_credit_profile_status (credit_status)
);

-- Customer Interaction Types
CREATE TABLE IF NOT EXISTS interaction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- 'SALES', 'SUPPORT', 'MARKETING', 'COMPLAINT', 'INQUIRY'
    description TEXT,
    
    -- Workflow Configuration
    requires_follow_up BOOLEAN DEFAULT FALSE,
    default_priority VARCHAR(20) DEFAULT 'MEDIUM',
    escalation_time_hours INTEGER,
    
    -- SLA Configuration
    response_time_hours INTEGER,
    resolution_time_hours INTEGER,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer Interactions History
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    interaction_type_id UUID NOT NULL REFERENCES interaction_types(id),
    
    -- Interaction Details
    interaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    channel VARCHAR(50), -- 'PHONE', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_PERSON', 'WEBSITE', 'MOBILE_APP'
    direction VARCHAR(20), -- 'INBOUND', 'OUTBOUND'
    
    -- Content
    subject VARCHAR(200),
    description TEXT,
    outcome TEXT,
    next_action TEXT,
    
    -- Handling Information
    handled_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    department VARCHAR(100),
    station_id UUID REFERENCES stations(id),
    
    -- Status and Priority
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    
    -- Timing
    response_due_at TIMESTAMPTZ,
    resolution_due_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    
    -- Satisfaction
    customer_satisfaction_rating INTEGER, -- 1-5 stars
    customer_feedback TEXT,
    
    -- Related Records
    related_transaction_id UUID,
    related_complaint_id UUID,
    related_opportunity_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_interaction_customer (customer_id),
    INDEX idx_interaction_date (interaction_date),
    INDEX idx_interaction_status (status),
    INDEX idx_interaction_priority (priority),
    INDEX idx_interaction_type (interaction_type_id)
);

-- Customer Contact Preferences
CREATE TABLE IF NOT EXISTS customer_contact_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Communication Preferences
    preferred_communication_channel VARCHAR(50), -- 'EMAIL', 'SMS', 'PHONE', 'WHATSAPP'
    preferred_contact_time VARCHAR(50), -- 'MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'
    preferred_language VARCHAR(20) DEFAULT 'en', -- ISO language code
    
    -- Contact Permissions
    allow_marketing_emails BOOLEAN DEFAULT TRUE,
    allow_promotional_sms BOOLEAN DEFAULT TRUE,
    allow_marketing_calls BOOLEAN DEFAULT FALSE,
    allow_third_party_contact BOOLEAN DEFAULT FALSE,
    
    -- Frequency Preferences
    newsletter_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER'
    promotional_frequency VARCHAR(20) DEFAULT 'WEEKLY',
    
    -- Special Requirements
    special_instructions TEXT,
    accessibility_requirements TEXT,
    
    -- GDPR Compliance
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    consent_ip_address INET,
    data_processing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id)
);

-- =====================================================
-- SALES OPPORTUNITIES AND PIPELINE
-- =====================================================

-- Opportunity Stages
CREATE TABLE IF NOT EXISTS opportunity_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_code VARCHAR(20) UNIQUE NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    
    -- Stage Configuration
    probability_percentage DECIMAL(5, 2), -- Default win probability at this stage
    is_closed_won BOOLEAN DEFAULT FALSE,
    is_closed_lost BOOLEAN DEFAULT FALSE,
    
    -- Activities Required
    required_activities JSONB,
    mandatory_fields JSONB,
    
    -- Duration and Aging
    typical_duration_days INTEGER,
    maximum_duration_days INTEGER,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(stage_order)
);

-- Sales Opportunities
CREATE TABLE IF NOT EXISTS sales_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Opportunity Details
    opportunity_name VARCHAR(200) NOT NULL,
    description TEXT,
    opportunity_source VARCHAR(50), -- 'REFERRAL', 'MARKETING', 'COLD_CALL', 'WEBSITE', 'WALK_IN'
    
    -- Financial Information
    estimated_value DECIMAL(20, 2),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    annual_value DECIMAL(20, 2), -- For recurring opportunities
    
    -- Products/Services
    primary_product_category VARCHAR(100),
    products_interested JSONB, -- Array of product IDs or categories
    
    -- Sales Process
    current_stage_id UUID REFERENCES opportunity_stages(id),
    probability_percentage DECIMAL(5, 2),
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Assignment
    sales_rep_id UUID REFERENCES users(id),
    sales_team VARCHAR(100),
    assigned_station_id UUID REFERENCES stations(id),
    
    -- Status
    opportunity_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'WON', 'LOST', 'ABANDONED'
    
    -- Closing Information
    won_reason TEXT,
    lost_reason TEXT,
    competitor_name VARCHAR(200),
    
    -- Important Dates
    first_contact_date DATE,
    last_activity_date DATE,
    next_activity_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    INDEX idx_opportunity_number (opportunity_number),
    INDEX idx_opportunity_customer (customer_id),
    INDEX idx_opportunity_stage (current_stage_id),
    INDEX idx_opportunity_sales_rep (sales_rep_id),
    INDEX idx_opportunity_status (opportunity_status),
    INDEX idx_opportunity_close_date (expected_close_date)
);

-- Opportunity Activities
CREATE TABLE IF NOT EXISTS opportunity_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES sales_opportunities(id),
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- 'CALL', 'MEETING', 'EMAIL', 'PROPOSAL', 'DEMO', 'FOLLOW_UP'
    activity_subject VARCHAR(200),
    activity_description TEXT,
    activity_outcome TEXT,
    
    -- Scheduling
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Participants
    assigned_to UUID REFERENCES users(id),
    participants JSONB, -- Array of participant details
    location VARCHAR(200),
    
    -- Status
    activity_status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    
    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Notes and Attachments
    notes TEXT,
    attachments JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    INDEX idx_activity_opportunity (opportunity_id),
    INDEX idx_activity_assigned (assigned_to),
    INDEX idx_activity_date (scheduled_date),
    INDEX idx_activity_status (activity_status)
);

-- Opportunity Competitors
CREATE TABLE IF NOT EXISTS opportunity_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES sales_opportunities(id),
    
    -- Competitor Information
    competitor_name VARCHAR(200) NOT NULL,
    competitor_type VARCHAR(50), -- 'DIRECT', 'INDIRECT', 'SUBSTITUTE'
    
    -- Competitive Analysis
    strengths TEXT,
    weaknesses TEXT,
    pricing_information TEXT,
    competitive_threat_level VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    eliminated_date DATE,
    elimination_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_competitor_opportunity (opportunity_id)
);

-- =====================================================
-- CUSTOMER COMPLAINTS MANAGEMENT
-- =====================================================

-- Complaint Categories
CREATE TABLE IF NOT EXISTS complaint_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id UUID REFERENCES complaint_categories(id),
    description TEXT,
    
    -- SLA Configuration
    response_time_hours INTEGER DEFAULT 24,
    resolution_time_hours INTEGER DEFAULT 72,
    escalation_time_hours INTEGER DEFAULT 48,
    
    -- Assignment Rules
    default_department VARCHAR(100),
    auto_assign_to UUID REFERENCES users(id),
    
    -- Severity Mapping
    default_severity VARCHAR(20) DEFAULT 'MEDIUM',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer Complaints
CREATE TABLE IF NOT EXISTS customer_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    complaint_category_id UUID REFERENCES complaint_categories(id),
    
    -- Complaint Details
    complaint_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    complaint_subject VARCHAR(200) NOT NULL,
    complaint_description TEXT NOT NULL,
    
    -- Channel and Location
    complaint_channel VARCHAR(50), -- 'PHONE', 'EMAIL', 'IN_PERSON', 'WEBSITE', 'SOCIAL_MEDIA', 'MOBILE_APP'
    station_id UUID REFERENCES stations(id),
    
    -- Severity and Priority
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    business_impact VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH'
    
    -- Related Information
    related_transaction_id UUID,
    related_invoice_id UUID,
    related_product_id UUID,
    
    -- Assignment and Handling
    assigned_to UUID REFERENCES users(id),
    assigned_department VARCHAR(100),
    escalated_to UUID REFERENCES users(id),
    
    -- Status and Timeline
    complaint_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'
    
    -- SLA Tracking
    response_due_at TIMESTAMPTZ,
    resolution_due_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- SLA Compliance
    response_sla_met BOOLEAN,
    resolution_sla_met BOOLEAN,
    
    -- Resolution Information
    root_cause_analysis TEXT,
    resolution_description TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    
    -- Customer Feedback
    customer_satisfaction_rating INTEGER, -- 1-5 stars
    customer_feedback TEXT,
    compensation_provided DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_complaint_number (complaint_number),
    INDEX idx_complaint_customer (customer_id),
    INDEX idx_complaint_category (complaint_category_id),
    INDEX idx_complaint_status (complaint_status),
    INDEX idx_complaint_severity (severity),
    INDEX idx_complaint_assigned (assigned_to),
    INDEX idx_complaint_date (complaint_date)
);

-- Complaint Actions/Updates
CREATE TABLE IF NOT EXISTS complaint_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES customer_complaints(id),
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL, -- 'STATUS_CHANGE', 'ASSIGNMENT', 'COMMUNICATION', 'INVESTIGATION', 'RESOLUTION'
    action_description TEXT NOT NULL,
    internal_notes TEXT,
    
    -- Actor Information
    performed_by UUID NOT NULL REFERENCES users(id),
    action_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Status Changes
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    
    -- Assignment Changes
    previous_assignee UUID REFERENCES users(id),
    new_assignee UUID REFERENCES users(id),
    
    -- Communication
    customer_notified BOOLEAN DEFAULT FALSE,
    communication_method VARCHAR(50),
    
    -- Attachments and Evidence
    attachments JSONB,
    evidence_collected TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_action_complaint (complaint_id),
    INDEX idx_action_type (action_type),
    INDEX idx_action_date (action_timestamp)
);

-- =====================================================
-- CUSTOMER SURVEYS AND FEEDBACK
-- =====================================================

-- Survey Templates
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Survey Configuration
    survey_type VARCHAR(50), -- 'SATISFACTION', 'NPS', 'FEEDBACK', 'MARKET_RESEARCH'
    target_audience VARCHAR(50), -- 'ALL_CUSTOMERS', 'SPECIFIC_SEGMENT', 'RECENT_TRANSACTIONS'
    
    -- Questions Configuration
    questions JSONB NOT NULL, -- Array of question objects
    scoring_method VARCHAR(50), -- 'LIKERT', 'NPS', 'BINARY', 'CUSTOM'
    
    -- Timing and Frequency
    trigger_event VARCHAR(50), -- 'TRANSACTION', 'MONTHLY', 'QUARTERLY', 'MANUAL'
    delay_days INTEGER DEFAULT 1, -- Days after trigger event
    
    -- Design and Branding
    survey_design JSONB,
    branding_settings JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Customer Surveys
CREATE TABLE IF NOT EXISTS customer_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_number VARCHAR(50) UNIQUE NOT NULL,
    survey_template_id UUID NOT NULL REFERENCES survey_templates(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Survey Details
    survey_subject VARCHAR(200),
    survey_trigger VARCHAR(50), -- What triggered this survey
    related_transaction_id UUID,
    related_interaction_id UUID,
    
    -- Distribution
    sent_date DATE,
    sent_method VARCHAR(50), -- 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'
    sent_to_contact VARCHAR(200), -- Email or phone number used
    
    -- Response Tracking
    opened_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Status
    survey_status VARCHAR(20) DEFAULT 'SENT', -- 'SENT', 'OPENED', 'STARTED', 'COMPLETED', 'EXPIRED', 'BOUNCED'
    
    -- Response Summary
    response_rate DECIMAL(5, 2),
    completion_rate DECIMAL(5, 2),
    overall_score DECIMAL(5, 2),
    nps_score INTEGER, -- Net Promoter Score (-100 to 100)
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_survey_number (survey_number),
    INDEX idx_survey_customer (customer_id),
    INDEX idx_survey_template (survey_template_id),
    INDEX idx_survey_status (survey_status),
    INDEX idx_survey_completion (completed_at)
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_survey_id UUID NOT NULL REFERENCES customer_surveys(id),
    question_id VARCHAR(50) NOT NULL, -- References question in template
    
    -- Response Data
    question_text TEXT,
    question_type VARCHAR(50), -- 'MULTIPLE_CHOICE', 'TEXT', 'RATING', 'YES_NO'
    response_value TEXT, -- The actual response
    response_score DECIMAL(5, 2), -- Numeric score if applicable
    
    -- Response Metadata
    response_time_seconds INTEGER,
    skipped BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_response_survey (customer_survey_id),
    INDEX idx_response_question (question_id)
);

-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

-- Marketing Campaign Types
CREATE TABLE IF NOT EXISTS campaign_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Default Configuration
    default_channels JSONB, -- ['EMAIL', 'SMS', 'SOCIAL_MEDIA']
    default_duration_days INTEGER,
    budget_guidelines TEXT,
    
    -- Success Metrics
    success_metrics JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    campaign_type_id UUID REFERENCES campaign_types(id),
    
    -- Campaign Details
    description TEXT,
    objectives TEXT,
    target_audience TEXT,
    
    -- Timing
    start_date DATE,
    end_date DATE,
    launch_date DATE,
    
    -- Budget and Costs
    total_budget DECIMAL(20, 2),
    actual_cost DECIMAL(20, 2) DEFAULT 0,
    cost_per_acquisition_target DECIMAL(15, 2),
    roi_target DECIMAL(5, 2), -- Percentage
    
    -- Targeting
    customer_segment_ids JSONB, -- Array of customer segment IDs
    geographic_targeting JSONB,
    demographic_targeting JSONB,
    behavioral_targeting JSONB,
    
    -- Channels
    channels JSONB, -- ['EMAIL', 'SMS', 'SOCIAL_MEDIA', 'RADIO', 'PRINT']
    
    -- Creative Assets
    creative_assets JSONB, -- URLs to images, videos, etc.
    message_content TEXT,
    call_to_action TEXT,
    
    -- Status
    campaign_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
    
    -- Performance Tracking
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    
    -- Calculated Metrics
    delivery_rate DECIMAL(5, 2),
    open_rate DECIMAL(5, 2),
    click_rate DECIMAL(5, 2),
    conversion_rate DECIMAL(5, 2),
    unsubscribe_rate DECIMAL(5, 2),
    roi_actual DECIMAL(5, 2),
    
    -- Campaign Manager
    campaign_manager_id UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_campaign_code (campaign_code),
    INDEX idx_campaign_type (campaign_type_id),
    INDEX idx_campaign_status (campaign_status),
    INDEX idx_campaign_dates (start_date, end_date),
    INDEX idx_campaign_manager (campaign_manager_id)
);

-- Campaign Recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Targeting Information
    segment_matched VARCHAR(100),
    targeting_criteria_met JSONB,
    
    -- Delivery Status
    selected_channel VARCHAR(50), -- Which channel was used for this recipient
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Engagement Tracking
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Response Details
    conversion_value DECIMAL(15, 2),
    conversion_type VARCHAR(50), -- 'PURCHASE', 'SIGNUP', 'VISIT', 'INQUIRY'
    
    -- Status
    delivery_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED'
    engagement_status VARCHAR(20) DEFAULT 'NOT_ENGAGED', -- 'NOT_ENGAGED', 'OPENED', 'CLICKED', 'CONVERTED'
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, customer_id),
    INDEX idx_recipient_campaign (campaign_id),
    INDEX idx_recipient_customer (customer_id),
    INDEX idx_recipient_delivery_status (delivery_status),
    INDEX idx_recipient_engagement (engagement_status)
);

-- =====================================================
-- CUSTOMER ANALYTICS AND INSIGHTS
-- =====================================================

-- Customer Analytics (Daily aggregations)
CREATE TABLE IF NOT EXISTS customer_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    analytics_date DATE NOT NULL,
    
    -- Transaction Metrics
    total_transactions INTEGER DEFAULT 0,
    total_revenue DECIMAL(20, 2) DEFAULT 0,
    average_transaction_value DECIMAL(15, 2) DEFAULT 0,
    total_volume_liters DECIMAL(15, 2) DEFAULT 0,
    
    -- Product Preferences
    preferred_fuel_type VARCHAR(50),
    fuel_type_distribution JSONB, -- {'PETROL': 0.7, 'DIESEL': 0.3}
    
    -- Visit Patterns
    total_visits INTEGER DEFAULT 0,
    preferred_station_id UUID REFERENCES stations(id),
    station_visit_distribution JSONB,
    preferred_visit_time VARCHAR(20), -- 'MORNING', 'AFTERNOON', 'EVENING'
    preferred_days JSONB, -- ['MON', 'TUE', 'WED']
    
    -- Payment Behavior
    preferred_payment_method VARCHAR(50),
    payment_method_distribution JSONB,
    average_payment_time_seconds INTEGER,
    
    -- Loyalty Metrics
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,
    loyalty_engagement_score DECIMAL(5, 2),
    
    -- Engagement Metrics
    app_logins INTEGER DEFAULT 0,
    website_visits INTEGER DEFAULT 0,
    support_interactions INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    survey_responses INTEGER DEFAULT 0,
    
    -- Calculated Scores
    satisfaction_score DECIMAL(5, 2),
    engagement_score DECIMAL(5, 2),
    retention_risk_score DECIMAL(5, 2), -- Higher = more likely to churn
    lifetime_value DECIMAL(20, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id, analytics_date),
    INDEX idx_analytics_customer (customer_id),
    INDEX idx_analytics_date (analytics_date),
    INDEX idx_analytics_revenue (total_revenue),
    INDEX idx_analytics_retention_risk (retention_risk_score)
);

-- Customer Segments Assignment (Many-to-Many)
CREATE TABLE IF NOT EXISTS customer_segment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    segment_id UUID NOT NULL REFERENCES customer_segments(id),
    
    -- Assignment Details
    assigned_date DATE DEFAULT CURRENT_DATE,
    assignment_method VARCHAR(50), -- 'AUTOMATIC', 'MANUAL', 'CAMPAIGN_TRIGGERED'
    criteria_met JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    removed_date DATE,
    removal_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id, segment_id),
    INDEX idx_segment_assignment_customer (customer_id),
    INDEX idx_segment_assignment_segment (segment_id),
    INDEX idx_segment_assignment_active (is_active)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default customer segments
INSERT INTO customer_segments (segment_code, segment_name, description, criteria_type) VALUES
('VIP', 'VIP Customers', 'High-value customers with premium treatment', 'REVENUE'),
('FREQUENT', 'Frequent Buyers', 'Customers with high transaction frequency', 'FREQUENCY'),
('NEW', 'New Customers', 'Recently acquired customers', 'RECENCY'),
('INACTIVE', 'Inactive Customers', 'Customers with declining engagement', 'BEHAVIORAL'),
('FLEET', 'Fleet Customers', 'Corporate fleet customers', 'VOLUME'),
('RETAIL', 'Retail Customers', 'Individual retail customers', 'BEHAVIORAL')
ON CONFLICT (segment_code) DO NOTHING;

-- Insert default interaction types
INSERT INTO interaction_types (type_code, type_name, category, response_time_hours, resolution_time_hours) VALUES
('INQUIRY', 'General Inquiry', 'INQUIRY', 4, 24),
('COMPLAINT', 'Complaint', 'COMPLAINT', 2, 48),
('SALES_CALL', 'Sales Call', 'SALES', null, null),
('SUPPORT_CALL', 'Support Call', 'SUPPORT', 1, 8),
('FOLLOW_UP', 'Follow-up Contact', 'SUPPORT', null, null),
('FEEDBACK', 'Customer Feedback', 'MARKETING', null, null),
('QUOTATION', 'Price Quotation', 'SALES', 4, 24)
ON CONFLICT (type_code) DO NOTHING;

-- Insert default opportunity stages
INSERT INTO opportunity_stages (stage_code, stage_name, stage_order, probability_percentage) VALUES
('LEAD', 'Lead', 1, 10),
('QUALIFIED', 'Qualified', 2, 25),
('PROPOSAL', 'Proposal Sent', 3, 50),
('NEGOTIATION', 'Negotiation', 4, 75),
('CLOSED_WON', 'Closed Won', 5, 100),
('CLOSED_LOST', 'Closed Lost', 6, 0)
ON CONFLICT (stage_code) DO NOTHING;

-- Update opportunity stages for closed status
UPDATE opportunity_stages SET is_closed_won = TRUE WHERE stage_code = 'CLOSED_WON';
UPDATE opportunity_stages SET is_closed_lost = TRUE WHERE stage_code = 'CLOSED_LOST';

-- Insert default complaint categories
INSERT INTO complaint_categories (category_code, category_name, description, response_time_hours, resolution_time_hours) VALUES
('FUEL_QUALITY', 'Fuel Quality', 'Issues related to fuel quality and contamination', 4, 24),
('SERVICE_QUALITY', 'Service Quality', 'Poor service or staff behavior', 2, 12),
('BILLING', 'Billing Issues', 'Pricing, payment, and billing disputes', 4, 48),
('EQUIPMENT', 'Equipment Problems', 'Faulty pumps, dispensers, or equipment', 1, 8),
('SAFETY', 'Safety Concerns', 'Safety incidents or hazardous conditions', 1, 4),
('FACILITY', 'Facility Issues', 'Problems with station facilities', 8, 72),
('OTHER', 'Other Complaints', 'Miscellaneous complaints', 24, 72)
ON CONFLICT (category_code) DO NOTHING;

-- Insert default campaign types
INSERT INTO campaign_types (type_code, type_name, description) VALUES
('PROMOTION', 'Promotional Campaign', 'Price promotions and special offers'),
('AWARENESS', 'Brand Awareness', 'Brand building and awareness campaigns'),
('LOYALTY', 'Loyalty Campaign', 'Customer retention and loyalty programs'),
('ACQUISITION', 'Customer Acquisition', 'New customer acquisition campaigns'),
('REACTIVATION', 'Win-back Campaign', 'Reactivating inactive customers'),
('SURVEY', 'Survey Campaign', 'Customer feedback and survey campaigns')
ON CONFLICT (type_code) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CRM and Customer Service Management System schema created successfully!';
END $$;