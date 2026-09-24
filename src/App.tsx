import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Header } from './components/Header';
import { OperatorFilter } from './components/OperatorFilter';
import { BalanceCard } from './components/BalanceCard';
import { TransactionChart } from './components/TransactionChart';
import { TransactionList } from './components/TransactionList';
import { FloatingNewTxButton } from './components/FloatingNewTxButton';
import { BottomNav, TabType } from './components/BottomNav';
import { NewTransactionModal } from './components/NewTransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { TrialModal } from './components/TrialModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ClientsView } from './components/ClientsView';
import { CaisseView } from './components/CaisseView';
import { ProfilView } from './components/ProfilView';
import { PasserelleUVModal } from './components/PasserelleUVModal';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_CLIENTS,
  INITIAL_CAISSE,
  INITIAL_NOTIFICATIONS,
  INITIAL_UNIT_TRANSFERS,
} from './data/initialData';
import { Transaction, Client, CaisseBalances, NotificationItem, UnitTransfer, Operator, TransactionType } from './types';
import { exportTransactionsToPDF } from './utils/pdfExport';
import { ArrowDownLeft, ArrowUpRight, Smartphone, Wifi, Zap } from 'lucide-react';

export default function App() {
  // Local storage state initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cabine_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('cabine_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [caisse, setCaisse] = useState<CaisseBalances>(() => {
    const saved = localStorage.getItem('cabine_caisse');
    return saved ? JSON.parse(saved) : INITIAL_CAISSE;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('cabine_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(() => {
    const saved = localStorage.getItem('cabine_trial_days');
    return saved ? parseInt(saved, 10) : 30;
  });

  const [unitTransfers, setUnitTransfers] = useState<UnitTransfer[]>(() => {
    const saved = localStorage.getItem('cabine_unit_transfers');
    return saved ? JSON.parse(saved) : INITIAL_UNIT_TRANSFERS;
  });

  // Navigation & filters
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [selectedOperator, setSelectedOperator] = useState<string>('Tous');
  const [showAllTransactions, setShowAllTransactions] = useState<boolean>(false);

  // Modals & drawers
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [newTxInitialType, setNewTxInitialType] = useState<TransactionType>('Dépôt');

  const handleOpenNewTxModal = (type: TransactionType = 'Dépôt') => {
    setNewTxInitialType(type);
    setIsNewTxModalOpen(true);
  };

  const [isPasserelleOpen, setIsPasserelleOpen] = useState(false);
  const [passerelleTargetOp, setPasserelleTargetOp] = useState<Operator | undefined>(undefined);
  const [passerelleTab, setPasserelleTab] = useState<'swap' | 'cash_to_uv' | 'confrere' | 'uv_to_cash' | 'history'>('swap');

  const handleOpenPasserelle = (
    operator?: Operator,
    tab: 'swap' | 'cash_to_uv' | 'confrere' | 'uv_to_cash' | 'history' = 'swap'
  ) => {
    setPasserelleTargetOp(operator);
    setPasserelleTab(tab);
    setIsPasserelleOpen(true);
  };

  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cabine_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cabine_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('cabine_caisse', JSON.stringify(caisse));
  }, [caisse]);

  useEffect(() => {
    localStorage.setItem('cabine_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cabine_trial_days', trialDaysLeft.toString());
  }, [trialDaysLeft]);

  useEffect(() => {
    localStorage.setItem('cabine_unit_transfers', JSON.stringify(unitTransfers));
  }, [unitTransfers]);

  // Solde du jour calculation
  // Base solde du jour from screenshot is 1 245 000 FCFA
  // Let's compute delta based on transactions added beyond initial ones
  const initialNet = INITIAL_TRANSACTIONS.reduce((acc, t) => acc + t.amount, 0);
  const currentNet = transactions.reduce((acc, t) => acc + t.amount, 0);
  const soldeDuJour = 1245000 + (currentNet - initialNet);
  const totalOperations = 38 + (transactions.length - INITIAL_TRANSACTIONS.length);

  // Filtered transactions for the Home view
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedOperator === 'Tous') return true;
    return tx.operator === selectedOperator;
  });

  const displayedTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(0, 7);

  // Add new transaction handler
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'time' | 'date' | 'reference'>) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    const dateStr = now.toISOString().slice(0, 10);
    const randRef = Math.floor(1000 + Math.random() * 9000);
    const prefix = newTxData.operator.substring(0, 2).toUpperCase();

    const createdTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      time: timeStr,
      date: dateStr,
      reference: `${prefix}-${dateStr.replace(/-/g, '')}-${randRef}`,
    };

    setTransactions((prev) => [createdTx, ...prev]);

    // Update caisse balances
    setCaisse((prev) => {
      const isDeposit = newTxData.type !== 'Retrait';
      const absAmount = Math.abs(newTxData.amount);

      // In a deposit / unit transfer / pass internet: Cash in drawer increases (+), Operator UV decreases (-)
      // In a withdrawal: Cash in drawer decreases (-), Operator UV increases (+)
      const cashDelta = isDeposit ? absAmount : -absAmount;
      const uvDelta = isDeposit ? -absAmount : absAmount;

      const updated = { ...prev, cash: prev.cash + cashDelta };
      if (newTxData.operator === 'Orange') updated.orangeUV += uvDelta;
      if (newTxData.operator === 'MTN') updated.mtnUV += uvDelta;
      if (newTxData.operator === 'Moov') updated.moovUV += uvDelta;
      if (newTxData.operator === 'Wave') updated.waveUV += uvDelta;

      // Check if this transaction triggered a critical UV threshold
      try {
        const savedTh = localStorage.getItem('cabine_uv_thresholds');
        const th = savedTh ? JSON.parse(savedTh) : { orangeUV: 50000, mtnUV: 50000, moovUV: 100000, waveUV: 50000 };
        const opKey = newTxData.operator === 'Orange' ? 'orangeUV' : newTxData.operator === 'MTN' ? 'mtnUV' : newTxData.operator === 'Moov' ? 'moovUV' : 'waveUV';
        const newBalance = updated[opKey];
        const threshold = th[opKey] ?? 50000;

        if (newBalance <= threshold) {
          const alertNotif: NotificationItem = {
            id: `alert-stock-${Date.now()}`,
            title: `⚠️ Alerte Seuil Critique : ${newTxData.operator} UV`,
            message: `Le solde ${newTxData.operator} est tombé à ${newBalance.toLocaleString('fr-FR')} FCFA (seuil : ${threshold.toLocaleString('fr-FR')} FCFA). Rééquilibrez votre stock via la Passerelle UV.`,
            time: 'À l’instant',
            read: false,
            type: 'system',
          };
          setNotifications((curr) => [alertNotif, ...curr]);
        }
      } catch {
        // Ignore JSON error
      }

      return updated;
    });

    // Update or add client record
    setClients((prev) => {
      const existing = prev.find((c) => c.phone === newTxData.clientPhone || c.name === newTxData.clientName);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalTransactions: c.totalTransactions + 1,
                totalVolume: c.totalVolume + Math.abs(newTxData.amount),
                preferredOperator: newTxData.operator,
                lastActive: "Aujourd'hui à " + timeStr,
              }
            : c
        );
      } else {
        const newClient: Client = {
          id: `cl-${Date.now()}`,
          name: newTxData.clientName,
          phone: newTxData.clientPhone,
          totalTransactions: 1,
          totalVolume: Math.abs(newTxData.amount),
          preferredOperator: newTxData.operator,
          lastActive: "Aujourd'hui à " + timeStr,
        };
        return [newClient, ...prev];
      }
    });

    // Add a notification for commission earned
    let notifTitle = `${newTxData.type} ${newTxData.operator} validé`;
    let notifMsg = `${newTxData.clientName} : ${Math.abs(newTxData.amount).toLocaleString('fr-FR')} FCFA. Commission : +${newTxData.commission} FCFA`;
    if (newTxData.type === 'Pass Internet' && newTxData.bundleInfo?.volume) {
      notifTitle = `🌐 Pass Internet ${newTxData.operator} : ${newTxData.bundleInfo.volume}`;
      notifMsg = `${newTxData.clientName} (${newTxData.clientPhone}) • ${Math.abs(newTxData.amount).toLocaleString('fr-FR')} FCFA. Commission : +${newTxData.commission} FCFA`;
    } else if (newTxData.type === 'Transfert d’unités') {
      notifTitle = `📞 Recharge Unités ${newTxData.operator} : ${Math.abs(newTxData.amount).toLocaleString('fr-FR')} FCFA`;
      notifMsg = `Crédit envoyé à ${newTxData.clientName} (${newTxData.clientPhone}). Commission : +${newTxData.commission} FCFA`;
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMsg,
      time: 'À l’instant',
      read: false,
      type: 'transaction',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Select this transaction to display ticket
    setSelectedTxForDetail(createdTx);
  };

  // Passerelle Unit Transfer handler
  const handleExecuteTransfer = (transferData: Omit<UnitTransfer, 'id' | 'timestamp' | 'date' | 'reference' | 'status'>) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    const dateStr = now.toISOString().slice(0, 10);
    const randRef = Math.floor(1000 + Math.random() * 9000);
    const reference = `PASS-${dateStr.replace(/-/g, '')}-${randRef}`;
    const amt = transferData.amount;

    const newTransfer: UnitTransfer = {
      ...transferData,
      id: `tr-${Date.now()}`,
      timestamp: timeStr,
      date: dateStr,
      reference,
      status: 'Complété',
    };

    setUnitTransfers((prev) => [newTransfer, ...prev]);

    // Update caisse balances
    setCaisse((prev) => {
      const updated = { ...prev };
      const amt = transferData.amount;
      const netTarget = amt - (transferData.fee || 0);

      if (transferData.transferKind === 'inter_operator') {
        if (transferData.sourceOperator === 'Orange') updated.orangeUV -= amt;
        else if (transferData.sourceOperator === 'MTN') updated.mtnUV -= amt;
        else if (transferData.sourceOperator === 'Moov') updated.moovUV -= amt;
        else if (transferData.sourceOperator === 'Wave') updated.waveUV -= amt;

        if (transferData.targetOperator === 'Orange') updated.orangeUV += netTarget;
        else if (transferData.targetOperator === 'MTN') updated.mtnUV += netTarget;
        else if (transferData.targetOperator === 'Moov') updated.moovUV += netTarget;
        else if (transferData.targetOperator === 'Wave') updated.waveUV += netTarget;
      } else if (transferData.transferKind === 'supply_cash_to_uv') {
        updated.cash -= amt;
        if (transferData.targetOperator === 'Orange') updated.orangeUV += netTarget;
        else if (transferData.targetOperator === 'MTN') updated.mtnUV += netTarget;
        else if (transferData.targetOperator === 'Moov') updated.moovUV += netTarget;
        else if (transferData.targetOperator === 'Wave') updated.waveUV += netTarget;
      } else if (transferData.transferKind === 'uv_to_cash') {
        if (transferData.sourceOperator === 'Orange') updated.orangeUV -= amt;
        else if (transferData.sourceOperator === 'MTN') updated.mtnUV -= amt;
        else if (transferData.sourceOperator === 'Moov') updated.moovUV -= amt;
        else if (transferData.sourceOperator === 'Wave') updated.waveUV -= amt;
        updated.cash += netTarget;
      } else if (transferData.transferKind === 'p2p_confrere') {
        const totalDebit = amt + (transferData.fee || 0);
        if (transferData.sourceOperator === 'Orange') updated.orangeUV -= totalDebit;
        else if (transferData.sourceOperator === 'MTN') updated.mtnUV -= totalDebit;
        else if (transferData.sourceOperator === 'Moov') updated.moovUV -= totalDebit;
        else if (transferData.sourceOperator === 'Wave') updated.waveUV -= totalDebit;
      }

      return updated;
    });

    // Notify user
    const notifMsg =
      transferData.transferKind === 'inter_operator'
        ? `Passerelle : ${transferData.sourceOperator} UV ➔ ${transferData.targetOperator} UV (${amt.toLocaleString('fr-FR')} FCFA)`
        : transferData.transferKind === 'supply_cash_to_uv'
        ? `Rechargement ${transferData.targetOperator} UV de ${amt.toLocaleString('fr-FR')} FCFA validé`
        : transferData.transferKind === 'p2p_confrere'
        ? `Dépannage confrère : ${amt.toLocaleString('fr-FR')} FCFA envoyés`
        : `Délestage ${transferData.sourceOperator} UV vers Espèces validé`;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Transfert d’unités réussi',
        message: notifMsg,
        time: 'À l’instant',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);
  };

  // Delete transaction handler
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Add client handler
  const handleAddClient = (clientData: Omit<Client, 'id' | 'totalTransactions' | 'totalVolume' | 'lastActive'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cl-${Date.now()}`,
      totalTransactions: 0,
      totalVolume: 0,
      lastActive: 'Nouveau',
    };
    setClients((prev) => [newClient, ...prev]);
  };

  // Reset to initial mock data
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setClients(INITIAL_CLIENTS);
    setCaisse(INITIAL_CAISSE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUnitTransfers(INITIAL_UNIT_TRANSFERS);
    setTrialDaysLeft(30);
    setSelectedOperator('Tous');
    setShowAllTransactions(false);
    localStorage.clear();
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hasUnreadNotifs = notifications.some((n) => !n.read);

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onResetData={handleResetData}
      onOpenTrial={() => setIsTrialModalOpen(true)}
      trialDaysLeft={trialDaysLeft}
      onNewTransaction={() => setIsNewTxModalOpen(true)}
      onOpenPasserelle={() => handleOpenPasserelle()}
      hasUnreadNotifs={hasUnreadNotifs}
      onOpenNotifications={() => setIsNotifDrawerOpen(true)}
      caisse={caisse}
      clientsCount={clients.length}
    >
      <div className="flex-1 flex flex-col justify-between">
        {/* Active Tab View */}
        <div className="flex-1">
          {activeTab === 'accueil' && (
            <div className="flex flex-col gap-3">
              {/* Header: Bonjour Ibrahim + Notification bell + 1 month trial prompt */}
              <Header
                userName="Ibrahim"
                subtitle="Votre cabine, plus proche de vos clients"
                hasUnreadNotifs={hasUnreadNotifs}
                onOpenNotifications={() => setIsNotifDrawerOpen(true)}
                onOpenTrial={() => setIsTrialModalOpen(true)}
                trialDaysLeft={trialDaysLeft}
                onNewTransaction={() => setIsNewTxModalOpen(true)}
                onOpenPasserelle={() => handleOpenPasserelle()}
              />

              {/* Responsive Dashboard Grid for Accueil */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                {/* Left Column on Desktop / Full Screen */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  {/* Operator Filter: Tous, Orange, MTN, Moov, Wave */}
                  <OperatorFilter
                    selectedOperator={selectedOperator}
                    onSelectOperator={setSelectedOperator}
                  />

                  {/* Solde du jour Card */}
                  <BalanceCard
                    totalBalance={soldeDuJour}
                    totalOperations={totalOperations}
                    growthPercentage={12}
                    onOpenCaisseModal={() => setActiveTab('caisse')}
                  />

                  {/* Guichet Quick Services Bar */}
                  <div className="px-1 sm:px-0 py-1">
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleOpenNewTxModal('Dépôt')}
                        className="py-2.5 px-2 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-emerald-500/30 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center transition">
                          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Dépôt</span>
                      </button>

                      <button
                        onClick={() => handleOpenNewTxModal('Retrait')}
                        className="py-2.5 px-2 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-orange-500/30 hover:border-orange-500/60 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-500/15 group-hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition">
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Retrait</span>
                      </button>

                      <button
                        onClick={() => handleOpenNewTxModal('Transfert d’unités')}
                        className="py-2.5 px-2 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-sky-500/30 hover:border-sky-500/60 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-xl bg-sky-500/15 group-hover:bg-sky-500/25 text-sky-400 flex items-center justify-center transition">
                          <Smartphone className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Unités</span>
                      </button>

                      <button
                        onClick={() => handleOpenNewTxModal('Pass Internet')}
                        className="py-2.5 px-2 rounded-2xl bg-[#11233D] hover:bg-[#162D4E] border border-purple-500/30 hover:border-purple-500/60 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 group-hover:bg-purple-500/25 text-purple-400 flex items-center justify-center transition">
                          <Wifi className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Pass Net</span>
                      </button>
                    </div>
                  </div>

                  {/* 7-Day Evolution Recharts Component */}
                  <TransactionChart transactions={transactions} />
                </div>

                {/* Right Column on Desktop / Full Screen */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {/* Desktop Quick Actions Card */}
                  <div className="hidden lg:block px-1 sm:px-0 py-1">
                    <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/60 shadow-lg">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Services & Actions Guichet
                        </h3>
                        <span className="text-[10px] text-orange-400 font-bold px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30">
                          Accès direct
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenNewTxModal('Dépôt')}
                          className="py-3 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 col-span-2"
                        >
                          <span>+ Nouvelle Transaction</span>
                        </button>
                        <button
                          onClick={() => handleOpenNewTxModal('Transfert d’unités')}
                          className="py-2.5 px-3 rounded-xl bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 text-sky-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Recharge Unités</span>
                        </button>
                        <button
                          onClick={() => handleOpenNewTxModal('Pass Internet')}
                          className="py-2.5 px-3 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Wifi className="w-3.5 h-3.5" />
                          <span>Pass Internet</span>
                        </button>
                        <button
                          onClick={() => handleOpenPasserelle()}
                          className="py-2.5 px-3 rounded-xl bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/25 text-orange-400 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Passerelle UV</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('caisse')}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
                        >
                          Clôture Caisse
                        </button>
                        <button
                          onClick={() => {
                            exportTransactionsToPDF(
                              filteredTransactions,
                              { title: 'Journal des Transactions Mobile Money' },
                              caisse
                            );
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 font-semibold text-xs transition cursor-pointer col-span-2"
                        >
                          Exporter PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transactions List */}
                  <TransactionList
                    transactions={displayedTransactions}
                    onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
                    onViewAll={() => setShowAllTransactions(!showAllTransactions)}
                    showAll={showAllTransactions}
                    onExportPDF={() => {
                      exportTransactionsToPDF(
                        filteredTransactions,
                        {
                          title: selectedOperator === 'Tous'
                            ? 'Journal des Transactions Mobile Money'
                            : `Transactions ${selectedOperator}`,
                        },
                        caisse
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              onAddClient={handleAddClient}
              onSelectClientForTx={(client) => {
                handleOpenNewTxModal('Dépôt');
              }}
            />
          )}

          {activeTab === 'caisse' && (
            <CaisseView
              caisse={caisse}
              onUpdateBalances={setCaisse}
              transactions={transactions}
              onOpenTrial={() => setIsTrialModalOpen(true)}
              onOpenPasserelle={handleOpenPasserelle}
            />
          )}

          {activeTab === 'profil' && (
            <ProfilView
              onOpenTrial={() => setIsTrialModalOpen(true)}
              trialDaysLeft={trialDaysLeft}
              transactions={transactions}
              onResetData={handleResetData}
              caisse={caisse}
            />
          )}
        </div>

        {/* Floating Action Button for New Transaction (on mobile Accueil & Caisse tabs) */}
        {(activeTab === 'accueil' || activeTab === 'caisse') && (
          <div className="md:hidden">
            <FloatingNewTxButton onClick={() => handleOpenNewTxModal('Dépôt')} />
          </div>
        )}

        {/* Bottom Navigation (mobile only) */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Modals & Slide-overs */}
      {isPasserelleOpen && (
        <PasserelleUVModal
          isOpen={isPasserelleOpen}
          onClose={() => setIsPasserelleOpen(false)}
          caisse={caisse}
          onExecuteTransfer={handleExecuteTransfer}
          history={unitTransfers}
          initialTargetOperator={passerelleTargetOp}
          initialTab={passerelleTab}
        />
      )}

      {isNewTxModalOpen && (
        <NewTransactionModal
          isOpen={isNewTxModalOpen}
          onClose={() => setIsNewTxModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          clients={clients}
          initialType={newTxInitialType}
        />
      )}

      {selectedTxForDetail && (
        <TransactionDetailModal
          transaction={selectedTxForDetail}
          isOpen={!!selectedTxForDetail}
          onClose={() => setSelectedTxForDetail(null)}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {isTrialModalOpen && (
        <TrialModal
          isOpen={isTrialModalOpen}
          onClose={() => setIsTrialModalOpen(false)}
          trialDaysLeft={trialDaysLeft}
          onUpgrade={(plan) => {
            // simulation
          }}
        />
      )}

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />
    </AppLayout>
  );
}
