export type Operator = 'Orange' | 'MTN' | 'Moov' | 'Wave';

export type TransactionType = 'Dépôt' | 'Retrait' | 'Transfert d’unités' | 'Pass Internet';

export interface DataBundle {
  id: string;
  name: string;
  volume: string;
  validity: string;
  price: number;
  operator: Operator;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  operator: Operator;
  clientName: string;
  clientPhone: string;
  amount: number;
  commission: number;
  time: string;
  date: string;
  reference: string;
  note?: string;
  bundleInfo?: {
    volume?: string;
    validity?: string;
    packageName?: string;
  };
}

export type TransferKind = 'inter_operator' | 'supply_cash_to_uv' | 'p2p_confrere' | 'uv_to_cash';

export interface UnitTransfer {
  id: string;
  transferKind: TransferKind;
  sourceType: 'UV' | 'Cash';
  sourceOperator?: Operator;
  targetType: 'UV' | 'Cash';
  targetOperator?: Operator;
  amount: number;
  fee: number;
  recipientPhone?: string;
  recipientName?: string;
  reference: string;
  timestamp: string;
  date: string;
  status: 'Complété' | 'En attente';
  note?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  totalTransactions: number;
  totalVolume: number;
  preferredOperator: Operator;
  lastActive: string;
}

export interface CaisseBalances {
  cash: number;
  orangeUV: number;
  mtnUV: number;
  moovUV: number;
  waveUV: number;
}

export interface UVThresholds {
  orangeUV: number;
  mtnUV: number;
  moovUV: number;
  waveUV: number;
  cash?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'trial' | 'transaction' | 'system' | 'commission';
}

export interface SubscriptionState {
  isSubscribed: boolean;
  trialDaysLeft: number;
  monthlyPrice: number; // 10000 FCFA
  operator?: Operator;
  expiryDate?: string;
  paidAt?: string;
}
