'use client';


import { useEffect } from 'react';

export const SmartlookProvider = () => {
    useEffect(() => {
        (async () => {
            if (typeof window === 'undefined') return;

            const Smartlook = (await import('smartlook-client')).default;

            if (!Smartlook.initialized()) {
                Smartlook.init('4693cdebeca145c64b028916a6ff32a940f731b6', {
                    region: 'eu',
                });
            }
        })();
    }, []);

    return null;
};
