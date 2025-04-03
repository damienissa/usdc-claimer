'use client';

import Smartlook from 'smartlook-client';

export const SmartlookProvider = () => {
    if (Smartlook.initialized() === false) {
        Smartlook.init('4693cdebeca145c64b028916a6ff32a940f731b6');
    }

    // useEffect(() => {
    //     if (typeof window !== 'undefined' && !window.smartlook) {
    //         (function (d) {
    //             const o = (window.smartlook = function (...args: any[]) {
    //                 (o as any).api.push(args);
    //             });
    //             const h = d.getElementsByTagName('head')[0];
    //             const c = d.createElement('script');
    //             (o as any).api = [];
    //             c.async = true;
    //             c.type = 'text/javascript';
    //             c.charset = 'utf-8';
    //             c.src = 'https://web-sdk.smartlook.com/recorder.js';
    //             h.appendChild(c);
    //         })(document);

    //         window.smartlook('init', '4693cdebeca145c64b028916a6ff32a940f731b6', {
    //             region: 'eu',
    //         });
    //     }
    // }, []);

    return null;
};
