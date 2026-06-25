"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  /** Classes for the centered panel (card) itself. */
  panelClassName?: string;
  /** Backdrop dim. */
  backdropClassName?: string;
  /** Whether clicking the dimmed backdrop closes the modal (default true). */
  closeOnBackdrop?: boolean;
}

/*
 * One hardened modal for the whole app. It fixes the class of bugs we kept
 * hitting one at a time:
 *  - Renders through a PORTAL into <body>, so a transformed/blurred ancestor
 *    (e.g. the frosted header) can't trap `position: fixed` and stop it covering
 *    the screen.
 *  - The backdrop scrolls (`overflow-y-auto` + `min-h-full`), so a tall card —
 *    or the on-screen keyboard on a phone — never clips the top or the buttons.
 *  - Escape closes it, and body scroll is locked while it's open.
 */
export default function Modal({
  onClose,
  children,
  panelClassName = "",
  backdropClassName = "bg-black/60",
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] overflow-y-auto ${backdropClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
