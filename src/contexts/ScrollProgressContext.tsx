import React, { createContext, useContext, useEffect, useState } from 'react';

const ScrollProgressContext = createContext(0);

export const ScrollProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <ScrollProgressContext.Provider value={scrollProgress}>
            {children}
        </ScrollProgressContext.Provider>
    );
};

export const useScrollProgress = () => {
    return useContext(ScrollProgressContext);
};