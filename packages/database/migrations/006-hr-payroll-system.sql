-- =====================================================
-- HR AND PAYROLL MANAGEMENT SYSTEM
-- Version: 1.0.0
-- Description: Complete Human Resources and Payroll system with Ghana labor law compliance
-- =====================================================

-- =====================================================
-- ORGANIZATIONAL STRUCTURE
-- =====================================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_code VARCHAR(20) UNIQUE NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    department_head_id UUID, -- Will reference employees after creation
    cost_center_code VARCHAR(50),
    budget_code VARCHAR(50),
    location VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Job Positions/Titles
CREATE TABLE IF NOT EXISTS job_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_code VARCHAR(50) UNIQUE NOT NULL,
    position_title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    job_level INTEGER,
    job_grade VARCHAR(20),
    reports_to_position_id UUID REFERENCES job_positions(id),
    
    -- Job Description
    job_summary TEXT,
    key_responsibilities JSONB,
    required_qualifications JSONB,
    preferred_qualifications JSONB,
    required_experience_years INTEGER,
    
    -- Compensation
    min_salary DECIMAL(15, 2),
    max_salary DECIMAL(15, 2),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    total_positions INTEGER DEFAULT 1,
    filled_positions INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMPLOYEE MANAGEMENT
-- =====================================================

-- Employee Categories
CREATE TABLE IF NOT EXISTS employee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Benefits Configuration
    benefits_package JSONB,
    leave_entitlements JSONB,
    overtime_rules JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employees (Enhanced from existing)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Information
    title VARCHAR(10), -- Mr, Mrs, Dr, etc.
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    maiden_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10), -- 'MALE', 'FEMALE', 'OTHER'
    marital_status VARCHAR(20), -- 'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'
    nationality VARCHAR(100) DEFAULT 'Ghanaian',
    
    -- Identification Documents (Ghana-specific)
    national_id VARCHAR(50), -- Ghana Card number
    voter_id VARCHAR(50),
    passport_number VARCHAR(50),
    driving_license VARCHAR(50),
    tin_number VARCHAR(50), -- Ghana TIN
    ssnit_number VARCHAR(50), -- Social Security Number
    
    -- Contact Information
    personal_email VARCHAR(200),
    work_email VARCHAR(200),
    personal_phone VARCHAR(20),
    work_phone VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Address (Ghana addressing system)
    residential_address TEXT,
    postal_address TEXT,
    ghana_post_gps_code VARCHAR(20),
    residential_region VARCHAR(100),
    residential_district VARCHAR(100),
    hometown VARCHAR(100),
    
    -- Employment Details
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    confirmation_date DATE,
    termination_date DATE,
    termination_reason VARCHAR(200),
    employee_category_id UUID REFERENCES employee_categories(id),
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES job_positions(id),
    station_id UUID REFERENCES stations(id),
    supervisor_id UUID REFERENCES employees(id),
    
    -- Employment Terms
    employment_type VARCHAR(20) NOT NULL, -- 'PERMANENT', 'CONTRACT', 'CASUAL', 'INTERNSHIP'
    contract_type VARCHAR(20), -- 'FIXED_TERM', 'INDEFINITE', 'PROJECT_BASED'
    contract_start_date DATE,
    contract_end_date DATE,
    work_schedule VARCHAR(20) DEFAULT 'FULL_TIME', -- 'FULL_TIME', 'PART_TIME', 'SHIFT'
    
    -- Compensation
    basic_salary DECIMAL(15, 2),
    salary_currency VARCHAR(3) DEFAULT 'GHS',
    salary_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- 'MONTHLY', 'WEEKLY', 'DAILY'
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    
    -- Status and Flags
    employment_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED'
    is_payroll_active BOOLEAN DEFAULT TRUE,
    is_user_account_active BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    INDEX idx_employee_number (employee_number),
    INDEX idx_employee_status (employment_status),
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_hire_date (hire_date)
);

-- Employee Dependents
CREATE TABLE IF NOT EXISTS employee_dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Dependent Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    relationship VARCHAR(50) NOT NULL, -- 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING'
    national_id VARCHAR(50),
    
    -- Benefits Eligibility
    health_insurance_eligible BOOLEAN DEFAULT FALSE,
    tax_exemption_eligible BOOLEAN DEFAULT FALSE,
    education_allowance_eligible BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Education
CREATE TABLE IF NOT EXISTS employee_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Education Details
    education_level VARCHAR(50) NOT NULL, -- 'PRIMARY', 'SECONDARY', 'TERTIARY', 'POSTGRADUATE'
    institution_name VARCHAR(200) NOT NULL,
    qualification VARCHAR(200),
    field_of_study VARCHAR(200),
    start_date DATE,
    completion_date DATE,
    grade_obtained VARCHAR(20),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    certificate_number VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Work Experience
CREATE TABLE IF NOT EXISTS employee_work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Experience Details
    employer_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    responsibilities TEXT,
    reason_for_leaving VARCHAR(200),
    salary DECIMAL(15, 2),
    supervisor_name VARCHAR(200),
    supervisor_contact VARCHAR(50),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ATTENDANCE AND TIME MANAGEMENT
-- =====================================================

-- Work Schedules
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_name VARCHAR(100) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- 'FIXED', 'FLEXIBLE', 'SHIFT'
    
    -- Schedule Configuration
    working_days JSONB, -- ['MON', 'TUE', 'WED', 'THU', 'FRI']
    daily_hours DECIMAL(4, 2) DEFAULT 8.0,
    weekly_hours DECIMAL(4, 2) DEFAULT 40.0,
    
    -- Time Configuration
    start_time TIME,
    end_time TIME,
    break_duration_minutes INTEGER DEFAULT 60,
    grace_period_minutes INTEGER DEFAULT 15,
    
    -- Overtime Rules
    overtime_threshold_daily DECIMAL(4, 2) DEFAULT 8.0,
    overtime_threshold_weekly DECIMAL(4, 2) DEFAULT 40.0,
    overtime_rate_multiplier DECIMAL(4, 2) DEFAULT 1.5,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Schedule Assignment
CREATE TABLE IF NOT EXISTS employee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    work_schedule_id UUID NOT NULL REFERENCES work_schedules(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, effective_from)
);

-- Daily Attendance
CREATE TABLE IF NOT EXISTS employee_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    
    -- Clock In/Out Times
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    break_start_time TIMESTAMPTZ,
    break_end_time TIMESTAMPTZ,
    
    -- Calculated Hours
    scheduled_hours DECIMAL(4, 2),
    actual_hours DECIMAL(4, 2),
    break_hours DECIMAL(4, 2),
    regular_hours DECIMAL(4, 2),
    overtime_hours DECIMAL(4, 2),
    
    -- Status
    attendance_status VARCHAR(20) DEFAULT 'PRESENT', -- 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'
    is_holiday BOOLEAN DEFAULT FALSE,
    is_weekend BOOLEAN DEFAULT FALSE,
    
    -- Location Tracking
    clock_in_location JSONB, -- {lat, lng, address}
    clock_out_location JSONB,
    station_id UUID REFERENCES stations(id),
    
    -- Notes and Approvals
    notes TEXT,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, attendance_date),
    INDEX idx_attendance_employee_date (employee_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_status (attendance_status)
);

-- =====================================================
-- LEAVE MANAGEMENT
-- =====================================================

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_code VARCHAR(20) UNIQUE NOT NULL,
    leave_name VARCHAR(100) NOT NULL,
    
    -- Ghana Labor Law Compliance
    is_statutory BOOLEAN DEFAULT FALSE, -- Required by Ghana labor law
    is_paid BOOLEAN DEFAULT TRUE,
    max_days_per_year DECIMAL(5, 2),
    max_consecutive_days INTEGER,
    notice_period_days INTEGER DEFAULT 14,
    
    -- Accrual Rules
    accrual_method VARCHAR(20), -- 'ANNUAL', 'MONTHLY', 'WEEKLY', 'NONE'
    accrual_rate DECIMAL(5, 2), -- Days accrued per period
    carry_forward_allowed BOOLEAN DEFAULT FALSE,
    max_carry_forward_days DECIMAL(5, 2),
    
    -- Gender and Condition Specific
    gender_restriction VARCHAR(10), -- 'MALE', 'FEMALE', 'ALL'
    requires_medical_certificate BOOLEAN DEFAULT FALSE,
    requires_supporting_documents BOOLEAN DEFAULT FALSE,
    
    -- Approval Requirements
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_levels INTEGER DEFAULT 1,
    auto_approve BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Leave Balances
CREATE TABLE IF NOT EXISTS employee_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    leave_year INTEGER NOT NULL,
    
    -- Balance Tracking
    opening_balance DECIMAL(5, 2) DEFAULT 0,
    accrued_balance DECIMAL(5, 2) DEFAULT 0,
    used_balance DECIMAL(5, 2) DEFAULT 0,
    pending_balance DECIMAL(5, 2) DEFAULT 0, -- Pending approval
    carried_forward DECIMAL(5, 2) DEFAULT 0,
    current_balance DECIMAL(5, 2) GENERATED ALWAYS AS (
        opening_balance + accrued_balance + carried_forward - used_balance - pending_balance
    ) STORED,
    
    last_accrual_date DATE,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, leave_type_id, leave_year),
    INDEX idx_leave_balance_employee (employee_id),
    INDEX idx_leave_balance_year (leave_year)
);

-- Leave Applications
CREATE TABLE IF NOT EXISTS leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    
    -- Leave Details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    return_date DATE, -- Expected return date
    actual_return_date DATE, -- Actual return date
    
    -- Application Details
    application_date DATE DEFAULT CURRENT_DATE,
    reason TEXT,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    handover_notes TEXT,
    
    -- Supporting Documents
    medical_certificate_attached BOOLEAN DEFAULT FALSE,
    supporting_documents JSONB,
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'COMPLETED'
    current_approval_level INTEGER DEFAULT 1,
    
    -- Approval History stored in separate table
    applied_by UUID REFERENCES employees(id),
    final_approved_by UUID REFERENCES employees(id),
    final_approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES employees(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_leave_application_employee (employee_id),
    INDEX idx_leave_application_dates (start_date, end_date),
    INDEX idx_leave_application_status (status)
);

-- Leave Approval Workflow
CREATE TABLE IF NOT EXISTS leave_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_application_id UUID NOT NULL REFERENCES leave_applications(id),
    approval_level INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES employees(id),
    
    -- Approval Details
    approval_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    approved_at TIMESTAMPTZ,
    comments TEXT,
    
    -- Delegation
    delegated_to UUID REFERENCES employees(id),
    delegated_at TIMESTAMPTZ,
    delegation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(leave_application_id, approval_level)
);

-- =====================================================
-- PAYROLL SYSTEM
-- =====================================================

-- Payroll Periods
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(100) NOT NULL, -- 'January 2025', 'Week 1 - January 2025'
    payroll_type VARCHAR(20) NOT NULL, -- 'MONTHLY', 'WEEKLY', 'BI_WEEKLY'
    
    -- Period Dates
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'PROCESSING', 'FINALIZED', 'PAID', 'CLOSED'
    
    -- Processing Information
    total_employees INTEGER DEFAULT 0,
    total_gross_pay DECIMAL(20, 2) DEFAULT 0,
    total_deductions DECIMAL(20, 2) DEFAULT 0,
    total_net_pay DECIMAL(20, 2) DEFAULT 0,
    
    -- Approval and Processing
    processed_by UUID REFERENCES employees(id),
    processed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(period_start_date, period_end_date, payroll_type),
    INDEX idx_payroll_period_dates (period_start_date, period_end_date),
    INDEX idx_payroll_period_status (status)
);

-- Payroll Components (Earnings and Deductions)
CREATE TABLE IF NOT EXISTS payroll_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_code VARCHAR(50) UNIQUE NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    component_type VARCHAR(20) NOT NULL, -- 'EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION'
    component_category VARCHAR(50), -- 'BASIC_PAY', 'ALLOWANCE', 'OVERTIME', 'TAX', 'SOCIAL_SECURITY', 'LOAN'
    
    -- Calculation Rules
    calculation_method VARCHAR(20), -- 'FIXED', 'PERCENTAGE', 'FORMULA', 'HOURS_BASED'
    default_amount DECIMAL(15, 2),
    percentage_rate DECIMAL(8, 4),
    calculation_formula TEXT, -- For complex calculations
    
    -- Ghana Specific Compliance
    is_taxable BOOLEAN DEFAULT TRUE,
    is_ssnit_deductible BOOLEAN DEFAULT TRUE, -- Subject to SSNIT deduction
    is_statutory BOOLEAN DEFAULT FALSE, -- Required by Ghana labor law
    
    -- Account Integration
    expense_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    liability_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Frequency and Conditions
    frequency VARCHAR(20) DEFAULT 'MONTHLY', -- 'MONTHLY', 'WEEKLY', 'ONCE_OFF', 'CONDITIONAL'
    effective_from DATE,
    effective_to DATE,
    
    -- Display and Reporting
    display_order INTEGER DEFAULT 0,
    display_on_payslip BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payroll_component_type (component_type),
    INDEX idx_payroll_component_active (is_active)
);

-- Employee Payroll Components (Individual assignments)
CREATE TABLE IF NOT EXISTS employee_payroll_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    payroll_component_id UUID NOT NULL REFERENCES payroll_components(id),
    
    -- Individual Settings
    amount DECIMAL(15, 2),
    percentage_rate DECIMAL(8, 4),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Effective Period
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Special Conditions
    conditions JSONB, -- Custom conditions for this employee
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_employee_payroll_component (employee_id, payroll_component_id),
    INDEX idx_employee_payroll_effective (employee_id, effective_from, effective_to)
);

-- Employee Payroll (Main payroll processing table)
CREATE TABLE IF NOT EXISTS employee_payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Basic Information
    employee_number VARCHAR(50),
    employee_name VARCHAR(300),
    department_name VARCHAR(200),
    position_title VARCHAR(200),
    
    -- Salary Information
    basic_salary DECIMAL(15, 2) NOT NULL,
    days_worked DECIMAL(5, 2),
    hours_worked DECIMAL(8, 2),
    overtime_hours DECIMAL(8, 2),
    
    -- Calculated Totals
    gross_earnings DECIMAL(15, 2) NOT NULL,
    total_deductions DECIMAL(15, 2) NOT NULL,
    employer_contributions DECIMAL(15, 2) DEFAULT 0,
    net_pay DECIMAL(15, 2) NOT NULL,
    
    -- Ghana Statutory Deductions
    paye_tax DECIMAL(15, 2) DEFAULT 0, -- Pay As You Earn Tax
    ssnit_employee DECIMAL(15, 2) DEFAULT 0, -- Employee SSNIT (5.5%)
    ssnit_employer DECIMAL(15, 2) DEFAULT 0, -- Employer SSNIT (13%)
    tier3_pension DECIMAL(15, 2) DEFAULT 0, -- Tier 3 Pension (5%)
    
    -- Bank Transfer Information
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_transfer_amount DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'CALCULATED', 'APPROVED', 'PAID'
    
    -- Processing Information
    calculated_at TIMESTAMPTZ,
    calculated_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES employees(id),
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(payroll_period_id, employee_id),
    INDEX idx_payroll_period_employee (payroll_period_id, employee_id),
    INDEX idx_payroll_status (status),
    INDEX idx_payroll_pay_date (payroll_period_id, status)
);

-- Payroll Component Details (Individual line items)
CREATE TABLE IF NOT EXISTS payroll_component_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_payroll_id UUID NOT NULL REFERENCES employee_payrolls(id),
    payroll_component_id UUID NOT NULL REFERENCES payroll_components(id),
    
    -- Component Details
    component_code VARCHAR(50),
    component_name VARCHAR(200),
    component_type VARCHAR(20), -- 'EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION'
    
    -- Calculation Details
    rate DECIMAL(15, 4),
    units DECIMAL(10, 2), -- Hours, days, percentage, etc.
    amount DECIMAL(15, 2) NOT NULL,
    
    -- Tax Treatment
    is_taxable BOOLEAN DEFAULT TRUE,
    is_ssnit_deductible BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payroll_detail_payroll (employee_payroll_id),
    INDEX idx_payroll_detail_component (payroll_component_id)
);

-- =====================================================
-- GHANA TAX SYSTEM (PAYE)
-- =====================================================

-- Ghana Tax Brackets (PAYE)
CREATE TABLE IF NOT EXISTS ghana_tax_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_year INTEGER NOT NULL,
    bracket_number INTEGER NOT NULL,
    
    -- Bracket Configuration
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2),
    tax_rate DECIMAL(8, 4) NOT NULL, -- Percentage as decimal
    cumulative_tax DECIMAL(15, 2) DEFAULT 0,
    
    -- Effective Period
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tax_year, bracket_number),
    INDEX idx_tax_bracket_year (tax_year),
    INDEX idx_tax_bracket_active (is_active)
);

-- Employee Tax Information
CREATE TABLE IF NOT EXISTS employee_tax_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    tax_year INTEGER NOT NULL,
    
    -- Tax Exemptions and Reliefs
    personal_relief DECIMAL(15, 2) DEFAULT 0,
    spouse_relief DECIMAL(15, 2) DEFAULT 0,
    children_relief DECIMAL(15, 2) DEFAULT 0,
    aged_relief DECIMAL(15, 2) DEFAULT 0,
    disability_relief DECIMAL(15, 2) DEFAULT 0,
    total_relief DECIMAL(15, 2) DEFAULT 0,
    
    -- Other Tax Information
    previous_employer_tax DECIMAL(15, 2) DEFAULT 0,
    other_income DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, tax_year),
    INDEX idx_tax_info_employee (employee_id),
    INDEX idx_tax_info_year (tax_year)
);

-- =====================================================
-- EMPLOYEE LOANS AND ADVANCES
-- =====================================================

-- Loan Types
CREATE TABLE IF NOT EXISTS loan_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(20) UNIQUE NOT NULL,
    loan_name VARCHAR(100) NOT NULL,
    
    -- Loan Configuration
    max_amount DECIMAL(15, 2),
    max_months INTEGER,
    interest_rate DECIMAL(8, 4) DEFAULT 0, -- Annual percentage rate
    requires_guarantor BOOLEAN DEFAULT FALSE,
    requires_collateral BOOLEAN DEFAULT FALSE,
    
    -- Eligibility
    min_employment_months INTEGER DEFAULT 6,
    min_salary DECIMAL(15, 2),
    max_salary_percentage DECIMAL(5, 2) DEFAULT 50, -- Max % of salary for repayment
    
    -- Approval Requirements
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_levels INTEGER DEFAULT 1,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Loans
CREATE TABLE IF NOT EXISTS employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    loan_type_id UUID NOT NULL REFERENCES loan_types(id),
    
    -- Loan Details
    loan_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(8, 4),
    loan_term_months INTEGER NOT NULL,
    monthly_repayment DECIMAL(15, 2) NOT NULL,
    
    -- Dates
    application_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    disbursement_date DATE,
    first_repayment_date DATE,
    
    -- Amounts
    total_amount_payable DECIMAL(15, 2),
    amount_disbursed DECIMAL(15, 2) DEFAULT 0,
    amount_repaid DECIMAL(15, 2) DEFAULT 0,
    outstanding_balance DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED'
    
    -- Guarantor Information
    guarantor_employee_id UUID REFERENCES employees(id),
    guarantor_signature BYTEA,
    guarantor_date DATE,
    
    -- Approval Information
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    
    -- Notes
    purpose TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_loan_employee (employee_id),
    INDEX idx_loan_status (status),
    INDEX idx_loan_dates (disbursement_date, first_repayment_date)
);

-- Loan Repayments
CREATE TABLE IF NOT EXISTS loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_loan_id UUID NOT NULL REFERENCES employee_loans(id),
    payroll_period_id UUID REFERENCES payroll_periods(id),
    
    -- Repayment Details
    repayment_date DATE NOT NULL,
    scheduled_amount DECIMAL(15, 2) NOT NULL,
    actual_amount DECIMAL(15, 2) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    
    -- Balance Information
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    
    -- Payment Method
    payment_method VARCHAR(20) DEFAULT 'PAYROLL_DEDUCTION', -- 'PAYROLL_DEDUCTION', 'CASH', 'BANK_TRANSFER'
    
    -- Status
    status VARCHAR(20) DEFAULT 'COMPLETED', -- 'SCHEDULED', 'COMPLETED', 'PARTIAL', 'MISSED'
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_repayment_loan (employee_loan_id),
    INDEX idx_repayment_date (repayment_date),
    INDEX idx_repayment_payroll (payroll_period_id)
);

-- =====================================================
-- PERFORMANCE MANAGEMENT
-- =====================================================

-- Performance Criteria
CREATE TABLE IF NOT EXISTS performance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criteria_code VARCHAR(50) UNIQUE NOT NULL,
    criteria_name VARCHAR(200) NOT NULL,
    criteria_category VARCHAR(100), -- 'TECHNICAL', 'BEHAVIORAL', 'LEADERSHIP', 'CUSTOMER_SERVICE'
    description TEXT,
    
    -- Scoring
    max_score INTEGER DEFAULT 5,
    weight_percentage DECIMAL(5, 2) DEFAULT 20.0,
    
    -- Applicability
    applicable_positions JSONB, -- Array of position IDs
    applicable_departments JSONB, -- Array of department IDs
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Reviews/Appraisals
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    reviewer_id UUID NOT NULL REFERENCES employees(id),
    
    -- Review Period
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type VARCHAR(50) DEFAULT 'ANNUAL', -- 'ANNUAL', 'MID_YEAR', 'PROBATION', 'PROJECT'
    
    -- Scores and Ratings
    overall_score DECIMAL(5, 2),
    overall_rating VARCHAR(20), -- 'OUTSTANDING', 'EXCEEDS', 'MEETS', 'BELOW', 'POOR'
    
    -- Review Content
    achievements TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,
    goals_for_next_period TEXT,
    
    -- Employee Feedback
    employee_comments TEXT,
    employee_signature BYTEA,
    employee_signed_date DATE,
    
    -- Manager Feedback
    manager_comments TEXT,
    manager_recommendations TEXT,
    promotion_recommendation BOOLEAN DEFAULT FALSE,
    salary_increase_recommendation DECIMAL(5, 2), -- Percentage
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'EMPLOYEE_REVIEW', 'MANAGER_REVIEW', 'FINALIZED'
    
    -- Important Dates
    due_date DATE,
    completed_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_performance_employee (employee_id),
    INDEX idx_performance_reviewer (reviewer_id),
    INDEX idx_performance_period (review_period_start, review_period_end),
    INDEX idx_performance_status (status)
);

-- Performance Review Details (Individual criteria scores)
CREATE TABLE IF NOT EXISTS performance_review_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID NOT NULL REFERENCES performance_reviews(id),
    performance_criteria_id UUID NOT NULL REFERENCES performance_criteria(id),
    
    -- Scoring
    score DECIMAL(5, 2) NOT NULL,
    max_score INTEGER NOT NULL,
    weight_percentage DECIMAL(5, 2),
    weighted_score DECIMAL(8, 4),
    
    -- Comments
    manager_comments TEXT,
    employee_comments TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRAINING AND DEVELOPMENT
-- =====================================================

-- Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(50) UNIQUE NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    program_category VARCHAR(100), -- 'TECHNICAL', 'SOFT_SKILLS', 'SAFETY', 'COMPLIANCE'
    
    -- Program Details
    description TEXT,
    objectives JSONB,
    duration_hours INTEGER,
    max_participants INTEGER,
    
    -- Provider Information
    training_provider VARCHAR(200),
    trainer_name VARCHAR(200),
    training_method VARCHAR(50), -- 'CLASSROOM', 'ONLINE', 'ON_THE_JOB', 'EXTERNAL'
    
    -- Costs
    cost_per_participant DECIMAL(15, 2),
    total_budget DECIMAL(15, 2),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    
    -- Requirements
    prerequisites TEXT,
    target_audience JSONB,
    certification_provided BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Training Sessions (Scheduled instances)
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number VARCHAR(50) UNIQUE NOT NULL,
    training_program_id UUID NOT NULL REFERENCES training_programs(id),
    
    -- Session Details
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    max_participants INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    
    -- Results
    participants_registered INTEGER DEFAULT 0,
    participants_attended INTEGER DEFAULT 0,
    completion_rate DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_training_session_program (training_program_id),
    INDEX idx_training_session_date (session_date),
    INDEX idx_training_session_status (status)
);

-- Employee Training Records
CREATE TABLE IF NOT EXISTS employee_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    training_session_id UUID NOT NULL REFERENCES training_sessions(id),
    
    -- Registration
    registration_date DATE DEFAULT CURRENT_DATE,
    registration_status VARCHAR(20) DEFAULT 'REGISTERED', -- 'REGISTERED', 'ATTENDED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'
    
    -- Completion
    completion_date DATE,
    completion_status VARCHAR(20), -- 'COMPLETED', 'PARTIAL', 'FAILED'
    score DECIMAL(5, 2),
    grade VARCHAR(10),
    
    -- Certification
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(100),
    certificate_expiry_date DATE,
    
    -- Feedback
    employee_feedback TEXT,
    trainer_feedback TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, training_session_id),
    INDEX idx_training_employee (employee_id),
    INDEX idx_training_session (training_session_id),
    INDEX idx_training_completion (completion_date)
);

-- =====================================================
-- DISCIPLINARY ACTIONS
-- =====================================================

-- Disciplinary Actions
CREATE TABLE IF NOT EXISTS disciplinary_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Incident Details
    incident_date DATE NOT NULL,
    incident_description TEXT NOT NULL,
    incident_category VARCHAR(100), -- 'MISCONDUCT', 'POOR_PERFORMANCE', 'ATTENDANCE', 'SAFETY_VIOLATION'
    severity VARCHAR(20) NOT NULL, -- 'MINOR', 'MAJOR', 'SERIOUS', 'GROSS'
    
    -- Investigation
    investigated_by UUID REFERENCES employees(id),
    investigation_date DATE,
    investigation_findings TEXT,
    
    -- Action Taken
    action_type VARCHAR(50) NOT NULL, -- 'VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'TERMINATION'
    action_description TEXT,
    effective_date DATE,
    duration_days INTEGER, -- For suspensions
    
    -- Employee Response
    employee_statement TEXT,
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED', 'APPEALED', 'CLOSED'
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES employees(id),
    
    INDEX idx_disciplinary_employee (employee_id),
    INDEX idx_disciplinary_date (incident_date),
    INDEX idx_disciplinary_status (status),
    INDEX idx_disciplinary_severity (severity)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default employee categories
INSERT INTO employee_categories (category_code, category_name, description, benefits_package, leave_entitlements) VALUES
('PERMANENT', 'Permanent Staff', 'Full-time permanent employees', 
 '{"health_insurance": true, "pension": true, "bonus_eligible": true}',
 '{"annual_leave": 21, "sick_leave": 10, "maternity_leave": 90, "paternity_leave": 7}'),
('CONTRACT', 'Contract Staff', 'Fixed-term contract employees',
 '{"health_insurance": true, "pension": false, "bonus_eligible": false}',
 '{"annual_leave": 15, "sick_leave": 7, "maternity_leave": 90, "paternity_leave": 7}'),
('CASUAL', 'Casual Workers', 'Part-time and casual workers',
 '{"health_insurance": false, "pension": false, "bonus_eligible": false}',
 '{"annual_leave": 0, "sick_leave": 3, "maternity_leave": 0, "paternity_leave": 0}'),
('INTERNSHIP', 'Interns', 'Students and graduate interns',
 '{"health_insurance": false, "pension": false, "bonus_eligible": false}',
 '{"annual_leave": 5, "sick_leave": 3, "maternity_leave": 0, "paternity_leave": 0}')
ON CONFLICT (category_code) DO NOTHING;

-- Insert default departments
INSERT INTO departments (department_code, department_name, description) VALUES
('HR', 'Human Resources', 'Human resources and administration'),
('FIN', 'Finance', 'Finance and accounting'),
('OPS', 'Operations', 'Operations and logistics'),
('IT', 'Information Technology', 'IT and systems'),
('SALES', 'Sales', 'Sales and marketing'),
('MGMT', 'Management', 'Executive and management')
ON CONFLICT (department_code) DO NOTHING;

-- Insert default work schedules
INSERT INTO work_schedules (schedule_name, schedule_type, working_days, daily_hours, start_time, end_time) VALUES
('Standard Office Hours', 'FIXED', '["MON", "TUE", "WED", "THU", "FRI"]', 8.0, '08:00', '17:00'),
('Station Shift A', 'SHIFT', '["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]', 8.0, '06:00', '14:00'),
('Station Shift B', 'SHIFT', '["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]', 8.0, '14:00', '22:00'),
('Station Shift C', 'SHIFT', '["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]', 8.0, '22:00', '06:00')
ON CONFLICT (schedule_name) DO NOTHING;

-- Insert Ghana statutory leave types
INSERT INTO leave_types (leave_code, leave_name, is_statutory, is_paid, max_days_per_year, notice_period_days, accrual_method, accrual_rate) VALUES
('ANNUAL', 'Annual Leave', true, true, 21, 14, 'ANNUAL', 21),
('SICK', 'Sick Leave', true, true, 10, 0, 'ANNUAL', 10),
('MATERNITY', 'Maternity Leave', true, true, 90, 30, 'NONE', 0),
('PATERNITY', 'Paternity Leave', true, true, 7, 7, 'NONE', 0),
('COMPASSIONATE', 'Compassionate Leave', false, true, 5, 1, 'NONE', 0),
('EMERGENCY', 'Emergency Leave', false, true, 3, 0, 'NONE', 0),
('STUDY', 'Study Leave', false, false, 30, 60, 'NONE', 0)
ON CONFLICT (leave_code) DO NOTHING;

-- Insert Ghana payroll components
INSERT INTO payroll_components (component_code, component_name, component_type, component_category, is_taxable, is_ssnit_deductible, is_statutory) VALUES
-- Earnings
('BASIC_SALARY', 'Basic Salary', 'EARNING', 'BASIC_PAY', true, true, false),
('TRANSPORT_ALLOWANCE', 'Transport Allowance', 'EARNING', 'ALLOWANCE', false, false, false),
('HOUSING_ALLOWANCE', 'Housing Allowance', 'EARNING', 'ALLOWANCE', true, true, false),
('OVERTIME', 'Overtime Pay', 'EARNING', 'OVERTIME', true, true, false),
('BONUS', 'Bonus', 'EARNING', 'BONUS', true, true, false),

-- Deductions
('PAYE_TAX', 'PAYE Tax', 'DEDUCTION', 'TAX', false, false, true),
('SSNIT_EMPLOYEE', 'SSNIT Employee (5.5%)', 'DEDUCTION', 'SOCIAL_SECURITY', false, false, true),
('TIER3_PENSION', 'Tier 3 Pension (5%)', 'DEDUCTION', 'PENSION', false, false, true),
('LOAN_REPAYMENT', 'Loan Repayment', 'DEDUCTION', 'LOAN', false, false, false),

-- Employer Contributions
('SSNIT_EMPLOYER', 'SSNIT Employer (13%)', 'EMPLOYER_CONTRIBUTION', 'SOCIAL_SECURITY', false, false, true)
ON CONFLICT (component_code) DO NOTHING;

-- Insert current Ghana tax brackets (2025)
INSERT INTO ghana_tax_brackets (tax_year, bracket_number, min_amount, max_amount, tax_rate, effective_from) VALUES
(2025, 1, 0, 4800, 0.00, '2025-01-01'),          -- First GHS 4,800 - 0%
(2025, 2, 4801, 6000, 0.05, '2025-01-01'),       -- Next GHS 1,200 - 5%
(2025, 3, 6001, 36000, 0.10, '2025-01-01'),      -- Next GHS 30,000 - 10%
(2025, 4, 36001, 120000, 0.175, '2025-01-01'),   -- Next GHS 84,000 - 17.5%
(2025, 5, 120001, 480000, 0.25, '2025-01-01'),   -- Next GHS 360,000 - 25%
(2025, 6, 480001, null, 0.30, '2025-01-01')      -- Above GHS 480,000 - 30%
ON CONFLICT (tax_year, bracket_number) DO NOTHING;

-- Insert default loan types
INSERT INTO loan_types (loan_code, loan_name, max_amount, max_months, interest_rate, min_employment_months) VALUES
('SALARY_ADVANCE', 'Salary Advance', 50000, 6, 0, 3),
('EMERGENCY_LOAN', 'Emergency Loan', 20000, 12, 5, 6),
('EDUCATION_LOAN', 'Education Loan', 100000, 36, 8, 12),
('HOUSING_LOAN', 'Housing Loan', 500000, 120, 12, 24)
ON CONFLICT (loan_code) DO NOTHING;

-- Create additional FK constraints after tables are created
ALTER TABLE departments ADD CONSTRAINT fk_dept_head 
    FOREIGN KEY (department_head_id) REFERENCES employees(id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'HR and Payroll Management System schema created successfully with Ghana labor law compliance!';
END $$;