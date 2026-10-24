import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📜',
}) => {
  return (
    <div className="parchment-slip rounded-2xl border-2 border-dashed border-amber-300 p-8 my-6 text-center max-w-lg mx-auto shadow-sm">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-4xl shadow-inner mb-4">
        {icon}
      </div>
      <h4 className="text-xl font-bold font-urdu text-stone-900">{title}</h4>
      <p className="text-sm text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            type="button"
            className="min-h-[56px] px-6 py-3 bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold rounded-2xl text-base shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
