import React, { useState } from 'react';
import { 
  Send, 
  Printer, 
  Save, 
  FileCheck2, 
  Check, 
  Share2, 
  MessageSquare
} from 'lucide-react';
import { Budget } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface ActionButtonsProps {
  budget: Budget;
  onSave: () => void;
  onOpenSEFAZ: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  budget,
  onSave,
  onOpenSEFAZ,
}) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handlePrintClick = () => {
    window.print();
  };

  const handleWhatsAppClick = () => {
    openWhatsApp(budget);
  };

  return (
    <div className="no-print bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
      
      {/* Botão Salvar LocalStorage */}
      <button
        type="button"
        onClick={handleSaveClick}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm transition-all"
        title="Salvar alterações na memória local do aparelho"
      >
        {justSaved ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">Salvo!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 text-cyan-400" />
            <span>Salvar</span>
          </>
        )}
      </button>

      {/* Botão Enviar WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        title="Enviar proposta comercial formatada no WhatsApp do cliente"
      >
        <MessageSquare className="w-4 h-4 text-slate-950 fill-current" />
        <span>Enviar p/ WhatsApp</span>
      </button>

      {/* Botão Imprimir / Salvar PDF */}
      <button
        type="button"
        onClick={handlePrintClick}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 shadow-sm transition-all"
        title="Gerar PDF A4 limpo ou imprimir direto na impressora"
      >
        <Printer className="w-4 h-4 text-emerald-400" />
        <span>Imprimir / Salvar PDF</span>
      </button>

      {/* Botão BÔNUS EXTRA - Emitir Nota Fiscal (Simulação) */}
      <button
        type="button"
        onClick={onOpenSEFAZ}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
        title="Simular autorização da NF-e no WebService da SEFAZ"
      >
        <FileCheck2 className="w-4 h-4 text-slate-950" />
        <span>Emitir Nota Fiscal (Simulação)</span>
      </button>
    </div>
  );
};
