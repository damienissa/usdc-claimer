'use client';

import Smartlook from 'smartlook-client';

export const SmartlookProvider = () => {
    if (Smartlook.initialized() === false) {
        Smartlook.init('4693cdebeca145c64b028916a6ff32a940f731b6');
    }

    return null;
};
