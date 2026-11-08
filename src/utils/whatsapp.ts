import { Budget } from '../types';
import { formatCurrency, formatDateBR, cleanNumeric } from './formatters';

export function generateWhatsAppMessage(budget: Budget): string {
  const provider = budget.provider;
  const client = budget.client;
  const validUntilDate = new Date(budget.createdAt);
  validUntilDate.setDate(validUntilDate.getDate() + (budget.terms.validityDays || 7));

  // Itens formatados com recuo e alinhamento conforme solicitado
  const itemsList = budget.items
    .map((item) => {
      const unitStr = item.unit || 'un';
      return `🔹 *${item.description || 'Item / Serviço'}*\n     ↳ ${item.quantity} ${unitStr} × ${formatCurrency(item.unitPrice)}  |  *Total: ${formatCurrency(item.total)}*`;
    })
    .join('\n\n');

  // Resumo financeiro com recuos de 3 espaços criando hierarquia visual
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
  const pixReceiver = budget.terms.pixReceiverName || provider.companyName || 'Minha Empresa';
  const companyName = provider.companyName || provider.tradeName || 'Minha Empresa';

  const message = `📊 *PROPOSTA COMERCIAL | ${budget.number}*
--------------------------------------------------
Olá, *${client.name || 'Cliente'}*! Tudo bem?

Segue o detalhamento da proposta de serviços e valores preparada exclusivamente para você por *${companyName}*.

⬜  *ITENS E SERVIÇOS*
--------------------------------------------------
${itemsList || '🔹 *Serviço Especializado*\n     ↳ 1 un × ' + formatCurrency(budget.total) + '  |  *Total: ' + formatCurrency(budget.total) + '*'}

⬜  *RESUMO FINANCEIRO*
--------------------------------------------------
${financialSummary}
⭐️  *VALOR TOTAL GERAL: ${formatCurrency(budget.total)}*

⬜  *CONDIÇÕES COMERCIAIS*
--------------------------------------------------
   ⚙️ *Forma de Pagamento:* ${paymentMethodLabel}
   🔑 *Chave PIX para Depósito:* \`${pixKey}\` (${pixReceiver})
   ⏱️ *Prazo de Execução:* ${budget.terms.deliveryTime || 'A combinar'}
   🛡️ *Garantia dos Serviços:* ${budget.terms.warranty || 'Garantia legal de 90 dias'}
   📅 *Validade da Proposta:* até ${formatDateBR(validUntilDate.toISOString())}

📝  *OBSERVAÇÕES*
--------------------------------------------------
_${budget.terms.notes || 'Proposta sujeita aos termos e condições acordados. Valores válidos pelo período da proposta.'}_

--------------------------------------------------
Qualquer dúvida ou ajuste que precisar, estou à inteira disposição para conversarmos e fecharmos o projeto. Podemos confirmar para darmos início?

Atenciosamente,
*${companyName}*${provider.phone ? `\n📞 ${provider.phone}` : ''}`;

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

// Alias em português para interoperabilidade
export const enviarWhatsApp = openWhatsApp;
