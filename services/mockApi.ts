
import { 
    UserProfile, 
    ExplanationRecord, 
    DocumentMetadata, 
    GlossaryTerm, 
    AIModelSettings, 
    AuditLogEntry, 
    PromptTemplate,
    UserNotification,
    AIUsageRecord,
    SubscriptionPlan,
    PaymentMethod,
    AgentTask,
    TokenBalance,
    TokenTransaction
} from '../types';

export const mockApiResponseDelay = 600;

// Simple internal mock store
let mockAuditLogChain: AuditLogEntry[] = [];
let lastHash = "0000000000000000000000000000000000000000000000000000000000000000";

const generateHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `sha256-${Math.abs(hash).toString(16).padStart(8, '0')}`;
};

export const logAuditEvent = async (
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>
): Promise<AuditLogEntry> => {
    const timestamp = new Date();
    const dataToHash = JSON.stringify({ userId, timestamp, action, resourceType, resourceId, details, previousHash: lastHash });
    const currentHash = generateHash(dataToHash);

    const newLog: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        timestamp,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: '127.0.0.1',
        previousHash: lastHash,
        hash: currentHash,
    };
    mockAuditLogChain.push(newLog);
    lastHash = currentHash;
    return newLog;
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'user-123',
                username: 'JaneDoe',
                email: 'jane.doe@lexicon.ai',
                subscriptionTier: 'pro',
                roles: ['user', 'admin'],
                preferences: {
                    defaultAIModel: 'gemini-3-flash-preview',
                    defaultExplanationStyle: 'plain_english',
                    targetAudienceLevel: 'college',
                    enableAutoSave: true,
                    darkMode: true,
                    notificationSettings: {
                        emailNotifications: true,
                        inAppNotifications: true,
                        documentProcessingCompletion: true,
                        sharedContentUpdates: false,
                        billingAlerts: true,
                        agentTaskUpdates: true,
                    },
                    preferredLanguage: 'en',
                    fontSize: 'medium',
                    lineHeight: 'comfortable',
                    showTips: true,
                },
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                lastLogin: new Date(),
                apiKeyAccess: true,
                storageLimitGB: 50,
                documentsUploaded: 15,
                explanationsGenerated: 230,
                teamId: 'team-alpha-001',
            });
        }, mockApiResponseDelay);
    });
};

export const fetchExplanationHistory = async (userId: string): Promise<ExplanationRecord[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockHistory: ExplanationRecord[] = Array.from({ length: 8 }).map((_, i) => ({
                id: `exp-${userId}-${i}`,
                userId: userId,
                originalContent: `Complex content clause ${i} involving liability and risk.`,
                explainedContent: `Simple explanation for content ${i}: you are protected from losses.`,
                modelUsed: 'gemini-3-flash-preview',
                explanationStyle: 'plain_english',
                audienceLevel: 'college',
                timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
                sessionId: `session-${Math.floor(i / 3)}`,
                isFavorite: i % 4 === 0,
                estimatedCost: 0.0025,
                tokensUsed: 1200
            }));
            resolve(mockHistory);
        }, mockApiResponseDelay);
    });
};

export const fetchUserDocuments = async (userId: string): Promise<DocumentMetadata[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Array.from({ length: 4 }).map((_, i) => ({
                id: `doc-${userId}-${i}`,
                userId: userId,
                fileName: `Contract_Q${i + 1}_2024.pdf`,
                fileSizeKB: 2048 + i * 512,
                uploadDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                status: i === 0 ? 'processing' : 'processed',
                documentType: 'pdf',
                accessPermissions: 'private',
                tags: ['legal', 'Q4'],
                lastAccessed: new Date(),
                agentAnalysisStatus: i === 1 ? 'completed' : 'pending',
            })));
        }, mockApiResponseDelay);
    });
};

export const fetchTokenBalance = async (userId: string): Promise<TokenBalance> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ userId, balance: 1250.75, currency: 'LC_TOKEN', lastUpdated: new Date() });
        }, 300);
    });
};
