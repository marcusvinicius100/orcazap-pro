export interface BudgetItem {
  id: string;
  description: string;
  unit: string; // un, horas, m², dias, etc.
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'cash' | 'custom';

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'invoiced' | 'cancelled';

export interface CommercialTerms {
  paymentMethod: PaymentMethod;
  installments: number; // ex: 1 a 12x
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixKey: string;
  pixReceiverName: string;
  validityDays: number;
  deliveryTime: string; // Ex: "3 a 5 dias úteis"
  warranty: string; // Ex: "90 dias de garantia contra defeitos"
  notes: string;
}

export interface ClientData {
  name: string;
  phone: string;
  email: string;
  document: string; // CPF ou CNPJ
  address: string;
  city: string;
  state: string;
}

export interface ProviderProfile {
  companyName: string;
  tradeName: string; // Nome fantasia
  document: string; // CNPJ ou CPF
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
  defaultValidityDays: number;
  defaultWarranty: string;
  defaultNotes: string;
  logoUrl?: string;
}

export interface Budget {
  id: string;
  number: string; // Ex: "ORC-2026-0042"
  createdAt: string; // ISO
  status: BudgetStatus;
  provider: ProviderProfile;
  client: ClientData;
  items: BudgetItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  travelFee: number; // Taxa de deslocamento / frete
  terms: CommercialTerms;
  subtotal: number;
  discountCalculated: number;
  total: number;
  invoicedAt?: string;
  fiscalKey?: string;
  fiscalProtocol?: string;
}
