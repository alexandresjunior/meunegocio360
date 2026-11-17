import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} | MeuNegocio360`;
  }, [title]);
}
