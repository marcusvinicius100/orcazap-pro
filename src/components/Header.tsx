import React from 'react';
import { 
  FileText, 
  History, 
  Settings, 
  PlusCircle, 
  Download, 
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  FileCheck2
} from 'lucide-react';
import { Budget, BudgetStatus } from '../types';

interface HeaderProps {
  currentBudget: Budget;
  onNewBudget: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onStatusChange: (status: BudgetStatus) => void;
  historyCount: number;
  installPrompt: any;
  onInstallApp: () => void;
  /** Abre o modal de QR Code "Abrir no Celular" */
  onOpenQRModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBudget,
  onNewBudget,
  onOpenHistory,
  onOpenSettings,
  onStatusChange,
  historyCount,
  installPrompt,
  onInstallApp,
  onOpenQRModal,
}) => {
  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'invoiced':
        return {
          label: 'Faturado (NF-e)',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <FileCheck2 className="w-3.5 h-3.5" />,
        };
      case 'approved':
        return {
          label: 'Aprovado',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'sent':
        return {
          label: 'Enviado',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <Send className="w-3.5 h-3.5" />,
        };
      case 'draft':
      default:
        return {
          label: 'Rascunho',
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const statusBadge = getStatusBadge(currentBudget.status);

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-xl">
            <span>✨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-emerald-400 tracking-tight flex items-center gap-1">
                ⚡ OrçaZap Pro
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Orçamentos Ágeis, WhatsApp & PDF A4
            </p>
          </div>
        </div>

        {/* Status Selector & Número do Orçamento */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            {currentBudget.number}
          </span>

          <div className="relative inline-flex items-center">
            <select
              value={currentBudget.status}
              onChange={(e) => onStatusChange(e.target.value as BudgetStatus)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${statusBadge.color}`}
            >
              <option value="draft" className="bg-slate-800 text-slate-300">Rascunho</option>
              <option value="sent" className="bg-slate-800 text-amber-300">Enviado</option>
              <option value="approved" className="bg-slate-800 text-blue-300">Aprovado</option>
              <option value="invoiced" className="bg-slate-800 text-emerald-300">Faturado (NF-e)</option>
            </select>
            <div className="absolute right-2 pointer-events-none text-current">
              {statusBadge.icon}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Botão Instalar PWA — aparece apenas quando o navegador oferece o prompt nativo (Android/Desktop Chrome) */}
          {installPrompt && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors"
              title="Instalar OrçaZap Pro como aplicativo no dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Novo Orçamento */}
          <button
            onClick={onNewBudget}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm"
            title="Criar novo orçamento em branco"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Novo</span>
          </button>

          {/* Histórico */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors relative"
            title="Ver orçamentos salvos"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Histórico</span>
            {historyCount > 0 && (
              <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* 📱 Botão QR Code — Abrir no Celular (abre modal com QR Code e instruções) */}
          <button
            onClick={onOpenQRModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/50 hover:text-sky-300 transition-colors"
            title="Gerar QR Code para abrir e instalar o app no celular"
          >
            <span className="text-sm leading-none">📱</span>
            <span className="hidden sm:inline">Abrir no Celular</span>
          </button>

          {/* Configurações Prestador */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Dados da sua empresa e chave PIX"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Minha Empresa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
