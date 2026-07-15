import { createContext, useContext, type ReactNode } from "react";
import type { TenantConfig } from "../../types/tenant";

interface TenantContextValue {
  tenant: TenantConfig | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  tenant: TenantConfig | null;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
}

export function TenantProvider({
  tenant,
  loading = false,
  error = null,
  children,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (ctx === null) {
    throw new Error("useTenant 必须在 TenantProvider 内使用");
  }
  return ctx;
}
