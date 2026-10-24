import React from 'react';
import { LedgerEntry, Party } from '../types';
import { formatPKR } from '../services/formatters';
import { StampSeal } from './StampSeal';
import { useApp } from '../context/AppContext';
import { Volume2 } from 'lucide-react';

interface PaperLedgerTableProps {
  entries: LedgerEntry[];
  selectedParty?: Party;
  onReadAloud?: () => void;
}

export const PaperLedgerTable: React.FC<PaperLedgerTableProps> = ({
  entries,
  selectedParty,
  onReadAloud,
}) => {
  const { language, t, speak } = useApp();

  const totalDebit = entries.reduce((sum, e) => sum + e.debitPKR, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.creditPKR, 0);
  const netBalance = selectedParty ? selectedParty.currentBalance : totalCredit - totalDebit;

  const handleRead = () => {
    if (onReadAloud) {
      onReadAloud();
      return;
    }
    const partyName = selectedParty ? selectedParty.nameUr || selectedParty.name : 'تمام کھاتے';
    const statusText =
      netBalance > 0
        ? `ہم نے ${formatPKR(netBalance, 'ur')} دینے ہیں`
        : netBalance < 0
        ? `ہم نے ${formatPKR(Math.abs(netBalance), 'ur')} لینے ہیں`
        : 'حساب برابر ہے';

    const urduSpeech = `بہی کھاتہ۔ کھاتہ دار ${partyName}۔ کل بنام رقم ${formatPKR(
      totalDebit,
      'ur'
    )}۔ کل جمع رقم ${formatPKR(totalCredit, 'ur')}۔ موجودہ بقایا: ${statusText}۔`;

    const romanSpeech = `Bahi Khata. Party ${partyName}. Kul Banaam ${totalDebit}. Kul Jamma ${totalCredit}. Baqaya: ${statusText}.`;
    speak(urduSpeech, romanSpeech);
  };

  return (
    <div className="parchment-slip rounded-2xl border-2 border-red-300 p-4 sm:p-6 shadow-md my-4">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-stone-800 gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold">
            بہی کھاتہ منڈی حساب رجسٹر
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-urdu text-stone-900">
            {selectedParty ? selectedParty.nameUr || selectedParty.name : t.khata.allParties}
          </h3>
          {selectedParty && (
            <p className="text-xs text-stone-600 mt-0.5">
              {selectedParty.village} · <bdi dir="ltr">{selectedParty.phone}</bdi>
            </p>
          )}
        </div>

        <button
          onClick={handleRead}
          type="button"
          className="self-start sm:self-center min-h-[44px] px-3.5 py-2 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{t.actions.listenAudio}</span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="my-3 overflow-x-auto">
        <table className="w-full text-start text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-red-50 border-y-2 border-stone-800 text-stone-900 font-bold">
              <th className="py-2.5 px-2 text-start w-24">{t.khata.entryDate}</th>
              <th className="py-2.5 px-2 text-start">{t.khata.description}</th>
              <th className="py-2.5 px-2 text-end text-rose-900 bg-rose-50/80 w-28 sm:w-36">
                {t.khata.debit}
              </th>
              <th className="py-2.5 px-2 text-end text-emerald-900 bg-emerald-50/80 w-28 sm:w-36">
                {t.khata.credit}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-200 font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-stone-500 text-sm">
                  کوئی اندراج موجود نہیں ہے۔
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-amber-50/60 transition-colors">
                  <td className="py-2.5 px-2 font-mono whitespace-nowrap text-stone-700">
                    <bdi dir="ltr">{entry.date}</bdi>
                  </td>
                  <td className="py-2.5 px-2 text-stone-900">
                    <div>{entry.description}</div>
                    {!selectedParty && (
                      <span className="text-[11px] text-stone-500 font-bold">{entry.partyName}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-end font-mono font-bold text-rose-800 bg-rose-50/40 whitespace-nowrap">
                    {entry.debitPKR > 0 ? (
                      <bdi dir="ltr">{formatPKR(entry.debitPKR, language)}</bdi>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-end font-mono font-bold text-emerald-800 bg-emerald-50/40 whitespace-nowrap">
                    {entry.creditPKR > 0 ? (
                      <bdi dir="ltr">{formatPKR(entry.creditPKR, language)}</bdi>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-amber-100/90 border-t-2 border-stone-800 font-bold text-xs sm:text-sm">
              <td colSpan={2} className="py-2.5 px-2 text-start font-urdu text-stone-900">
                میزان ٹوٹل (Total Tally)
              </td>
              <td className="py-2.5 px-2 text-end font-mono text-rose-900 bg-rose-100/70">
                <bdi dir="ltr">{formatPKR(totalDebit, language)}</bdi>
              </td>
              <td className="py-2.5 px-2 text-end font-mono text-emerald-900 bg-emerald-100/70">
                <bdi dir="ltr">{formatPKR(totalCredit, language)}</bdi>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Box & Authentic Verified Seal */}
      <div className="mt-4 pt-3 border-t-2 border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-amber-100/70 p-3.5 rounded-xl border border-amber-300 flex-1">
          <span className="text-xs text-stone-600 font-bold block">{t.khata.balance}</span>
          <div className="text-xl sm:text-2xl font-bold font-mono mt-0.5">
            <bdi dir="ltr" className={netBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}>
              {formatPKR(Math.abs(netBalance), language)}
            </bdi>
          </div>
          <span
            className={`text-xs font-bold mt-1 inline-block ${
              netBalance > 0 ? 'text-emerald-800' : netBalance < 0 ? 'text-rose-800' : 'text-stone-600'
            }`}
          >
            {netBalance > 0 ? t.khata.youOwe : netBalance < 0 ? t.khata.theyOwe : t.khata.clearBalance}
          </span>
        </div>

        <div className="self-center">
          <StampSeal date={new Date().toLocaleDateString('en-GB')} color="indigo" label={t.khata.statementStamp} />
        </div>
      </div>
    </div>
  );
};
