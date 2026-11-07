import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Send, 
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import { Budget, BudgetStatus } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  onSelectBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onDuplicateBudget: (budget: Budget) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSelectBudget,
  onDeleteBudget,
  onDuplicateBudget,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredBudgets = budgets.filter((b) => {
    const matchesSearch =
      b.number.toLowerCase().includes(search.toLowerCase()) ||
      b.client.name.toLowerCase().includes(search.toLowerCase()) ||
      b.client.phone.includes(search) ||
      b.items.some((i) => i.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'invoiced':
        return {
          label: 'Faturado',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <FileCheck2 className="w-3 h-3" />,
        };
      case 'approved':
        return {
          label: 'Aprovado',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case 'sent':
        return {
          label: 'Enviado',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <Send className="w-3 h-3" />,
        };
      case 'draft':
      default:
        return {
          label: 'Rascunho',
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
          icon: <Clock className="w-3 h-3" />,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Histórico de Orçamentos</h2>
              <p className="text-xs text-slate-400">Gerencie e recarregue orçamentos salvos no seu aparelho</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, número ou item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'draft', 'sent', 'approved', 'invoiced'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s === 'all'
                  ? 'Todos'
                  : s === 'draft'
                  ? 'Rascunho'
                  : s === 'sent'
                  ? 'Enviados'
                  : s === 'approved'
                  ? 'Aprovados'
                  : 'Faturados'}
              </button>
            ))}
          </div>
        </div>

        {/* List of Budgets */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">Nenhum orçamento encontrado.</p>
              <p className="text-xs text-slate-500 mt-1">Crie um novo orçamento e clique em Salvar para vê-lo aqui.</p>
            </div>
          ) : (
            filteredBudgets.map((budget) => {
              const badge = getStatusBadge(budget.status);
              return (
                <div
                  key={budget.id}
                  className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {budget.number}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDateBR(budget.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{budget.client.name || 'Cliente sem nome'}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {budget.items.length} {budget.items.length === 1 ? 'item' : 'itens'}:{' '}
                      {budget.items.map((i) => i.description).join(', ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50 gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valor Total</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-400">
                        {formatCurrency(budget.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectBudget(budget);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                        title="Carregar este orçamento para o editor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir
                      </button>

                      <button
                        onClick={() => onDuplicateBudget(budget)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Duplicar como novo orçamento"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir o orçamento ${budget.number}?`)) {
                            onDeleteBudget(budget.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Total salvo: {budgets.length} orçamentos</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
