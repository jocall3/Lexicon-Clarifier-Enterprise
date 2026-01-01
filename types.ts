
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    roles: string[];
    preferences: UserPreferences;
    createdAt: Date;
    lastLogin: Date;
    apiKeyAccess: boolean;
    storageLimitGB: number;
    documentsUploaded: number;
    explanationsGenerated: number;
    teamId?: string;
}

export interface UserPreferences {
    defaultAIModel: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
    defaultExplanationStyle: 'plain_english' | 'formal' | 'academic' | 'technical';
    targetAudienceLevel: 'high_school' | 'college' | 'expert';
    enableAutoSave: boolean;
    darkMode: boolean;
    notificationSettings: NotificationSettings;
    preferredLanguage: string;
    fontSize: 'small' | 'medium' | 'large';
    lineHeight: 'compact' | 'comfortable';
    showTips: boolean;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    documentProcessingCompletion: boolean;
    sharedContentUpdates: boolean;
    billingAlerts: boolean;
    agentTaskUpdates: boolean;
}

export interface DocumentMetadata {
    id: string;
    userId: string;
    fileName: string;
    fileSizeKB: number;
    uploadDate: Date;
    status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'analyzed_by_agent';
    documentType: 'pdf' | 'docx' | 'txt' | 'json' | 'markdown';
    accessPermissions: 'private' | 'shared' | 'team';
    tags: string[];
    summary?: string;
    lastAccessed: Date;
    pageCount?: number;
    agentAnalysisStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
    agentAnalysisReportId?: string;
}

export interface ExplanationRecord {
    id: string;
    userId: string;
    originalContent: string;
    explainedContent: string;
    modelUsed: string;
    explanationStyle: 'plain_english' | 'formal' | 'academic' | 'technical';
    audienceLevel: 'high_school' | 'college' | 'expert';
    timestamp: Date;
    documentId?: string;
    sessionId: string;
    feedback?: ExplanationFeedback;
    userNotes?: string;
    isFavorite: boolean;
    sourceLanguage?: string;
    targetLanguage?: string;
    linkedTerms?: LinkedTerm[];
    estimatedCost?: number;
    tokensUsed?: number;
}

export interface ExplanationFeedback {
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string;
    improvementsSuggested: string[];
    isHelpful: boolean;
}

export interface LinkedTerm {
    term: string;
    definition: string;
    context: string;
    sourceUrl?: string;
}

export interface GlossaryTerm {
    id: string;
    userId: string;
    term: string;
    definition: string;
    synonyms?: string[];
    antonyms?: string[];
    examples?: string[];
    source?: string;
    lastUpdated: Date;
    isPublic: boolean;
    tags: string[];
}

export interface AgentTask {
    id: string;
    agentId: string;
    orchestratorId: string;
    taskType: 'document_analysis' | 'glossary_suggestion' | 'anomaly_detection' | 'reconciliation_check' | 'real_time_settlement_monitor';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    targetEntityId: string;
    initiatedBy: 'user' | 'system' | 'agent';
    parameters: Record<string, any>;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    results?: Record<string, any>;
    error?: string;
    auditLogId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TokenBalance {
    userId: string;
    balance: number;
    currency: string;
    lastUpdated: Date;
}

export interface TokenTransaction {
    id: string;
    userId: string;
    fromAddress: string;
    toAddress: string;
    amount: number;
    currency: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed' | 'reverted';
    type: 'mint' | 'burn' | 'transfer' | 'payment' | 'reward' | 'fee_collection';
    referenceId?: string;
    rail: 'rail_fast' | 'rail_batch';
    signature: string;
    idempotencyKey: string;
    fee?: number;
    metadata?: Record<string, any>;
}

export interface AIModelSettings {
    modelId: string;
    name: string;
    provider: 'Google' | 'OpenAI' | 'Custom';
    description: string;
    capabilities: string[];
    costPerToken: number;
    isActive: boolean;
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    inputTokenCostPerMillion?: number;
    outputTokenCostPerMillion?: number;
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    timestamp: Date;
    action: string;
    resourceType: string;
    resourceId: string;
    details: Record<string, any>;
    ipAddress: string;
    previousHash?: string;
    hash: string;
}

export interface PromptTemplate {
    id: string;
    userId: string;
    name: string;
    template: string;
    description: string;
    category: string;
    isPublic: boolean;
    lastModified: Date;
}

export interface UserNotification {
    id: string;
    userId: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionLink?: string;
    relatedEntityId?: string;
}

export interface AIUsageRecord {
    id: string;
    userId: string;
    timestamp: Date;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUSD: number;
    feature: 'explanation' | 'document_analysis' | 'summarization' | 'custom_prompt';
    relatedEntityId?: string;
}

export interface SubscriptionPlan {
    id: string;
    name: 'free' | 'pro' | 'enterprise';
    description: string;
    monthlyPriceUSD: number;
    features: string[];
    tokenLimitMonthly: number | null;
    documentStorageGB: number;
    apiKeyAccess: boolean;
    teamMembers: number | null;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    type: 'card' | 'bank_transfer' | 'crypto';
    last4Digits?: string;
    bankName?: string;
    cryptoAddressMasked?: string;
    isDefault: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

export type PromptParameters = Record<string, string | number | boolean>;
