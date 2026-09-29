import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-stone-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
