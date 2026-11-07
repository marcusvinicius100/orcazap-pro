import { Budget, ProviderProfile } from '../types';
import { generateBudgetNumber } from './formatters';

const STORAGE_KEY_PROVIDER = 'orcazap_provider_profile_v1';
const STORAGE_KEY_BUDGETS = 'orcazap_budgets_history_v1';

export const defaultProvider: ProviderProfile = {
  companyName: 'TechSolutions Serviços Especializados',
  tradeName: 'TechSolutions Pro',
  document: '34.567.890/0001-12',
  phone: '(11) 98765-4321',
  email: 'contato@techsolutions.com.br',
  address: 'Av. Paulista, 1500 - Conj. 82',
  city: 'São Paulo',
  state: 'SP',
  pixKey: 'pix@techsolutions.com.br',
  pixKeyType: 'email',
  pixReceiverName: 'TechSolutions Servicos Ltda',
  defaultValidityDays: 10,
  defaultWarranty: '90 dias contra qualquer vício de fabricação ou serviço.',
  defaultNotes: 'Condições válidas mediante aprovação cadastral e confirmação dos insumos.',
};

export const sampleBudgets: Budget[] = [
  {
    id: 'sample-1',
    number: 'ORC-2026-1082',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'invoiced',
    provider: defaultProvider,
    client: {
      name: 'Studio Arquitetura & Design',
      phone: '11999998888',
      email: 'contato@studioarq.com.br',
      document: '42.111.222/0001-33',
      address: 'Rua Oscar Freire, 300',
      city: 'São Paulo',
      state: 'SP',
    },
    items: [
      {
        id: '1',
        description: 'Desenvolvimento de Landing Page de Alta Conversão',
        unit: 'un',
        quantity: 1,
        unitPrice: 2800,
        total: 2800,
      },
      {
        id: '2',
        description: 'Integração de Gateway de Pagamento e PIX Automático',
        unit: 'un',
        quantity: 1,
        unitPrice: 1200,
        total: 1200,
      },
      {
        id: '3',
        description: 'Suporte Técnico e Otimização SEO (Mensal)',
        unit: 'mês',
        quantity: 2,
        unitPrice: 450,
        total: 900,
      },
    ],
    discountType: 'fixed',
    discountValue: 200,
    travelFee: 0,
    terms: {
      paymentMethod: 'pix',
      installments: 1,
      pixKeyType: 'email',
      pixKey: 'pix@techsolutions.com.br',
      pixReceiverName: 'TechSolutions Servicos Ltda',
      validityDays: 10,
      deliveryTime: '7 a 10 dias úteis',
      warranty: '90 dias de garantia e manutenção',
      notes: 'Hospedagem inclusa nos primeiros 30 dias de operação.',
    },
    subtotal: 4900,
    discountCalculated: 200,
    total: 4700,
    invoicedAt: new Date(Date.now() - 86400000).toISOString(),
    fiscalKey: '35261134567890000112550010001082181234567890',
    fiscalProtocol: '135260098765432',
  },
  {
    id: 'sample-2',
    number: 'ORC-2026-1094',
    createdAt: new Date().toISOString(),
    status: 'approved',
    provider: defaultProvider,
    client: {
      name: 'Carlos Eduardo Mendes',
      phone: '11988887777',
      email: 'carlos.mendes@gmail.com',
      document: '234.567.890-11',
      address: 'Av. Brigadeiro Faria Lima, 2000',
      city: 'São Paulo',
      state: 'SP',
    },
    items: [
      {
        id: '1',
        description: 'Instalação e Configuração de Rede Wi-Fi 6 Mesh',
        unit: 'serviço',
        quantity: 1,
        unitPrice: 850,
        total: 850,
      },
      {
        id: '2',
        description: 'Roteador Access Point Corporativo Gigabit',
        unit: 'un',
        quantity: 3,
        unitPrice: 420,
        total: 1260,
      },
    ],
    discountType: 'percentage',
    discountValue: 5,
    travelFee: 80,
    terms: {
      paymentMethod: 'credit_card',
      installments: 3,
      pixKeyType: 'email',
      pixKey: 'pix@techsolutions.com.br',
      pixReceiverName: 'TechSolutions Servicos Ltda',
      validityDays: 7,
      deliveryTime: '2 dias úteis',
      warranty: '12 meses para os equipamentos e 90 dias instalação',
      notes: 'Equipamentos entregues e testados no local.',
    },
    subtotal: 2110,
    discountCalculated: 105.5,
    total: 2084.5,
  },
];

export function loadProviderProfile(): ProviderProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDER);
    if (raw) {
      return { ...defaultProvider, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Erro ao ler perfil do prestador:', err);
  }
  return defaultProvider;
}

export function saveProviderProfile(profile: ProviderProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROVIDER, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar perfil do prestador:', err);
  }
}

export function loadBudgetsHistory(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Salva orçamentos de exemplo para uma primeira experiência agradável
    saveBudgetsHistory(sampleBudgets);
    return sampleBudgets;
  } catch (err) {
    console.error('Erro ao carregar histórico de orçamentos:', err);
    return sampleBudgets;
  }
}

export function saveBudgetsHistory(budgets: Budget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  } catch (err) {
    console.error('Erro ao salvar histórico de orçamentos:', err);
  }
}

export function saveOrUpdateBudget(budget: Budget): Budget[] {
  const current = loadBudgetsHistory();
  const index = current.findIndex((b) => b.id === budget.id);
  let updated: Budget[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = budget;
  } else {
    updated = [budget, ...current];
  }
  saveBudgetsHistory(updated);
  return updated;
}

export function deleteBudget(budgetId: string): Budget[] {
  const current = loadBudgetsHistory();
  const filtered = current.filter((b) => b.id !== budgetId);
  saveBudgetsHistory(filtered);
  return filtered;
}

export function createNewBudgetTemplate(provider: ProviderProfile): Budget {
  return {
    id: 'budget-' + Date.now(),
    number: generateBudgetNumber(),
    createdAt: new Date().toISOString(),
    status: 'draft',
    provider,
    client: {
      name: '',
      phone: '',
      email: '',
      document: '',
      address: '',
      city: provider.city || '',
      state: provider.state || 'SP',
    },
    items: [
      {
        id: 'item-1',
        description: 'Serviço Profissional Especializado',
        unit: 'un',
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    ],
    discountType: 'fixed',
    discountValue: 0,
    travelFee: 0,
    terms: {
      paymentMethod: 'pix',
      installments: 1,
      pixKeyType: provider.pixKeyType || 'email',
      pixKey: provider.pixKey || '',
      pixReceiverName: provider.pixReceiverName || provider.companyName,
      validityDays: provider.defaultValidityDays || 7,
      deliveryTime: '3 a 5 dias úteis',
      warranty: provider.defaultWarranty || '90 dias de garantia padrão',
      notes: provider.defaultNotes || '',
    },
    subtotal: 500,
    discountCalculated: 0,
    total: 500,
  };
}
