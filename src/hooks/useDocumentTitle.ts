// src/hooks/useDocumentTitle.ts
import { useEffect } from "react";

const SITE_NAME = "Bazar-to-Ghar";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}