import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  Lock, 
  Server, 
  Barcode, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Budget } from '../types';
import { formatCurrency, formatDateTimeBR, formatAccessKey, formatDocument } from '../utils/formatters';
import { createFiscalNoteFromBudget, FiscalNoteData } from '../utils/mockSEFAZ';

interface SEFAZModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  onInvoiceSuccess: (fiscalKey: string, protocol: string) => void;
}

export const SEFAZModal: React.FC<SEFAZModalProps> = ({
  isOpen,
  onClose,
  budget,
  onInvoiceSuccess,
}) => {
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [fiscalData, setFiscalData] = useState<FiscalNoteData | null>(null);

  // Efeito de simulação da SEFAZ
  useEffect(() => {
    if (!isOpen) {
      setLoadingStep(0);
      setIsCompleted(false);
      return;
    }

    // Se já estiver faturado anteriormente, abre direto
    if (budget.status === 'invoiced' && budget.fiscalKey) {
      setFiscalData(createFiscalNoteFromBudget(budget));
      setIsCompleted(true);
      return;
    }

    // Caso contrário, roda a animação de 2 segundos
    setLoadingStep(1);
    const timer1 = setTimeout(() => {
      setLoadingStep(2);
    }, 700);

    const timer2 = setTimeout(() => {
      setLoadingStep(3);
    }, 1400);

    const timer3 = setTimeout(() => {
      const generated = createFiscalNoteFromBudget(budget);
      setFiscalData(generated);
      setIsCompleted(true);
      onInvoiceSuccess(generated.accessKey, generated.protocolNumber);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrintDANFE = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Ambiente de Emissão Fiscal (SEFAZ)</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  MODO SANDBOX / SIMULAÇÃO
                </span>
              </div>
              <p className="text-xs text-slate-400">WebService NF-e 4.0 - Documento Auxiliar da Nota Fiscal Eletrônica</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                onClick={handlePrintDANFE}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Imprimir DANFE"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir DANFE
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/50">
          {!isCompleted ? (
            /* ANIMAÇÃO DE COMUNICAÇÃO SEFAZ (2 Segundos) */
            <div className="py-16 px-4 text-center max-w-md mx-auto space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center bg-slate-900 shadow-xl shadow-emerald-500/20">
                  <Server className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Comunicando com a SEFAZ...</h3>
                <p className="text-xs text-slate-400 mt-1">Transmissão em lote para o servidor fiscal da Receita Estadual</p>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2.5 text-left bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 1 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    ✓
                  </div>
                  <span>Conectando ao WebService Estadual (NFeAutorizacao4)...</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    ✓
                  </div>
                  <span>Validando Certificado Digital A1 e Assinatura XML...</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    ✓
                  </div>
                  <span>Autorização de Uso Concedida (Cód. 100 - Autorizado)...</span>
                </div>
              </div>
            </div>
          ) : (
            /* DANFE VISUAL REALISTA */
            fiscalData && (
              <div className="space-y-4">
                {/* Banner de Sucesso */}
                <div className="no-print bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="font-bold">Nota Fiscal Eletrônica Autorizada com Sucesso!</strong>
                      <p className="text-[11px] text-emerald-400/80">Status do orçamento atualizado para <strong>Faturado</strong> no sistema.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/40">
                    Prot. {fiscalData.protocolNumber}
                  </span>
                </div>

                {/* DANFE Paper Container */}
                <div className="bg-white text-slate-900 border-2 border-slate-900 rounded-none sm:rounded-md p-4 sm:p-6 shadow-2xl font-sans text-xs space-y-3">
                  
                  {/* DANFE Header Box */}
                  <div className="grid grid-cols-12 border-2 border-slate-900">
                    
                    {/* Emitente */}
                    <div className="col-span-12 sm:col-span-5 p-3 border-b-2 sm:border-b-0 sm:border-r-2 border-slate-900 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">{fiscalData.emitterName}</h4>
                        <p className="text-[10px] text-slate-600 mt-0.5">{fiscalData.emitterAddress}</p>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold">
                        CNPJ: {formatDocument(fiscalData.emitterCNPJ)}
                      </div>
                    </div>

                    {/* Identificação DANFE */}
                    <div className="col-span-6 sm:col-span-3 p-3 border-r-2 border-slate-900 text-center flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-base tracking-wider">DANFE</h3>
                        <p className="text-[9px] uppercase font-bold text-slate-700">Documento Auxiliar da Nota Fiscal Eletrônica</p>
                      </div>
                      <div className="text-[10px] font-bold py-1 my-1 border-y border-slate-300">
                        0 - ENTRADA<br />
                        <strong>1 - SAÍDA</strong> [ 1 ]
                      </div>
                      <div className="text-[10px]">
                        <strong>Nº {fiscalData.number}</strong><br />
                        SÉRIE: {fiscalData.series}
                      </div>
                    </div>

                    {/* Código de Barras e Chave de Acesso */}
                    <div className="col-span-6 sm:col-span-4 p-3 flex flex-col justify-between">
                      {/* Simulação de Código de Barras com linhas verticais */}
                      <div className="h-10 bg-slate-100 flex items-center justify-center px-2 py-1 overflow-hidden border border-slate-300">
                        <div className="flex gap-[2px] h-full items-center justify-center w-full">
                          {Array.from({ length: 44 }).map((_, i) => (
                            <div
                              key={i}
                              className={`bg-slate-950 h-full ${i % 3 === 0 ? 'w-[3px]' : i % 2 === 0 ? 'w-[1.5px]' : 'w-[1px]'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-wider block text-slate-500">Chave de Acesso para Consulta</span>
                        <span className="font-mono text-[9px] font-black tracking-tight text-slate-900 break-all select-all">
                          {formatAccessKey(fiscalData.accessKey)}
                        </span>
                      </div>

                      <div className="mt-1 pt-1 border-t border-slate-300 text-[9px] text-center text-slate-600">
                        Protocolo de Autorização de Uso:<br />
                        <strong className="text-slate-900">{fiscalData.protocolNumber} - {formatDateTimeBR(fiscalData.authorizationDate)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Natureza da Operação */}
                  <div className="border-2 border-slate-900 p-2 text-[10px]">
                    <span className="font-bold text-slate-500 uppercase block text-[8px]">Natureza da Operação</span>
                    <strong className="text-xs uppercase">{fiscalData.natureOfOperation}</strong>
                  </div>

                  {/* Destinatário / Remetente */}
                  <div className="border-2 border-slate-900">
                    <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] uppercase border-b border-slate-900">
                      Destinatário / Remetente
                    </div>
                    <div className="grid grid-cols-12 p-2 gap-2 text-[10px]">
                      <div className="col-span-8">
                        <span className="text-slate-500 text-[8px] block uppercase font-semibold">Nome / Razão Social</span>
                        <strong>{fiscalData.receiverName}</strong>
                      </div>
                      <div className="col-span-4">
                        <span className="text-slate-500 text-[8px] block uppercase font-semibold">CNPJ / CPF</span>
                        <strong>{formatDocument(fiscalData.receiverDoc)}</strong>
                      </div>
                      <div className="col-span-8">
                        <span className="text-slate-500 text-[8px] block uppercase font-semibold">Endereço</span>
                        <span>{fiscalData.receiverAddress}</span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-slate-500 text-[8px] block uppercase font-semibold">Data da Emissão</span>
                        <strong>{formatDateTimeBR(fiscalData.authorizationDate)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Cálculo do Imposto */}
                  <div className="border-2 border-slate-900">
                    <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] uppercase border-b border-slate-900">
                      Cálculo do Imposto
                    </div>
                    <div className="grid grid-cols-5 p-2 gap-2 text-[10px] text-center">
                      <div>
                        <span className="text-slate-500 text-[8px] block uppercase">Base Cálculo ICMS</span>
                        <strong>{formatCurrency(fiscalData.icmsBase)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] block uppercase">Valor do ICMS</span>
                        <strong>{formatCurrency(fiscalData.icmsValue)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] block uppercase">Valor do Frete</span>
                        <strong>{formatCurrency(fiscalData.shipping)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] block uppercase">Valor do Desconto</span>
                        <strong>{formatCurrency(fiscalData.discount)}</strong>
                      </div>
                      <div className="bg-slate-100 p-1 border border-slate-300 rounded">
                        <span className="text-slate-500 text-[8px] block uppercase font-bold">Total da Nota</span>
                        <strong className="text-emerald-700 font-bold">{formatCurrency(fiscalData.totalInvoice)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Produtos / Serviços */}
                  <div className="border-2 border-slate-900 overflow-hidden">
                    <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] uppercase border-b border-slate-900">
                      Dados dos Produtos / Serviços
                    </div>
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 uppercase text-[8px] font-bold text-slate-700">
                          <th className="p-1 text-center w-10">Cód</th>
                          <th className="p-1">Descrição dos Produtos / Serviços</th>
                          <th className="p-1 w-16 text-center">NCM</th>
                          <th className="p-1 w-12 text-center">CFOP</th>
                          <th className="p-1 w-10 text-center">UN</th>
                          <th className="p-1 w-12 text-center">QTD</th>
                          <th className="p-1 w-20 text-right">V. UNIT</th>
                          <th className="p-1 w-20 text-right">V. TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {fiscalData.items.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1 text-center font-mono text-[9px]">{item.code}</td>
                            <td className="p-1 font-semibold">{item.description}</td>
                            <td className="p-1 text-center text-slate-600 font-mono">{item.ncm}</td>
                            <td className="p-1 text-center text-slate-600 font-mono">{item.cfop}</td>
                            <td className="p-1 text-center text-slate-600 uppercase">{item.unit}</td>
                            <td className="p-1 text-center font-bold">{item.quantity}</td>
                            <td className="p-1 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-1 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Dados Adicionais */}
                  <div className="border-2 border-slate-900 p-2 text-[9px] text-slate-700 space-y-1">
                    <span className="font-bold uppercase text-[8px] text-slate-500 block">Dados Adicionais / Informações Complementares</span>
                    <p className="font-mono">
                      DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NÃO GERA DIREITO A CRÉDITO FISCAL DE IPI. 
                      PROPOSTA ORIGEM: {budget.number}. SIMULAÇÃO SEFAZ SANDBOX ORÇAZAP PRO.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="no-print px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Certificado Digital A1 SHA-256
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
