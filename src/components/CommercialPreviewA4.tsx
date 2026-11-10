import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  QrCode as QrIcon, 
  Copy, 
  Check, 
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Budget } from '../types';
import { formatCurrency, formatDateBR, formatDocument } from '../utils/formatters';

interface CommercialPreviewA4Props {
  budget: Budget;
}

export const CommercialPreviewA4: React.FC<CommercialPreviewA4Props> = ({ budget }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Calcula data de validade
  const validUntil = new Date(budget.createdAt);
  validUntil.setDate(validUntil.getDate() + (budget.terms.validityDays || 7));

  const activePixKey = budget.terms.pixKey || budget.provider.pixKey || 'c53a217d-bd84-445d-839d-e976fa7138e6';

  // Gera QR Code no Canvas para o PIX
  useEffect(() => {
    if (qrCanvasRef.current && activePixKey) {
      // Monta o QR Code com a chave PIX atualizada em tempo real
      QRCode.toCanvas(qrCanvasRef.current, activePixKey, {
        width: 90,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((err) => console.error('Erro ao renderizar QRCode:', err));
    }
  }, [activePixKey, budget.total]);

  const copyPixKey = () => {
    if (!activePixKey) return;
    navigator.clipboard.writeText(activePixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="a4-sheet bg-white text-slate-900 rounded-none sm:rounded-xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between border border-slate-200">
      
      {/* CABEÇALHO DO DOCUMENTO A4 */}
      <header className="border-b-2 border-emerald-600 pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Dados do Prestador com Logo Oficial */}
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-3">
              {/* Logo Oficial do Sistema visível na tela e na impressão/PDF com print:block */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm shrink-0 flex items-center justify-center print:block">
                <img
                  src="/logo.png"
                  alt="Logo da Empresa"
                  className="w-full h-full object-contain print:block"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {budget.provider.companyName || budget.provider.tradeName || 'Minha Empresa'}
                </h1>
                {budget.provider.tradeName && budget.provider.tradeName !== budget.provider.companyName && (
                  <p className="text-xs font-medium text-slate-600">
                    {budget.provider.tradeName}
                  </p>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
              {budget.provider.document && (
                <p className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">CNPJ/CPF:</span> {formatDocument(budget.provider.document)}
                </p>
              )}
              {budget.provider.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {budget.provider.phone}
                </p>
              )}
              {budget.provider.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {budget.provider.email}
                </p>
              )}
              {budget.provider.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" /> {budget.provider.address} - {budget.provider.city}/{budget.provider.state}
                </p>
              )}
            </div>
          </div>

          {/* Dados da Proposta / Número & Data */}
          <div className="sm:text-right bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 min-w-[210px] space-y-1.5">
            <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Orçamento Comercial
            </div>
            <div className="font-mono text-base font-black text-slate-900 tracking-tight">
              {budget.number}
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p>Emissão: <strong className="text-slate-700">{formatDateBR(budget.createdAt)}</strong></p>
              <p>Validade: <strong className="text-emerald-700">{formatDateBR(validUntil.toISOString())}</strong> ({budget.terms.validityDays} dias)</p>
            </div>
          </div>
        </div>
      </header>

      {/* DADOS DO CLIENTE */}
      <section className="my-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-600" /> Dados do Cliente
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cliente</span>
            <span className="font-bold text-slate-900 text-sm">{budget.client.name || 'Cliente Não Informado'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">WhatsApp / Contato</span>
            <span className="font-semibold text-slate-800">{budget.client.phone || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Documento (CPF/CNPJ)</span>
            <span className="font-medium text-slate-800">{budget.client.document ? formatDocument(budget.client.document) : '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">E-mail</span>
            <span className="text-slate-800">{budget.client.email || '-'}</span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Local de Entrega / Execução</span>
            <span className="text-slate-800">
              {budget.client.address ? `${budget.client.address} - ${budget.client.city}/${budget.client.state}` : '-'}
            </span>
          </div>
        </div>
      </section>

      {/* TABELA DE ITENS */}
      <section className="flex-1 my-3">
        <div className="overflow-hidden border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Descrição do Serviço / Produto</th>
                <th className="py-2.5 px-3 w-16 text-center">Unid.</th>
                <th className="py-2.5 px-3 w-16 text-center">Qtd.</th>
                <th className="py-2.5 px-3 w-28 text-right">Preço Unit.</th>
                <th className="py-2.5 px-3 w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-medium">
                    {item.description || 'Item sem descrição'}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500">
                    {item.unit || 'un'}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RESUMO FINANCEIRO E CONDIÇÕES */}
      <section className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        
        {/* Bloco PIX & Condições Comerciais (Esquerda) */}
        <div className="md:col-span-7 space-y-3">
          
          {/* Caixa do PIX */}
          {activePixKey && (
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-white p-1 rounded-lg border border-emerald-200 shadow-sm shrink-0">
                <canvas ref={qrCanvasRef} width={80} height={80} className="w-16 h-16" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                  <QrIcon className="w-3.5 h-3.5" /> Pagamento Rápido via PIX
                </div>
                <div className="text-[11px] text-slate-600">
                  <span>Titular: </span>
                  <strong className="text-slate-800">{budget.terms.pixReceiverName || budget.provider.companyName}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-950 font-semibold truncate max-w-[200px]">
                    {activePixKey}
                  </span>
                  <button
                    type="button"
                    onClick={copyPixKey}
                    className="no-print inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 transition-colors"
                    title="Copiar chave PIX"
                  >
                    {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Condições comerciais */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Forma de Pagamento:</strong>{' '}
                {budget.terms.paymentMethod === 'pix' && 'PIX à Vista'}
                {budget.terms.paymentMethod === 'credit_card' && `Cartão de Crédito em até ${budget.terms.installments}x`}
                {budget.terms.paymentMethod === 'boleto' && 'Boleto Bancário'}
                {budget.terms.paymentMethod === 'cash' && 'Dinheiro / À Vista'}
                {budget.terms.paymentMethod === 'custom' && '50% Entrada e 50% Conclusão'}
              </span>
            </div>

            {budget.terms.deliveryTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>
                  <strong>Prazo de Execução:</strong> {budget.terms.deliveryTime}
                </span>
              </div>
            )}

            {budget.terms.warranty && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  <strong>Garantia:</strong> {budget.terms.warranty}
                </span>
              </div>
            )}

            {budget.terms.notes && (
              <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                <em>Obs: {budget.terms.notes}</em>
              </div>
            )}
          </div>
        </div>

        {/* Resumo dos Valores (Direita) */}
        <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Subtotal dos Itens:</span>
            <span className="font-mono font-semibold text-slate-800">{formatCurrency(budget.subtotal)}</span>
          </div>

          {budget.discountCalculated > 0 && (
            <div className="flex justify-between items-center text-xs text-amber-700">
              <span>Desconto Aplicado:</span>
              <span className="font-mono font-semibold">-{formatCurrency(budget.discountCalculated)}</span>
            </div>
          )}

          {budget.travelFee > 0 && (
            <div className="flex justify-between items-center text-xs text-sky-700">
              <span>Taxa Deslocamento / Frete:</span>
              <span className="font-mono font-semibold">+{formatCurrency(budget.travelFee)}</span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-baseline">
            <span className="text-sm font-black uppercase tracking-wider text-slate-900">Total Geral:</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {formatCurrency(budget.total)}
            </span>
          </div>
        </div>
      </section>

      {/* TERMO DE ACEITE E ASSINATURAS */}
      <footer className="mt-6 pt-4 border-t border-slate-200 text-slate-600">
        <p className="text-[10px] text-center text-slate-500 mb-6 leading-relaxed">
          Ao aprovar esta proposta comercial, o cliente declara estar de acordo com os itens, valores, prazos e condições acima especificados.
        </p>

        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-slate-400 w-4/5 mx-auto h-8" />
            <p className="font-bold text-slate-800 pt-1">
              {budget.provider.companyName || 'Prestador de Serviços'}
            </p>
            <p className="text-[10px] text-slate-500">Assinatura do Emitente</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-400 w-4/5 mx-auto h-8" />
            <p className="font-bold text-slate-800 pt-1">
              {budget.client.name || 'Cliente / Contratante'}
            </p>
            <p className="text-[10px] text-slate-500">De Acordo / Assinatura do Cliente</p>
          </div>
        </div>

        <div className="text-center text-[9px] text-slate-400 mt-6 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Orçamento gerado pelo <strong>OrçaZap Pro</strong></span>
          <span>Página 1 de 1</span>
        </div>
      </footer>
    </div>
  );
};
