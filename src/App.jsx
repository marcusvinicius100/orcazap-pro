import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { CommercialPreviewA4 } from './components/CommercialPreviewA4';
import { ActionButtons } from './components/ActionButtons';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { SEFAZModal } from './components/SEFAZModal';
import { 
  loadProviderProfile, 
  saveProviderProfile, 
  loadBudgetsHistory, 
  saveOrUpdateBudget, 
  deleteBudget, 
  createNewBudgetTemplate 
} from './utils/storage';
import { generateBudgetNumber, formatCurrency, formatDateBR, cleanNumeric } from './utils/formatters';
import { Edit3, Eye, Sparkles } from 'lucide-react';

/**
 * Função profissional corporativa para envio de proposta comercial no WhatsApp
 * Utiliza apenas marcadores universais (📊, 📌, ▪️, ⭐️) que nunca quebram em URLs.
 */
export function enviarWhatsApp(budget) {
  const provider = budget.provider;
  const client = budget.client;
  const validUntilDate = new Date(budget.createdAt);
  validUntilDate.setDate(validUntilDate.getDate() + (budget.terms.validityDays || 7));

  // Itens formatados com marcador ▪️ e alinhamento com recuo
  const itemsList = budget.items
    .map((item) => {
      const unitStr = item.unit || 'un';
      return `▪️ *${item.description || 'Item / Serviço'}*\n     ↳ ${item.quantity} ${unitStr} × ${formatCurrency(item.unitPrice)}  |  *Total: ${formatCurrency(item.total)}*`;
    })
    .join('\n\n');

  // Resumo financeiro com marcadores •
  let financialSummary = `   • Subtotal dos Itens: ${formatCurrency(budget.subtotal)}`;
  if (budget.discountCalculated > 0) {
    financialSummary += `\n   • Desconto Aplicado: -${formatCurrency(budget.discountCalculated)}`;
  }
  if (budget.travelFee > 0) {
    financialSummary += `\n   • Taxa de Deslocamento: +${formatCurrency(budget.travelFee)}`;
  }

  // Forma de pagamento
  let paymentMethodLabel = 'PIX à Vista';
  if (budget.terms.paymentMethod === 'credit_card') {
    const installments = budget.terms.installments || 1;
    const parcelValue = formatCurrency(budget.total / installments);
    paymentMethodLabel = `Cartão de Crédito (${installments}x de ${parcelValue})`;
  } else if (budget.terms.paymentMethod === 'boleto') {
    paymentMethodLabel = 'Boleto Bancário';
  } else if (budget.terms.paymentMethod === 'cash') {
    paymentMethodLabel = 'Dinheiro em Espécie / À Vista';
  } else if (budget.terms.paymentMethod === 'custom') {
    paymentMethodLabel = '50% Entrada e 50% na Conclusão';
  }

  const pixKey = budget.terms.pixKey || budget.provider.pixKey || 'c53a217d-bd84-445d-839d-e976fa7138e6';
  const companyName = provider.companyName || provider.tradeName || 'Minha Empresa';

  const message = `📊 *PROPOSTA COMERCIAL | ${budget.number}*
=======================================
Olá, *${client.name || 'Cliente'}*! Tudo bem?

Segue o detalhamento da proposta preparada por *${companyName}*.

📌 *ITENS E SERVIÇOS*
---------------------------------------
${itemsList || '▪️ *Serviço Especializado*\n     ↳ 1 un × ' + formatCurrency(budget.total) + '  |  *Total: ' + formatCurrency(budget.total) + '*'}

📌 *RESUMO FINANCEIRO*
---------------------------------------
${financialSummary}
⭐️ *VALOR TOTAL GERAL: ${formatCurrency(budget.total)}*

📌 *CONDIÇÕES COMERCIAIS*
---------------------------------------
   • Forma de Pagamento: ${paymentMethodLabel}
   • Chave PIX: ${pixKey}
   • Prazo de Execução: ${budget.terms.deliveryTime || 'A combinar'}
   • Garantia: ${budget.terms.warranty || 'Garantia legal de 90 dias'}
   • Validade da Proposta: até ${formatDateBR(validUntilDate.toISOString())}

📌 *OBSERVAÇÕES*
---------------------------------------
_${budget.terms.notes || 'Proposta sujeita aos termos e condições acordados.'}_

=======================================
Qualquer dúvida, estou à disposição para fecharmos o projeto!

Atenciosamente,
*${companyName}*`;

  let rawPhone = cleanNumeric(budget.client.phone);
  if (rawPhone.length === 10 || rawPhone.length === 11) {
    rawPhone = `55${rawPhone}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = rawPhone
    ? `https://wa.me/${rawPhone}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  window.open(url, '_blank');
}

export const openWhatsApp = enviarWhatsApp;

export function App() {
  // Estados principais
  const [provider, setProvider] = useState(loadProviderProfile);
  const [budgets, setBudgets] = useState(loadBudgetsHistory);
  
  // Orçamento ativo em edição
  const [currentBudget, setCurrentBudget] = useState(() => {
    const history = loadBudgetsHistory();
    if (history.length > 0) {
      return history[0];
    }
    return createNewBudgetTemplate(loadProviderProfile());
  });

  // Controle de abas no Mobile ('editor' | 'preview')
  const [mobileTab, setMobileTab] = useState('editor');

  // Controle de Modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSEFAZOpen, setIsSEFAZOpen] = useState(false);

  // Controle do PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Salvar perfil do prestador
  const handleSaveProvider = (updated) => {
    setProvider(updated);
    saveProviderProfile(updated);
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
  const handleDuplicateBudget = (b) => {
    const duplicated = {
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
  const handleDeleteBudget = (id) => {
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
  const handleStatusChange = (status) => {
    const updated = { ...currentBudget, status };
    setCurrentBudget(updated);
    saveOrUpdateBudget(updated);
    setBudgets(loadBudgetsHistory());
  };

  // Callback de sucesso da simulação SEFAZ
  const handleInvoiceSuccess = (fiscalKey, protocol) => {
    const updated = {
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
          <div className="flex flex-col items-center space-y-3">
            {/* Imagem Oficial da Logo Centralizada e Destacada */}
            <div className="relative group">
              <img
                src="/logo.png"
                alt="Logo Oficial Or?aZap Pro"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl drop-shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5 justify-center">
              <span>? Or?a<span className="text-emerald-400">Zap</span></span>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                PRO
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm">
              Sistema PWA ?gil para prestadores de servi?os: gere propostas comerciais elegantes em folha padr?o A4, exporte em PDF e envie or?amentos profissionais direto pelo WhatsApp com um clique!
            </p>
          </div>

          {/* QR Code Centralizado via api.qrserver.com */}
          <div className="flex flex-col items-center space-y-2 pt-1">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-400/40">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Forcazap-pro.vercel.app&bgcolor=ffffff&color=0f172a&margin=2&format=png"
                alt="QR Code Oficial ? Or?aZap Pro"
                width={180}
                height={180}
                className="rounded-lg block"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Escaneie com a c?mera do seu celular
            </p>
          </div>

          {/* Instru??es de Instala??o Inteligentes */}
          <div className="grid grid-cols-2 gap-3 w-full text-left">
            {/* Android */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                <span>??</span>
                <span>Android</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Escaneie o QR Code e clique em <strong className="text-white">"Instalar App"</strong>.
              </p>
            </div>

            {/* iPhone */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-sky-400">
                <span>??</span>
                <span>iPhone</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Abra no Safari, toque em <strong className="text-white">Compartilhar (?)</strong> e escolha <strong className="text-white">"Adicionar ? Tela de In?cio"</strong>.
              </p>
            </div>
          </div>

          {/* Bot?o de Acesso Brilhante */}
          <button
            type="button"
            onClick={() => setShowWelcomeScreen(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Acessar o Sistema ??</span>
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
      />

      {/* Navegação por Abas para Telas Mobile (no-print) */}
      <div className="no-print print:hidden lg:hidden bg-slate-900 border-b border-slate-800 sticky top-16 z-30 px-4 py-2">
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
          
          {/* COLUNA ESQUERDA: Painel de Edição */}
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
            />
          </div>

          {/* COLUNA DIREITA: Folha Comercial A4 (Preview em Tempo Real) */}
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
    </div>
  );
}

export default App;
