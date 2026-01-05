import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { getProgress, getXpForNextLevel } from '../lib/progress';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = 'Linux System Programming' }: LayoutProps) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const progress = getProgress();
    setXp(progress.xp);
    setLevel(progress.level);
  }, []);

  const xpInfo = getXpForNextLevel(xp);
  const xpPercent = Math.round((xpInfo.current / xpInfo.required) * 100);

  return (
    <>
      <Head>
        <title>{title} | Live Linux Manual</title>
        <meta name="description" content="Interactive Linux System Programming learning platform based on Michael Kerrisk's course" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* CDN Resources */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <div className="min-h-screen bg-bauhaus-white">
        <header className="border-b-4 border-bauhaus-black">
          <div className="container mx-auto px-6">
            <nav className="flex items-center justify-between py-4">
              <div className="flex items-center gap-8">
                <a href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bauhaus-red flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span className="font-bold text-xl tracking-wider uppercase">
                    Linux SysProg
                  </span>
                </a>
                <div className="hidden md:flex items-center gap-6">
                  <NavLink href="/">Learn</NavLink>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/reference">Reference</NavLink>
                  <NavLink href="/signals">Signals</NavLink>
                  <NavLink href="/strace">strace</NavLink>
                  <NavLink href="/exercises">Exercises</NavLink>
                </div>
              </div>
              
              {/* User progress indicator */}
              <div className="flex items-center gap-4">
                <a href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {/* Level badge */}
                  <div className="w-8 h-8 bg-bauhaus-blue flex items-center justify-center text-white font-bold text-sm">
                    {level}
                  </div>
                  {/* XP bar */}
                  <div className="hidden sm:block w-24">
                    <div className="h-2 bg-bauhaus-gray">
                      <div 
                        className="h-full bg-bauhaus-yellow transition-all"
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-bauhaus-dark-gray mt-0.5">
                      {xp} XP
                    </div>
                  </div>
                </a>
                {/* Bauhaus decorative elements */}
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-3 h-3 bg-bauhaus-red"></div>
                  <div className="w-3 h-3 bg-bauhaus-yellow rounded-full"></div>
                  <div className="w-3 h-3 bg-bauhaus-blue"></div>
                </div>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        
        {/* Footer */}
        <footer className="border-t-4 border-bauhaus-black mt-8">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-bauhaus-red"></div>
                  <div className="w-4 h-4 bg-bauhaus-blue"></div>
                  <div className="w-4 h-4 bg-bauhaus-yellow"></div>
                </div>
                <span className="text-sm text-bauhaus-dark-gray">
                  Based on Michael Kerrisk's Linux System Programming Essentials
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a 
                  href="https://man7.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bauhaus-dark-gray hover:text-bauhaus-blue transition-colors"
                >
                  man7.org
                </a>
                <a 
                  href="https://github.com/guglxni/livelinuxmanual" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bauhaus-dark-gray hover:text-bauhaus-blue transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
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
