import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bauhaus-white">
      <header className="border-b-4 border-bauhaus-black">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bauhaus-red"></div>
                <span className="font-bold text-xl tracking-wider uppercase">
                  Linux SysProg
                </span>
              </a>
              <div className="hidden md:flex items-center gap-6">
                <NavLink href="/">Learn</NavLink>
                <NavLink href="/reference">Reference</NavLink>
                <NavLink href="/signals">Signals</NavLink>
                <NavLink href="/strace">strace</NavLink>
                <NavLink href="/exercises">Exercises</NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-bauhaus-blue rounded-full"></div>
              <div className="w-6 h-6 bg-bauhaus-yellow"></div>
            </div>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-bauhaus-black font-medium hover:text-bauhaus-red transition-colors border-b-2 border-transparent hover:border-bauhaus-red pb-1"
    >
      {children}
    </a>
  );
}

export default Layout;
