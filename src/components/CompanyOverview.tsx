"use client";

import type { CompanyProfile } from "@/lib/types";
import { ExternalLink, Calendar } from "lucide-react";

interface Props {
  profile: CompanyProfile;
}

export default function CompanyOverview({ profile }: Props) {
  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        About
      </h3>
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] mb-4 line-clamp-4">
        {profile.description}
      </p>
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-muted)]">CEO</span>
          <span className="text-[var(--color-text-secondary)]">
            {profile.ceo}
          </span>
        </div>
        {profile.ipoDate && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">IPO Date</span>
            <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
              <Calendar size={11} />
              {profile.ipoDate}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-muted)]">Beta</span>
          <span className="text-[var(--color-text-secondary)]">
            {profile.beta.toFixed(2)}
          </span>
        </div>
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--color-brand)] hover:underline pt-1"
          >
            <ExternalLink size={11} /> {profile.website.replace(/https?:\/\/(www\.)?/, "")}
          </a>
        )}
      </div>
    </div>
  );
}
