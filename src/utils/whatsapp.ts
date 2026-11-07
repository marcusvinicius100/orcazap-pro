import { Budget } from '../types';
import { formatCurrency, formatDateBR, cleanNumeric } from './formatters';

export function generateWhatsAppMessage(budget: Budget): string {
  const provider = budget.provider;
  const client = budget.client;
  const validUntilDate = new Date(budget.createdAt);
  validUntilDate.setDate(validUntilDate.getDate() + (budget.terms.validityDays || 7));

  const itemsList = budget.items
    .map((item, index) => {
      const unitStr = item.unit ? ` (${item.quantity} ${item.unit})` : ` (${item.quantity}x)`;
      return `${index + 1}️⃣ *${item.description}*${unitStr}\n   ↳ ${formatCurrency(item.unitPrice)} un. | *Total: ${formatCurrency(item.total)}*`;
    })
    .join('\n\n');

  let discountText = '';
  if (budget.discountCalculated > 0) {
    discountText = `\n🎁 *Desconto Especial:* -${formatCurrency(budget.discountCalculated)}`;
  }

  let travelFeeText = '';
  if (budget.travelFee > 0) {
    travelFeeText = `\n🚗 *Taxa de Deslocamento/Entrega:* ${formatCurrency(budget.travelFee)}`;
  }

  let paymentMethodLabel = 'PIX à vista';
  if (budget.terms.paymentMethod === 'credit_card') {
    paymentMethodLabel = `Cartão de Crédito (${budget.terms.installments}x)`;
  } else if (budget.terms.paymentMethod === 'boleto') {
    paymentMethodLabel = 'Boleto Bancário';
  } else if (budget.terms.paymentMethod === 'cash') {
    paymentMethodLabel = 'Dinheiro / À vista';
  }

  let pixDetails = '';
  if (budget.terms.pixKey) {
    pixDetails = `\n🔑 *Chave PIX:* \`${budget.terms.pixKey}\` (${budget.terms.pixReceiverName || provider.companyName})`;
  }

  const message = `📋 *PROPOSTA COMERCIAL - ${budget.number}*
━━━━━━━━━━━━━━━━━━━━
Olá, *${client.name || 'Cliente'}*! Tudo bem?
Conforme combinamos, segue a proposta de serviços e valores preparada exclusivamente para você pela *${provider.companyName || 'Nossa Empresa'}*.

📦 *ITENS E SERVIÇOS:*
${itemsList || '_Nenhum item informado_'}
━━━━━━━━━━━━━━━━━━━━
💵 *RESUMO FINANCEIRO:*
• Subtotal: ${formatCurrency(budget.subtotal)}${discountText}${travelFeeText}
⭐ *VALOR TOTAL: ${formatCurrency(budget.total)}*
━━━━━━━━━━━━━━━━━━━━
💳 *CONDIÇÕES COMERCIAIS:*
• Forma de Pagamento: *${paymentMethodLabel}*${pixDetails}
• Prazo de Execução: *${budget.terms.deliveryTime || 'A combinar'}*
• Garantia: *${budget.terms.warranty || 'Garantia padrão de 90 dias'}*
• Validade da Proposta: até *${formatDateBR(validUntilDate.toISOString())}*

${budget.terms.notes ? `📝 *Observações:*\n_${budget.terms.notes}_\n` : ''}
Qualquer dúvida ou ajuste que precisar, estou à disposição por aqui para fecharmos!
Podemos confirmar para darmos início?

Atenciosamente,
*${provider.companyName || 'OrçaZap Pro'}*
${provider.phone ? `📞 ${provider.phone}` : ''}`;

  return message;
}

export function openWhatsApp(budget: Budget): void {
  const message = generateWhatsAppMessage(budget);
  let rawPhone = cleanNumeric(budget.client.phone);

  // Se não começar com DDI (55 para Brasil), adiciona
  if (rawPhone.length === 10 || rawPhone.length === 11) {
    rawPhone = `55${rawPhone}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = rawPhone
    ? `https://wa.me/${rawPhone}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  window.open(url, '_blank');
}
