
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, ExplanationRecord, DocumentMetadata, TokenBalance } from '../types';
import { fetchExplanationHistory, fetchUserDocuments, fetchTokenBalance, logAuditEvent } from '../services/mockApi';
import { geminiService } from '../services/geminiService';
import Card from './Card';
import { ICONS, AI_MODELS, EXPLANATION_STYLES, AUDIENCE_LEVELS } from '../constants';

interface LexiconClarifierViewProps {
    userProfile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
}

type Tab = 'clarifier' | 'history' | 'documents' | 'glossary' | 'prompts' | 'token_rails' | 'audit_log';

const LexiconClarifierView: React.FC<LexiconClarifierViewProps> = ({ userProfile, onUpdateProfile }) => {
    const [activeTab, setActiveTab] = useState<Tab>('clarifier');
    const [inputContent, setInputContent] = useState('Indemnifying party agrees to defend, indemnify, and hold harmless the indemnified party from and against any and all claims, demands, liabilities, costs, expenses, obligations, and causes of action arising out of or related to...');
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<ExplanationRecord[]>([]);
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [tokenData, setTokenData] = useState<TokenBalance | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            const [hist, docs, bal] = await Promise.all([
                fetchExplanationHistory(userProfile.id),
                fetchUserDocuments(userProfile.id),
                fetchTokenBalance(userProfile.id)
            ]);
            setHistory(hist);
            setDocuments(docs);
            setTokenData(bal);
        };
        loadInitialData();
    }, [userProfile.id]);

    const handleExplain = async () => {
        if (!inputContent.trim()) return;
        
        setIsLoading(true);
        setExplanation(null);
        
        try {
            const result = await geminiService.generateExplanation(inputContent, userProfile.preferences);
            setExplanation(result.text);
            
            // Log successful event
            await logAuditEvent(userProfile.id, 'explanation_generated', 'Explanation', 'new', { 
                tokens: result.tokens,
                model: userProfile.preferences.defaultAIModel
            });

            // Update local history optimistically
            const newRecord: ExplanationRecord = {
                id: `exp-${Date.now()}`,
                userId: userProfile.id,
                originalContent: inputContent,
                explainedContent: result.text,
                modelUsed: userProfile.preferences.defaultAIModel,
                explanationStyle: userProfile.preferences.defaultExplanationStyle,
                audienceLevel: userProfile.preferences.targetAudienceLevel,
                timestamp: new Date(),
                sessionId: 'current',
                isFavorite: false,
                tokensUsed: result.tokens,
                estimatedCost: 0.005
            };
            setHistory(prev => [newRecord, ...prev]);

        } catch (error) {
            console.error(error);
            alert("Failed to clarify. Check API configurations.");
        } finally {
            setIsLoading(false);
        }
    };

    const tabStyles = (tab: Tab) => 
        `px-6 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 
        ${activeTab === tab 
            ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
                <button onClick={() => setActiveTab('clarifier')} className={tabStyles('clarifier')}>Clarifier</button>
                <button onClick={() => setActiveTab('history')} className={tabStyles('history')}>History</button>
                <button onClick={() => setActiveTab('documents')} className={tabStyles('documents')}>Documents</button>
                <button onClick={() => setActiveTab('glossary')} className={tabStyles('glossary')}>Glossary</button>
                <button onClick={() => setActiveTab('token_rails')} className={tabStyles('token_rails')}>Token Rails</button>
                <button onClick={() => setActiveTab('audit_log')} className={tabStyles('audit_log')}>Audit Logs</button>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {activeTab === 'clarifier' && (
                        <>
                            <Card title="Input Interface" className="bg-slate-900/60">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={inputContent}
                                            onChange={(e) => setInputContent(e.target.value)}
                                            className="w-full h-48 bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="Paste complex text here..."
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                            {inputContent.length} chars
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex gap-2">
                                            <select 
                                                value={userProfile.preferences.defaultExplanationStyle}
                                                onChange={(e) => onUpdateProfile({...userProfile, preferences: {...userProfile.preferences, defaultExplanationStyle: e.target.value as any}})}
                                                className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
                                            >
                                                {EXPLANATION_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                            <select 
                                                value={userProfile.preferences.targetAudienceLevel}
                                                onChange={(e) => onUpdateProfile({...userProfile, preferences: {...userProfile.preferences, targetAudienceLevel: e.target.value as any}})}
                                                className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
                                            >
                                                {AUDIENCE_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                            </select>
                                        </div>
                                        
                                        <button 
                                            onClick={handleExplain}
                                            disabled={isLoading || !inputContent.trim()}
                                            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            )}
                                            {isLoading ? 'CLARIFYING...' : 'RUN CLARIFIER'}
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            <Card title="AI Clarification Output" className="bg-slate-900/60 min-h-[300px]">
                                {explanation ? (
                                    <div className="prose prose-invert max-w-none">
                                        <div className="p-6 bg-slate-950/40 border border-cyan-500/20 rounded-xl leading-relaxed text-slate-300">
                                            {explanation.split('\n').map((line, i) => (
                                                <p key={i} className="mb-4">{line}</p>
                                            ))}
                                            <div className="mt-8 flex justify-between items-center border-t border-slate-800 pt-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">{ICONS.COPY}</button>
                                                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">{ICONS.TRASH}</button>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">Generated via {userProfile.preferences.defaultAIModel}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-600">
                                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <p className="font-medium">Enter technical jargon above to begin analysis.</p>
                                        <p className="text-xs mt-1">Enterprise context preservation is currently active.</p>
                                    </div>
                                )}
                            </Card>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <Card title="Previous Explanations">
                            <div className="space-y-4">
                                {history.map(item => (
                                    <div key={item.id} className="p-4 bg-slate-800/40 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{item.timestamp.toLocaleDateString()}</span>
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">{item.explanationStyle}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 line-clamp-1 mb-1">{item.originalContent}</p>
                                        <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.explainedContent}"</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'documents' && (
                        <Card title="Document Warehouse">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {documents.map(doc => (
                                    <div key={doc.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-100">{doc.fileName}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{(doc.fileSizeKB / 1024).toFixed(2)} MB • {doc.status.toUpperCase()}</p>
                                            <div className="flex gap-2 mt-3">
                                                <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-tighter">View Source</button>
                                                <button className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-tighter">Discard</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center hover:border-slate-500 cursor-pointer transition-colors group">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-slate-700 transition-colors mb-2">
                                        {ICONS.PLUS}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Ingest New Document</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'token_rails' && (
                        <Card title="Real-Time Value Rails">
                            <div className="space-y-8">
                                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Available Credit (Rail Fast)</p>
                                        <p className="text-4xl font-bold text-emerald-400 mt-1">{tokenData?.balance.toLocaleString()} <span className="text-lg font-light opacity-50">LCT</span></p>
                                    </div>
                                    <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20">TOP UP CREDITS</button>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Recent Transactions</h4>
                                    <div className="space-y-2 font-mono">
                                        <div className="p-3 bg-slate-900/40 rounded flex justify-between text-xs items-center">
                                            <span className="text-emerald-500">+500.00 MINT</span>
                                            <span className="text-slate-600">0x88d...29a</span>
                                            <span className="text-slate-500">2024-11-20</span>
                                        </div>
                                        <div className="p-3 bg-slate-900/40 rounded flex justify-between text-xs items-center">
                                            <span className="text-red-500">-12.50 FEE</span>
                                            <span className="text-slate-600">system_fee_engine</span>
                                            <span className="text-slate-500">2024-11-19</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    <Card title="AI Intelligence Profile">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-mono text-slate-500 uppercase block mb-2">Primary Engine</label>
                                <select 
                                    value={userProfile.preferences.defaultAIModel}
                                    onChange={(e) => onUpdateProfile({...userProfile, preferences: {...userProfile.preferences, defaultAIModel: e.target.value as any}})}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200"
                                >
                                    {AI_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-950/50 border border-slate-700 rounded-lg text-center">
                                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Explanations</p>
                                    <p className="text-xl font-bold text-cyan-500">{userProfile.explanationsGenerated}</p>
                                </div>
                                <div className="p-3 bg-slate-950/50 border border-slate-700 rounded-lg text-center">
                                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Documents</p>
                                    <p className="text-xl font-bold text-blue-500">{userProfile.documentsUploaded}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <h5 className="text-xs font-bold text-blue-400 uppercase mb-2">Active Agents (2)</h5>
                                <ul className="text-xs space-y-2 text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span>Anomaly Detection Monitor</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        <span>Document Summary Queue</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <Card title="Ecosystem Notifications">
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-500/5 border-l-4 border-emerald-500 rounded flex gap-3 items-start">
                                <div className="mt-1 text-emerald-500">{ICONS.CHECK}</div>
                                <div>
                                    <p className="text-xs font-bold text-slate-200">System Ready</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Quantum-safe rails established.</p>
                                </div>
                            </div>
                            <div className="p-3 bg-cyan-500/5 border-l-4 border-cyan-500 rounded flex gap-3 items-start">
                                <div className="mt-1 text-cyan-500">ⓘ</div>
                                <div>
                                    <p className="text-xs font-bold text-slate-200">Usage Limit Warning</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">85% of monthly tokens consumed.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LexiconClarifierView;
