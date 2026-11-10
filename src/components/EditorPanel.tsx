import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2, 
  Percent, 
  DollarSign, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  Layers,
  Settings,
  Building2,
  ChevronDown,
  ChevronUp,
  QrCode,
  Zap,
  Check
} from 'lucide-react';
import { Budget, BudgetItem, PaymentMethod, ProviderProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface EditorPanelProps {
  budget: Budget;
  onChange: (updated: Budget) => void;
  onProviderChange?: (updated: ProviderProfile) => void;
  onOpenQRModal?: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ budget, onChange, onProviderChange, onOpenQRModal }) => {
  // Controle da seção expansível Configurações da Minha Empresa
  const [isCompanyExpanded, setIsCompanyExpanded] = useState<boolean>(true);

  // Atualiza dados da Minha Empresa em tempo real e salva no LocalStorage
  const handleCompanyFieldChange = (field: keyof ProviderProfile, value: string) => {
    const updatedProvider: ProviderProfile = {
      ...budget.provider,
      [field]: value,
      // Se atualizar o nome, sincroniza também o nome fantasia
      ...(field === 'companyName' ? { tradeName: value } : {}),
    };

    // Sincroniza a chave PIX nos termos do orçamento para refletir na Folha A4 imediatamente
    const updatedTerms = {
      ...budget.terms,
      ...(field === 'pixKey' ? { pixKey: value } : {}),
      ...(field === 'companyName' && !budget.terms.pixReceiverName ? { pixReceiverName: value } : {}),
    };

    const updatedBudget: Budget = {
      ...budget,
      provider: updatedProvider,
      terms: updatedTerms,
    };

    onChange(updatedBudget);
    if (onProviderChange) {
      onProviderChange(updatedProvider);
    }
  };

  // Atualiza campo do cliente
  const handleClientChange = (field: string, value: string) => {
    onChange({
      ...budget,
      client: {
        ...budget.client,
        [field]: value,
      },
    });
  };

  // Recalcular totais matematicamente
  const recalculateBudget = (
    items: BudgetItem[],
    discountType: 'percentage' | 'fixed',
    discountValue: number,
    travelFee: number
  ) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    let discountCalculated = 0;
    if (discountType === 'percentage') {
      discountCalculated = (subtotal * (discountValue || 0)) / 100;
    } else {
      discountCalculated = discountValue || 0;
    }

    if (discountCalculated > subtotal) {
      discountCalculated = subtotal;
    }

    const total = Math.max(0, subtotal - discountCalculated + (travelFee || 0));

    return {
      subtotal,
      discountCalculated,
      total,
    };
  };

  // Atualizar item específico
  const handleItemChange = (index: number, field: keyof BudgetItem, value: any) => {
    const updatedItems = [...budget.items];
    const targetItem = { ...updatedItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) || 0 : targetItem.quantity;
      const p = field === 'unitPrice' ? Number(value) || 0 : targetItem.unitPrice;
      targetItem.total = q * p;
    }

    updatedItems[index] = targetItem;
    const calc = recalculateBudget(updatedItems, budget.discountType, budget.discountValue, budget.travelFee);

    onChange({
      ...budget,
      items: updatedItems,
      ...calc,
    });
  };

  // Adicionar novo item
  const handleAddItem = () => {
    const newItem: BudgetItem = {
      id: 'item-' + Date.now(),
      description: '',
      unit: 'un',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    const updatedItems = [...budget.items, newItem];
    const calc = recalculateBudget(updatedItems, budget.discountType, budget.discountValue, budget.travelFee);
    onChange({
      ...budget,
      items: updatedItems,
      ...calc,
    });
  };

  // Remover item
  const handleRemoveItem = (index: number) => {
    if (budget.items.length <= 1) {
      // Deixar pelo menos 1 item em branco
      const resetItems: BudgetItem[] = [
        {
          id: 'item-' + Date.now(),
          description: '',
          unit: 'un',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ];
      const calc = recalculateBudget(resetItems, budget.discountType, budget.discountValue, budget.travelFee);
      onChange({
        ...budget,
        items: resetItems,
        ...calc,
      });
      return;
    }

    const updatedItems = budget.items.filter((_, i) => i !== index);
    const calc = recalculateBudget(updatedItems, budget.discountType, budget.discountValue, budget.travelFee);
    onChange({
      ...budget,
      items: updatedItems,
      ...calc,
    });
  };

  // Atualizar desconto
  const handleDiscountChange = (type: 'percentage' | 'fixed', val: number) => {
    const calc = recalculateBudget(budget.items, type, val, budget.travelFee);
    onChange({
      ...budget,
      discountType: type,
      discountValue: val,
      ...calc,
    });
  };

  // Atualizar taxa de deslocamento
  const handleTravelFeeChange = (val: number) => {
    const calc = recalculateBudget(budget.items, budget.discountType, budget.discountValue, val);
    onChange({
      ...budget,
      travelFee: val,
      ...calc,
    });
  };

  // Atualizar termos comerciais
  const handleTermsChange = (field: string, value: any) => {
    onChange({
      ...budget,
      terms: {
        ...budget.terms,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* ⚡ CABEÇALHO DO PAINEL DE EDIÇÃO COM LOGO DISCRETA */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 shadow-sm flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo OrçaZap Pro"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-white tracking-wide">
              ⚡ Orça<span className="text-emerald-400">Zap</span> Pro
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Painel de Edição
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Preencha os dados abaixo para gerar o orçamento em tempo real</p>
        </div>
      </div>

      {/* 📱 BOTÃO: ABRIR NO CELULAR (QR Code Modal) */}
      {onOpenQRModal && (
        <button
          type="button"
          onClick={onOpenQRModal}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-all group shadow-sm"
          title="Gerar QR Code para abrir e instalar o app no celular"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">📱</span>
          <span>Abrir no Celular</span>
          <span className="ml-auto text-xs text-slate-500 group-hover:text-emerald-400 transition-colors font-mono">
            QR Code ↗
          </span>
        </button>
      )}
      {/* ⚙️ CONFIGURAÇÕES DA MINHA EMPRESA (EXPANSÍVEL) */}
      <section className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-200">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />
        
        {/* Cabeçalho da Seção com Botão Expansível */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
            className="flex items-center gap-2.5 text-left group flex-1 focus:outline-none"
            title="Clique para expandir ou recolher as configurações da sua empresa"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  ⚙️ Configurações da Minha Empresa
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-400" /> Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-400">Edite seus dados direto pelo app para atualizar a Folha A4</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            {isCompanyExpanded ? (
              <ChevronUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Conteúdo Expansível com os 4 Campos de Texto */}
        {isCompanyExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Campo 1: Nome da Empresa */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome da Empresa / Prestador *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha Empresa Serviços Ltda"
                    value={budget.provider.companyName || ''}
                    onChange={(e) => handleCompanyFieldChange('companyName', e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Campo 2: CNPJ */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  CNPJ ou CPF *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={budget.provider.document || ''}
                    onChange={(e) => handleCompanyFieldChange('document', e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Campo 3: Telefone */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Telefone / WhatsApp Comercial *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={budget.provider.phone || ''}
                    onChange={(e) => handleCompanyFieldChange('phone', e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Campo 4: Chave PIX (Padrão: c53a217d-bd84-445d-839d-e976fa7138e6) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Chave PIX (Padrão) *
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="c53a217d-bd84-445d-839d-e976fa7138e6"
                    value={budget.provider.pixKey || budget.terms.pixKey || 'c53a217d-bd84-445d-839d-e976fa7138e6'}
                    onChange={(e) => handleCompanyFieldChange('pixKey', e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono text-xs select-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Salvo instantaneamente no LocalStorage do aparelho
              </span>
              <span className="text-slate-500 hidden sm:inline">
                Reflete na Folha A4 em tempo real
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 1. DADOS DO CLIENTE */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dados do Cliente</h2>
              <p className="text-xs text-slate-400">Informações para contato e faturamento</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Cliente / Empresa *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Amanda Silva ou Alfa Serviços Ltda"
                value={budget.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp / Telefone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={budget.client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">CPF ou CNPJ</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={budget.client.document}
                onChange={(e) => handleClientChange('document', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-mail do Cliente</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="cliente@email.com"
                value={budget.client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Endereço / Local da Execução</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rua, número e bairro"
                value={budget.client.address}
                onChange={(e) => handleClientChange('address', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABELA DINÂMICA DE ITENS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Itens e Serviços</h2>
              <p className="text-xs text-slate-400">Adicione produtos, mão de obra ou materiais</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Item
          </button>
        </div>

        {/* Linhas de Itens */}
        <div className="space-y-3">
          {budget.items.map((item, index) => (
            <div
              key={item.id}
              className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 sm:p-4 hover:border-slate-600 transition-all space-y-3 group"
            >
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center shrink-0 mt-1">
                  {index + 1}
                </span>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Descrição do serviço ou produto (ex: Instalação de Ar Condicionado 12.000 BTUs)"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remover linha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Detalhes de Quantidade, Unidade, Preço e Total */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 pl-8">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Qtd.</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Unidade</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="hora">hora (Horas)</option>
                    <option value="serviço">serviço</option>
                    <option value="dia">dia (Diária)</option>
                    <option value="m²">m² (Metro²) </option>
                    <option value="metro">metro linear</option>
                    <option value="kg">kg (Quilo)</option>
                    <option value="mês">mês</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Preço Unit. (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Total Linha</label>
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-400 truncate">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal dos itens */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
          <span>Subtotal dos Itens:</span>
          <span className="font-mono text-sm font-bold text-white">{formatCurrency(budget.subtotal)}</span>
        </div>
      </section>

      {/* 3. CAMPOS DE AJUSTES (DESCONTO E DESLOCAMENTO) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400" />
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ajustes Financeiros</h2>
            <p className="text-xs text-slate-400">Descontos e taxa de deslocamento/entrega</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Desconto */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-400" /> Desconto Comercial
              </label>
              <div className="flex rounded-md bg-slate-900 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleDiscountChange('fixed', budget.discountValue)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    budget.discountType === 'fixed'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  R$
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscountChange('percentage', budget.discountValue)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    budget.discountType === 'percentage'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  %
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={budget.discountValue || ''}
                onChange={(e) => handleDiscountChange(budget.discountType, parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {budget.discountCalculated > 0 && (
              <p className="text-[11px] text-amber-400 font-medium">
                Desconto aplicado: -{formatCurrency(budget.discountCalculated)}
              </p>
            )}
          </div>

          {/* Taxa de Deslocamento */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" /> Taxa de Deslocamento / Frete (R$)
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={budget.travelFee || ''}
                onChange={(e) => handleTravelFeeChange(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Cobrança de combustível, pedágio ou frete
            </p>
          </div>
        </div>

        {/* Resumo Dinâmico em Destaque */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Geral Estimado</span>
            <span className="text-xs text-emerald-400/80">Inclui itens, descontos e taxas</span>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(budget.total)}
            </span>
          </div>
        </div>
      </section>

      {/* 4. CONDIÇÕES COMERCIAIS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Condições Comerciais</h2>
            <p className="text-xs text-slate-400">Formas de pagamento, chave PIX, prazos e garantia</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Forma de Pagamento Principal</label>
            <select
              value={budget.terms.paymentMethod}
              onChange={(e) => handleTermsChange('paymentMethod', e.target.value as PaymentMethod)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pix">PIX à Vista (Chave e QR Code)</option>
              <option value="credit_card">Cartão de Crédito (Parcelado)</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="cash">Dinheiro em Espécie</option>
              <option value="custom">50% Entrada + 50% Conclusão</option>
            </select>
          </div>

          {budget.terms.paymentMethod === 'credit_card' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Número Máximo de Parcelas</label>
              <select
                value={budget.terms.installments}
                onChange={(e) => handleTermsChange('installments', parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    Até {num}x de {formatCurrency(budget.total / num)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chave PIX para Depósito</label>
            <input
              type="text"
              value={budget.terms.pixKey}
              onChange={(e) => handleTermsChange('pixKey', e.target.value)}
              placeholder="Chave PIX que sairá na proposta"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prazo de Entrega / Execução</label>
            <input
              type="text"
              value={budget.terms.deliveryTime}
              onChange={(e) => handleTermsChange('deliveryTime', e.target.value)}
              placeholder="Ex: 3 a 5 dias úteis após aprovação"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Validade Desta Proposta (Dias)</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="90"
                value={budget.terms.validityDays}
                onChange={(e) => handleTermsChange('validityDays', parseInt(e.target.value, 10) || 7)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Termos de Garantia</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={budget.terms.warranty}
                onChange={(e) => handleTermsChange('warranty', e.target.value)}
                placeholder="Ex: 90 dias de garantia legal contra defeitos"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Observações Adicionais</label>
            <textarea
              rows={2}
              value={budget.terms.notes}
              onChange={(e) => handleTermsChange('notes', e.target.value)}
              placeholder="Observações pertinentes à execução, condições de entrada, etc."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
