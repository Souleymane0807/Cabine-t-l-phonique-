import React, { useState } from 'react';
import { Search, UserPlus, Phone, MessageSquare, ArrowUpRight, Check } from 'lucide-react';
import { Client, Operator } from '../types';
import { getInitials, getOperatorConfig, formatFCFA } from '../utils/helpers';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (newClient: Omit<Client, 'id' | 'totalTransactions' | 'totalVolume' | 'lastActive'>) => void;
  onSelectClientForTx?: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onSelectClientForTx
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [operator, setOperator] = useState<Operator>('Orange');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddClient({
      name: name.trim(),
      phone: phone.trim() || '+225 00 00 00 00 00',
      preferredOperator: operator,
    });
    setName('');
    setPhone('+225 ');
    setShowAddModal(false);
  };

  return (
    <div className="px-4 sm:px-5 py-3 flex flex-col gap-3 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Répertoire Clients</h2>
          <p className="text-xs text-slate-400">
            {clients.length} clients enregistrés dans votre cabine
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition cursor-pointer lg:hidden active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-5">
        {/* Left Column: Search & List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou numéro..."
              className="w-full bg-[#11233D] border border-slate-700/70 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Client List */}
          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-[#11233D]/40 rounded-2xl border border-slate-800">
                <p className="text-xs">Aucun client correspondant à votre recherche.</p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const config = getOperatorConfig(client.preferredOperator);

                return (
                  <div
                    key={client.id}
                    className="w-full bg-[#11233D] border border-slate-700/50 hover:border-slate-600 rounded-2xl p-3 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#1A3254] border border-slate-600/40 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                        {getInitials(client.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">
                          {client.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 truncate">
                          <span className="flex items-center gap-1 shrink-0">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: config.dotColor }}
                            ></span>
                            <span className="text-slate-300">{client.preferredOperator}</span>
                          </span>
                          <span>·</span>
                          <span className="truncate">{client.totalTransactions} opérations</span>
                        </div>
                      </div>
                    </div>

                    {/* Fast actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectClientForTx && (
                        <button
                          onClick={() => onSelectClientForTx(client)}
                          title="Faire une transaction avec ce client"
                          className="p-2 rounded-xl bg-orange-500/15 text-orange-400 hover:bg-orange-500 hover:text-white transition cursor-pointer active:scale-95"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition cursor-pointer active:scale-95"
                        title="Envoyer un WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${client.phone}`}
                        className="p-2 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition cursor-pointer active:scale-95"
                        title="Appeler le client"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column on Desktop: Inline Add Client Form */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="p-4 rounded-2xl bg-[#11233D] border border-slate-700/60 shadow-lg sticky top-4">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span>Ajouter un Nouveau Client</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enregistrez rapidement les coordonnées de vos clients réguliers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Nom & Prénoms
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bakary Coulibaly"
                  required
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  required
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Réseau Mobile Money préféré
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as Operator)}
                  className="w-full bg-[#0D1E36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Orange">Orange Money</option>
                  <option value="MTN">MTN MoMo</option>
                  <option value="Moov">Moov Money</option>
                  <option value="Wave">Wave</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Enregistrer le client</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-sm bg-[#0D1E36] border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Mobile pull handle */}
            <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto mb-3 sm:hidden shrink-0"></div>

            <h3 className="text-base font-bold text-white mb-1">Nouveau Client</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enregistrer les coordonnées pour les prochains reçus
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Nom & Prénoms
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bakary Coulibaly"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  required
                  className="w-full bg-[#11233D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Opérateur habituel
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Orange', 'MTN', 'Moov', 'Wave'] as Operator[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                        operator === op
                          ? 'border-orange-500 bg-orange-500/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
