import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { CommercialPreviewA4 } from './components/CommercialPreviewA4';
import { ActionButtons } from './components/ActionButtons';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { SEFAZModal } from './components/SEFAZModal';
import { Budget, BudgetStatus, ProviderProfile } from './types';
import { 
  loadProviderProfile, 
  saveProviderProfile, 
  loadBudgetsHistory, 
  saveOrUpdateBudget, 
  deleteBudget, 
  createNewBudgetTemplate 
} from './utils/storage';
import { generateBudgetNumber } from './utils/formatters';
import { openWhatsApp, enviarWhatsApp } from './utils/whatsapp';
import { Edit3, Eye, Sparkles } from 'lucide-react';

export { openWhatsApp, enviarWhatsApp };

export function App() {
  // Estados principais
  const [provider, setProvider] = useState<ProviderProfile>(loadProviderProfile);
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgetsHistory);
  
  // Orçamento ativo em edição
  const [currentBudget, setCurrentBudget] = useState<Budget>(() => {
    const history = loadBudgetsHistory();
    if (history.length > 0) {
      return history[0];
    }
    return createNewBudgetTemplate(loadProviderProfile());
  });

  // Controle de abas no Mobile ('editor' | 'preview')
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Controle de Modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSEFAZOpen, setIsSEFAZOpen] = useState(false);

  // Controle do PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Modais de acessibilidade mobile
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Instalar PWA nativo — apenas dispara o prompt do navegador (Android/Desktop Chrome)
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Salvar perfil do prestador
  const handleSaveProvider = (updated: ProviderProfile) => {
    setProvider(updated);
    saveProviderProfile(updated);
    // Atualiza também os dados do prestador no orçamento atual
    setCurrentBudget((prev) => ({
      ...prev,
      provider: updated,
      terms: {
        ...prev.terms,
        pixKey: updated.pixKey || prev.terms.pixKey,
        pixReceiverName: updated.pixReceiverName || prev.terms.pixReceiverName,
      },
    }));
  };

  // Salvar orçamento atual no histórico
  const handleSaveCurrentBudget = () => {
    const updatedList = saveOrUpdateBudget(currentBudget);
    setBudgets(updatedList);
  };

  // Criar novo orçamento em branco
  const handleNewBudget = () => {
    const newBudget = createNewBudgetTemplate(provider);
    setCurrentBudget(newBudget);
    setMobileTab('editor');
  };

  // Duplicar orçamento
  const handleDuplicateBudget = (b: Budget) => {
    const duplicated: Budget = {
      ...b,
      id: 'budget-' + Date.now(),
      number: generateBudgetNumber(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      fiscalKey: undefined,
      fiscalProtocol: undefined,
      invoicedAt: undefined,
    };
    const updated = saveOrUpdateBudget(duplicated);
    setBudgets(updated);
    setCurrentBudget(duplicated);
    setIsHistoryOpen(false);
    setMobileTab('editor');
  };

  // Excluir orçamento
  const handleDeleteBudget = (id: string) => {
    const updated = deleteBudget(id);
    setBudgets(updated);
    if (currentBudget.id === id) {
      if (updated.length > 0) {
        setCurrentBudget(updated[0]);
      } else {
        const fresh = createNewBudgetTemplate(provider);
        setCurrentBudget(fresh);
      }
    }
  };

  // Mudar status do orçamento
  const handleStatusChange = (status: BudgetStatus) => {
    const updated = { ...currentBudget, status };
    setCurrentBudget(updated);
    saveOrUpdateBudget(updated);
    setBudgets(loadBudgetsHistory());
  };

  // Callback de sucesso da simulação SEFAZ
  const handleInvoiceSuccess = (fiscalKey: string, protocol: string) => {
    const updated: Budget = {
      ...currentBudget,
      status: 'invoiced',
      fiscalKey,
      fiscalProtocol: protocol,
      invoicedAt: new Date().toISOString(),
    };
    setCurrentBudget(updated);
    saveOrUpdateBudget(updated);
    setBudgets(loadBudgetsHistory());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Header Superior */}
      <Header
        currentBudget={currentBudget}
        onNewBudget={handleNewBudget}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStatusChange={handleStatusChange}
        historyCount={budgets.length}
        installPrompt={deferredPrompt}
        onInstallApp={handleInstallApp}
        onOpenQRModal={() => setShowQRModal(true)}
      />

      {/* Navegação por Abas para Telas Mobile (no-print) */}
      <div className="no-print lg:hidden bg-slate-900 border-b border-slate-800 sticky top-16 z-30 px-4 py-2">
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'editor'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>1. Painel de Edição</span>
          </button>

          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Folha A4 (Preview)</span>
          </button>
        </div>
      </div>

      {/* Barra de Ações Rápidas (WhatsApp, Salvar, PDF, SEFAZ) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <ActionButtons
          budget={currentBudget}
          onSave={handleSaveCurrentBudget}
          onOpenSEFAZ={() => setIsSEFAZOpen(true)}
        />
      </div>

      {/* CORPO PRINCIPAL: Layout em Duas Colunas no Desktop / Abas no Mobile */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: Painel de Edição */}
          <div
            className={`lg:col-span-6 xl:col-span-5 ${
              mobileTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <EditorPanel
              budget={currentBudget}
              onChange={(updated) => {
                setCurrentBudget(updated);
                saveOrUpdateBudget(updated);
              }}
              onProviderChange={handleSaveProvider}
              onOpenQRModal={() => setShowQRModal(true)}
            />
          </div>

          {/* COLUNA DIREITA: Folha Comercial A4 (Preview em Tempo Real) */}
          <div
            className={`lg:col-span-6 xl:col-span-7 flex flex-col items-center ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="no-print w-full flex items-center justify-between pb-3 px-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Visualização em Tempo Real (Folha Padrão A4)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Pronto para Impressão & WhatsApp
              </span>
            </div>

            {/* Container do Documento Comercial A4 */}
            <div className="w-full flex justify-center overflow-x-auto pb-8">
              <CommercialPreviewA4 budget={currentBudget} />
            </div>
          </div>
        </div>
      </main>

      {/* MODAIS DO SISTEMA */}
      <ProviderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        onSave={handleSaveProvider}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        budgets={budgets}
        onSelectBudget={(b) => {
          setCurrentBudget(b);
          setMobileTab('editor');
        }}
        onDeleteBudget={handleDeleteBudget}
        onDuplicateBudget={handleDuplicateBudget}
      />

      <SEFAZModal
        isOpen={isSEFAZOpen}
        onClose={() => setIsSEFAZOpen(false)}
        budget={currentBudget}
        onInvoiceSuccess={handleInvoiceSuccess}
      />

      {/* MODAL: Instruções de Instalação no iOS (iPhone/iPad) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="text-5xl">📱</div>
              <h2 className="text-lg font-bold text-white">Instalação no iPhone / iPad</h2>
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-left space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">1.</span> Abra este link no{' '}
                  <strong className="text-white">Safari</strong> (não no Chrome).
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">2.</span> Toque no ícone de{' '}
                  <strong className="text-emerald-400">Compartilhar</strong> (↑ seta para cima) na barra inferior.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">3.</span> Role para baixo e selecione{' '}
                  <strong className="text-emerald-400">"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
              <div className="text-4xl">⬆️</div>
              <p className="text-xs text-slate-500">
                O app será instalado sem precisar da App Store e funcionará offline.
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                Entendi ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR Code — Abrir no Celular */}
      {showQRModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQRModal(false); }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                📱 Abrir no Celular
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {/* QR Code gerado via API pública */}
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white rounded-2xl shadow-lg border-4 border-emerald-400/40">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=https%3A%2F%2Forcazap-pro.vercel.app&bgcolor=ffffff&color=0f172a&margin=2&format=png"
                  alt="QR Code — OrçaZap Pro"
                  width={192}
                  height={192}
                  className="rounded-lg"
                />
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mb-5 flex items-center justify-center gap-1.5">
              <span>🔍</span> Aponte a câmera do celular para o QR Code acima
            </p>

            {/* Instruções em Duas Colunas */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Android */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-xs font-bold text-emerald-400 mb-1.5">Android</p>
                <ol className="text-[11px] text-slate-300 space-y-1 text-left list-none">
                  <li>① Abra o link</li>
                  <li>② Menu Chrome (⋮)</li>
                  <li>③ "Adicionar à tela inicial"</li>
                </ol>
              </div>
              {/* iPhone */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
                <div className="text-3xl mb-2">🍎</div>
                <p className="text-xs font-bold text-sky-400 mb-1.5">iPhone / iPad</p>
                <ol className="text-[11px] text-slate-300 space-y-1 text-left list-none">
                  <li>① Abra no Safari</li>
                  <li>② Toque em Compartilhar ↑</li>
                  <li>③ "Adicionar à Tela de Início"</li>
                </ol>
              </div>
            </div>

            {/* Link copiável */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-400 font-mono truncate">
                https://orcazap-pro.vercel.app
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://orcazap-pro.vercel.app');
                }}
                className="text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                title="Copiar link"
              >
                📋 Copiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
