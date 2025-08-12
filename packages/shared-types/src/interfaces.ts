import { User } from './models';

// Service Interfaces
export interface IAuthService {
  login(username: string, password: string, tenantId?: string): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  validateToken(token: string): Promise<TokenPayload>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface IUserService {
  create(data: any): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: any): Promise<User>;
  delete(id: string): Promise<void>;
  list(filters?: any): Promise<User[]>;
}

// Repository Interfaces
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(conditions: any): Promise<T | null>;
  find(conditions?: any): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(conditions?: any): Promise<number>;
}

// Auth Interfaces
export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roles: string[];
  iat: number;
  exp: number;
}

// Request Interfaces
export interface AuthenticatedRequest {
  user: TokenPayload;
  tenantId: string;
  headers: Record<string, string>;
  ip?: string;
}

export interface AuditContext {
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource: string;
  timestamp: Date;
}

// Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  metadata?: ResponseMetadata;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  version: string;
}

// Event Interfaces
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  metadata: EventMetadata;
  occurredAt: Date;
}

export interface EventMetadata {
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
}

// Cache Interfaces
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

// Queue Interfaces
export interface IQueueService {
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, handler: MessageHandler): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
}

export type MessageHandler = (message: any) => Promise<void>;

// Email Interfaces
export interface IEmailService {
  send(options: EmailOptions): Promise<void>;
  sendBulk(recipients: string[], options: EmailOptions): Promise<void>;
}

export interface EmailOptions {
  to?: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: any;
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

// Storage Interfaces
export interface IStorageService {
  upload(file: FileUpload): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string, expiry?: number): Promise<string>;
  list(prefix?: string): Promise<string[]>;
}

export interface FileUpload {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size: number;
}

// Payment Interfaces
export interface IPaymentService {
  processPayment(options: PaymentOptions): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
  getStatus(transactionId: string): Promise<PaymentStatus>;
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  method: string;
  provider?: string;
  reference?: string;
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  reference?: string;
  status: string;
  message?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  message?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Interfaces
export interface INotificationService {
  send(notification: Notification): Promise<void>;
  sendBulk(notifications: Notification[]): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  getUnread(userId: string): Promise<Notification[]>;
}

export interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  recipientId?: string;
  recipientRole?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  readAt?: Date;
  createdAt?: Date;
}

// Analytics Interfaces
export interface IAnalyticsService {
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, traits: any): Promise<void>;
  page(userId: string, page: string, properties?: any): Promise<void>;
}

export interface AnalyticsEvent {
  userId?: string;
  event: string;
  properties?: any;
  timestamp?: Date;
}

// Logger Interface
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
}

// Validation Interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Configuration Interfaces
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: string;
  port: number;
  apiPrefix: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  database: DatabaseConfig;
  redis: RedisConfig;
}