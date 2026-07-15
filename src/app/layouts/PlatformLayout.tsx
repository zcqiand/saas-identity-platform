import { type ReactNode } from "react";
import { NavLink } from "react-router";

interface NavItem {
  to: string;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/platform/tenants", label: "租户管理" },
  { to: "/platform/apps", label: "应用管理" },
  { to: "/platform/open-platform", label: "开放平台" },
  { to: "/platform/config", label: "平台配置" },
];

interface PlatformLayoutProps {
  children?: ReactNode;
}

export function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-slate-800 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-base font-bold">平台管理</h1>
          <p className="text-xs text-white/60">SaaS IAM</p>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? "text-white bg-slate-700"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  );
}
