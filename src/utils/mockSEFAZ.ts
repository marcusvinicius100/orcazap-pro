import { Budget } from '../types';
import { cleanNumeric } from './formatters';

export interface FiscalNoteData {
  accessKey: string;
  protocolNumber: string;
  authorizationDate: string;
  series: string;
  number: string;
  natureOfOperation: string;
  emitterCNPJ: string;
  emitterName: string;
  emitterAddress: string;
  receiverDoc: string;
  receiverName: string;
  receiverAddress: string;
  items: Array<{
    code: string;
    description: string;
    ncm: string;
    cfop: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalProducts: number;
  discount: number;
  shipping: number;
  totalInvoice: number;
  icmsBase: number;
  icmsValue: number;
  issValue: number;
}

export function generateFiscalAccessKey(cnpj: string): string {
  const ufCode = '35'; // São Paulo (ou UF padrão)
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const cleanCnpj = cleanNumeric(cnpj || '12345678000195').padEnd(14, '0').slice(0, 14);
  const model = '55'; // NF-e
  const series = '001';
  const number = String(Math.floor(100000 + Math.random() * 900000));
  const emissionType = '1'; // Normal
  const numericCode = String(Math.floor(10000000 + Math.random() * 90000000));
  const rawKey43 = `${ufCode}${year}${month}${cleanCnpj}${model}${series}${number}${emissionType}${numericCode}`;
  
  // Dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = rawKey43.length - 1; i >= 0; i--) {
    sum += parseInt(rawKey43[i], 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  const dv = remainder < 2 ? 0 : 11 - remainder;

  return `${rawKey43}${dv}`;
}

export function generateFiscalProtocol(): string {
  const now = new Date();
  const code = Math.floor(1000000000 + Math.random() * 9000000000);
  return `135${now.getFullYear()}${code}`;
}

export function createFiscalNoteFromBudget(budget: Budget): FiscalNoteData {
  const accessKey = budget.fiscalKey || generateFiscalAccessKey(budget.provider.document);
  const protocolNumber = budget.fiscalProtocol || generateFiscalProtocol();
  const authorizationDate = budget.invoicedAt || new Date().toISOString();

  const fiscalItems = budget.items.map((item, idx) => ({
    code: String(idx + 1).padStart(4, '0'),
    description: item.description,
    ncm: '8471.90.12',
    cfop: '5.102',
    unit: item.unit || 'UN',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  return {
    accessKey,
    protocolNumber,
    authorizationDate,
    series: '001',
    number: budget.number.replace(/\D/g, '') || '000104',
    natureOfOperation: 'PRESTAÇÃO DE SERVIÇOS / VENDA DE MERCADORIA',
    emitterCNPJ: budget.provider.document || '28.192.345/0001-90',
    emitterName: budget.provider.companyName || 'Prestador OrçaZap Pro Ltda',
    emitterAddress: `${budget.provider.address || 'Av. Paulista, 1000'} - ${budget.provider.city || 'São Paulo'}/${budget.provider.state || 'SP'}`,
    receiverDoc: budget.client.document || '123.456.789-00',
    receiverName: budget.client.name || 'Consumidor Final',
    receiverAddress: `${budget.client.address || 'Rua das Flores, 50'} - ${budget.client.city || 'São Paulo'}/${budget.client.state || 'SP'}`,
    items: fiscalItems,
    totalProducts: budget.subtotal,
    discount: budget.discountCalculated,
    shipping: budget.travelFee,
    totalInvoice: budget.total,
    icmsBase: 0,
    icmsValue: 0,
    issValue: budget.total * 0.05,
  };
}
