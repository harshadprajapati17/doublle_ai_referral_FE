"use client";

import { useCallback, useEffect, useState } from "react";

import { ProgramTermsViewModal } from "@/components/referrals/program-terms-view-modal";
import type { ProgramTermsData } from "@/lib/referrals/types";

interface ProgramTermsModalHostProps {
  terms: ProgramTermsData;
}

/** Renders the read-only terms modal; opens from #program-terms links (e.g. hero “View terms”). */
export function ProgramTermsModalHost({ terms }: ProgramTermsModalHostProps) {
  const [open, setOpen] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
    if (window.location.hash === "#program-terms") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#program-terms") {
        setOpen(true);
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest('a[href="#program-terms"]');
      if (trigger) {
        event.preventDefault();
        setOpen(true);
      }
    };

    if (window.location.hash === "#program-terms") {
      setOpen(true);
    }

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return <ProgramTermsViewModal terms={terms} open={open} onClose={closeModal} />;
}
