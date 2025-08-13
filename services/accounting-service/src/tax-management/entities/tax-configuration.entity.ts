import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { TaxCalculation } from './tax-calculation.entity';
import { TaxReturn } from './tax-return.entity';

export enum TaxType {
  CORPORATE_INCOME_TAX = 'CORPORATE_INCOME_TAX',
  VALUE_ADDED_TAX = 'VAT',
  WITHHOLDING_TAX = 'WITHHOLDING_TAX',
  NATIONAL_HEALTH_INSURANCE_LEVY = 'NHIL',
  GHANA_EDUCATION_TRUST_FUND = 'GETF',
  COVID_HEALTH_RECOVERY_LEVY = 'CHRL',
  CAPITAL_GAINS_TAX = 'CAPITAL_GAINS_TAX',
  GIFT_TAX = 'GIFT_TAX',
  IMPORT_DUTY = 'IMPORT_DUTY',
  EXPORT_LEVY = 'EXPORT_LEVY',
  PETROLEUM_TAX = 'PETROLEUM_TAX',
  MINERAL_ROYALTY = 'MINERAL_ROYALTY',
  PROPERTY_TAX = 'PROPERTY_TAX'
}

export enum TaxFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ON_TRANSACTION = 'ON_TRANSACTION'
}

export enum TaxCalculationMethod {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  TIERED = 'TIERED',
  PROGRESSIVE = 'PROGRESSIVE',
  FORMULA_BASED = 'FORMULA_BASED'
}

@Entity('tax_configurations')
@Index(['tenantId', 'taxType'])
@Index(['tenantId', 'isActive'])
@Index(['effectiveDate'])
export class TaxConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'tax_code', length: 20, unique: true })
  taxCode: string;

  @Column({ name: 'tax_name', length: 255 })
  taxName: string;

  @Column({ 
    name: 'tax_type', 
    type: 'enum', 
    enum: TaxType 
  })
  taxType: TaxType;

  @Column({ name: 'tax_description', type: 'text', nullable: true })
  taxDescription: string;

  // Rate Configuration
  @Column({ name: 'tax_rate', type: 'decimal', precision: 10, scale: 6, default: 0 })
  taxRate: number; // Percentage or fixed amount

  @Column({ name: 'minimum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumAmount: number;

  @Column({ name: 'maximum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumAmount: number;

  @Column({ name: 'threshold_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  thresholdAmount: number; // Amount before tax applies

  @Column({ 
    name: 'calculation_method', 
    type: 'enum', 
    enum: TaxCalculationMethod,
    default: TaxCalculationMethod.PERCENTAGE
  })
  calculationMethod: TaxCalculationMethod;

  // Ghana-Specific Tax Rates
  @Column({ name: 'corporate_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 25.00 })
  corporateTaxRate: number; // Ghana CIT rate

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 12.50 })
  vatRate: number; // Ghana VAT

  @Column({ name: 'nhil_rate', type: 'decimal', precision: 5, scale: 2, default: 2.50 })
  nhilRate: number; // National Health Insurance Levy

  @Column({ name: 'getf_rate', type: 'decimal', precision: 5, scale: 2, default: 2.50 })
  getfRate: number; // Ghana Education Trust Fund

  @Column({ name: 'covid_levy_rate', type: 'decimal', precision: 5, scale: 2, default: 1.00 })
  covidLevyRate: number; // COVID Health Recovery Levy

  @Column({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  withholdingTaxRate: number;

  // Tiered Tax Structure (JSON)
  @Column({ name: 'tax_brackets', type: 'text', nullable: true })
  taxBrackets: string; // JSON array of tax brackets

  // Frequency and Timing
  @Column({ 
    name: 'filing_frequency', 
    type: 'enum', 
    enum: TaxFrequency,
    default: TaxFrequency.MONTHLY
  })
  filingFrequency: TaxFrequency;

  @Column({ 
    name: 'payment_frequency', 
    type: 'enum', 
    enum: TaxFrequency,
    default: TaxFrequency.MONTHLY
  })
  paymentFrequency: TaxFrequency;

  @Column({ name: 'due_day_of_month', default: 15 })
  dueDayOfMonth: number; // Day of month when tax is due

  @Column({ name: 'due_months_after_year_end', default: 4 })
  dueMonthsAfterYearEnd: number; // For annual taxes

  // Account Mappings
  @Column({ name: 'tax_payable_account', length: 20 })
  taxPayableAccount: string; // GL account for tax liability

  @Column({ name: 'tax_expense_account', length: 20 })
  taxExpenseAccount: string; // GL account for tax expense

  @Column({ name: 'prepayment_account', length: 20, nullable: true })
  prepaymentAccount: string; // For advance tax payments

  @Column({ name: 'penalty_account', length: 20, nullable: true })
  penaltyAccount: string; // For tax penalties

  @Column({ name: 'interest_account', length: 20, nullable: true })
  interestAccount: string; // For tax interest

  // Exemptions and Deductions
  @Column({ name: 'capital_allowances_rate', type: 'decimal', precision: 5, scale: 2, default: 20.00 })
  capitalAllowancesRate: number; // Ghana capital allowances

  @Column({ name: 'investment_allowance', type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  investmentAllowance: number;

  @Column({ name: 'loss_carryforward_years', default: 5 })
  lossCarryforwardYears: number;

  @Column({ name: 'exempt_income_types', type: 'text', nullable: true })
  exemptIncomeTypes: string; // JSON array

  @Column({ name: 'deductible_expenses', type: 'text', nullable: true })
  deductibleExpenses: string; // JSON array

  // Compliance and Regulatory
  @Column({ name: 'gra_tax_type_code', length: 20, nullable: true })
  graTaxTypeCode: string; // Ghana Revenue Authority code

  @Column({ name: 'regulatory_reference', length: 255, nullable: true })
  regulatoryReference: string; // Act/Law reference

  @Column({ name: 'compliance_requirements', type: 'text', nullable: true })
  complianceRequirements: string; // JSON array

  // Penalties and Interest
  @Column({ name: 'penalty_rate_late_filing', type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  penaltyRateLateFilingPercent: number;

  @Column({ name: 'penalty_rate_late_payment', type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  penaltyRateLatePaymentPercent: number;

  @Column({ name: 'interest_rate_outstanding', type: 'decimal', precision: 5, scale: 2, default: 25.00 })
  interestRateOutstandingPercent: number;

  @Column({ name: 'grace_period_days', default: 0 })
  gracePeriodDays: number;

  // Status and Validity
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'superseded_by', nullable: true })
  supersededBy: string; // ID of replacement configuration

  // Automation Settings
  @Column({ name: 'auto_calculate', default: true })
  autoCalculate: boolean;

  @Column({ name: 'auto_provision', default: true })
  autoProvision: boolean; // Auto-create tax provisions

  @Column({ name: 'auto_file', default: false })
  autoFile: boolean; // Auto-file returns

  @Column({ name: 'auto_payment', default: false })
  autoPayment: boolean; // Auto-pay taxes

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  // Integration Settings
  @Column({ name: 'gra_integration_enabled', default: false })
  graIntegrationEnabled: boolean;

  @Column({ name: 'gra_api_endpoint', length: 255, nullable: true })
  graApiEndpoint: string;

  @Column({ name: 'external_tax_code', length: 50, nullable: true })
  externalTaxCode: string;

  // Calculation Rules (JSON)
  @Column({ name: 'calculation_rules', type: 'text', nullable: true })
  calculationRules: string; // Complex calculation rules

  @Column({ name: 'rounding_rules', type: 'text', nullable: true })
  roundingRules: string; // Rounding specifications

  // Additional Ghana-Specific Fields
  @Column({ name: 'applies_to_oil_companies', default: true })
  appliesToOilCompanies: boolean;

  @Column({ name: 'petroleum_additional_rate', type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  petroleumAdditionalRate: number; // Additional petroleum tax

  @Column({ name: 'mining_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 35.00 })
  miningTaxRate: number;

  @Column({ name: 'free_zone_applicable', default: false })
  freeZoneApplicable: boolean;

  @Column({ name: 'free_zone_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  freeZoneRate: number;

  // Audit Fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TaxCalculation, calculation => calculation.taxConfiguration)
  calculations: TaxCalculation[];

  @OneToMany(() => TaxReturn, taxReturn => taxReturn.taxConfiguration)
  taxReturns: TaxReturn[];
}