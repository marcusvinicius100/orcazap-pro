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

  // Controle da Tela de Entrada (Landing Page / Welcome Screen)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

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

  // 1. TELA DE ENTRADA (LANDING PAGE / WELCOME SCREEN)
  if (showWelcomeScreen) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Glow de fundo decorativo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col items-center text-center space-y-5 backdrop-blur-md">
          
          {/* Logotipo Estilizado */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-3xl">⚡</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5 justify-center">
              <span>Orça<span className="text-emerald-400">Zap</span></span>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                PRO
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm">
              Sistema PWA ágil para prestadores de serviços: gere propostas comerciais elegantes em folha padrão A4, exporte em PDF e envie orçamentos profissionais direto pelo WhatsApp com um clique!
            </p>
          </div>

          {/* QR Code Centralizado via api.qrserver.com */}
          <div className="flex flex-col items-center space-y-2 pt-1">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-400/40">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Forcazap-pro.vercel.app&bgcolor=ffffff&color=0f172a&margin=2&format=png"
                alt="QR Code Oficial — OrçaZap Pro"
                width={180}
                height={180}
                className="rounded-lg block"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Escaneie com a câmera do seu celular
            </p>
          </div>

          {/* Instruções de Instalação Inteligentes */}
          <div className="grid grid-cols-2 gap-3 w-full text-left">
            {/* Android */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                <span>🤖</span>
                <span>Android</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Escaneie o QR Code e clique em <strong className="text-white">"Instalar App"</strong>.
              </p>
            </div>

            {/* iPhone */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-sky-400">
                <span>🍏</span>
                <span>iPhone</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Abra no Safari, toque em <strong className="text-white">Compartilhar (↑)</strong> e escolha <strong className="text-white">"Adicionar à Tela de Início"</strong>.
              </p>
            </div>
          </div>

          {/* Botão de Acesso Brilhante */}
          <button
            type="button"
            onClick={() => setShowWelcomeScreen(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Acessar o Sistema 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 print:bg-white print:text-black print:min-h-0">
      
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
      <div className="no-print lg:hidden bg-slate-900 border-b border-slate-800 sticky top-16 z-30 px-4 py-2 print:hidden">
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
      <div className="no-print print:hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <ActionButtons
          budget={currentBudget}
          onSave={handleSaveCurrentBudget}
          onOpenSEFAZ={() => setIsSEFAZOpen(true)}
        />
      </div>

      {/* CORPO PRINCIPAL: Layout em Duas Colunas no Desktop / Abas no Mobile */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 print:p-0 print:m-0 print:max-w-none print:w-full print:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full">
          
          {/* COLUNA ESQUERDA: Painel de Edição (Totalmente oculto na impressão) */}
          <div
            className={`no-print print:hidden lg:col-span-6 xl:col-span-5 ${
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

          {/* COLUNA DIREITA: Folha Comercial A4 (Preview em Tempo Real / 100% visível na Impressão) */}
          <div
            className={`lg:col-span-6 xl:col-span-7 flex flex-col items-center print:block print:w-full print:p-0 print:m-0 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="no-print print:hidden w-full flex items-center justify-between pb-3 px-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Visualização em Tempo Real (Folha Padrão A4)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Pronto para Impressão & WhatsApp
              </span>
            </div>

            {/* Container do Documento Comercial A4 */}
            <div className="w-full flex justify-center overflow-x-auto pb-8 print:p-0 print:m-0 print:w-full print:overflow-visible print:block">
              <CommercialPreviewA4 budget={currentBudget} />
            </div>
          </div>
        </div>
      </main>

      {/* MODAIS DO SISTEMA */}
      <div className="no-print print:hidden">
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
      </div>

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
