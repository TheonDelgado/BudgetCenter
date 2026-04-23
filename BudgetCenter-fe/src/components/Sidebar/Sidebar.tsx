'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { type ReactNode, useState } from 'react';
import "./Sidebar.css"

const navItems = [
    {
        href: '/',
        label: 'Home',
        icon: 'icon-[tabler--home]',
    },
    {
        href: '/accounts',
        label: 'Accounts',
        icon: 'icon-[tabler--user]',
    },
    {
        href: '/budgets',
        label: 'Budgets',
        icon: 'icon-[tabler--moneybag]'
    }
];

export default function Sidebar({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

    return (
        <div className='relative h-screen overflow-hidden bg-white'>
            {isMobileOpen ? (
                <button
                    type='button'
                    aria-label='Close sidebar backdrop'
                    className='fixed inset-0 z-30 bg-base-content/30 lg:hidden'
                    onClick={() => setIsMobileOpen(false)}
                />
            ) : null}

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-40 flex overflow-hidden bg-cyan-900 transition-all duration-300',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                    isDesktopExpanded ? 'lg:w-64' : 'lg:w-20',
                    'w-64 lg:translate-x-0',
                ].join(' ')}
            >
                <div className='flex w-full flex-col px-3 py-4'>
                    <div className='mb-6 flex min-h-10 items-center px-2'>
                        <span
                            className={[
                                'overflow-hidden whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-base-content/70 transition-all duration-200',
                                isDesktopExpanded ? 'lg:max-w-40 lg:opacity-100' : 'lg:max-w-0 lg:opacity-0',
                            ].join(' ')}
                        >
                            BudgetCenter
                        </span>
                    </div>

                    <nav className='menu gap-1 p-0'>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={[
                                        'flex items-center gap-3 rounded-box px-3 py-2 text-sm transition-colors duration-200',
                                        isActive
                                            ? 'bg-base-content/10 text-base-content'
                                            : 'text-base-content/70 hover:bg-base-content/5 hover:text-base-content',
                                        !isDesktopExpanded ? 'lg:justify-center' : '',
                                    ].join(' ')}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span className={`${item.icon} size-5 shrink-0`} aria-hidden='true' />
                                    <span className={isDesktopExpanded ? 'lg:block' : 'lg:hidden'}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

            </aside>

            <button
                type='button'
                className={[
                    'absolute top-1/2 z-50 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
                    'bg-transparent transition-[left,border-color,color,transform] duration-300 ease-in-out',
                    'ml-4',
                    isDesktopExpanded ? 'lg:left-64' : 'lg:left-20',
                    'lg:inline-flex',
                ].join(' ')}
                aria-label={isDesktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                onClick={() => setIsDesktopExpanded((value) => !value)}
            >
                <span
                    className={[
                        'size-8',
                        isDesktopExpanded ? 'icon-[tabler--arrow-bar-to-left]' : 'icon-[tabler--arrow-bar-right]',
                    ].join(' ')}
                    aria-hidden='true'
                    style={{color: '#104e64'}}
                />
            </button>

            <div
                className={[
                    'relative flex h-screen flex-col transition-[padding] duration-300',
                    isDesktopExpanded ? 'lg:pl-64' : 'lg:pl-20',
                ].join(' ')}
            >
                <button
                    type='button'
                    className='btn btn-text btn-square absolute left-4 top-4 z-20 lg:hidden'
                    aria-label='Open sidebar'
                    onClick={() => setIsMobileOpen(true)}
                >
                    <span className='icon-[tabler--menu-2] size-5' aria-hidden='true' />
                </button>

                <main className='main flex-1 overflow-auto'>{children}</main>
            </div>
        </div>
    );
}