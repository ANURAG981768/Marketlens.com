"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}
interface State {
  hasError: boolean;
}

/*
 * A lightweight error boundary placed around each major section. If anything
 * inside it throws while rendering, only that section shows a small, calm
 * fallback — the rest of the page keeps working. This is what turns a single
 * component bug into a contained blip instead of a whole-app white screen.
 */
export default class SafeSection extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Log for debugging; never re-throw (that would crash the tree we're guarding).
    console.error(`[SafeSection${this.props.label ? ` · ${this.props.label}` : ""}]`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-6 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
            {this.props.label ? `Couldn't load ${this.props.label}` : "This section couldn't load"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Your data is safe — refresh the page to try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
