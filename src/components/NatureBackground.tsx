import React from 'react';

export const NatureBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden bg-eco-cream">
            {/* Sky Gradient */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-eco-peach/40 to-transparent opacity-80" />

            {/* Back Mountain (Purple) */}
            <svg className="absolute bottom-0 left-0 w-full h-[60vh] text-eco-lavender opacity-30" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>

            {/* Middle Mountain (Darker Purple) */}
            <svg className="absolute bottom-0 left-0 w-full h-[50vh] text-eco-purple opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>

            {/* Front Hill (Green/Forest) - Stylized as an overlay at bottom right or organic curve */}
            <svg className="absolute -bottom-10 right-0 w-[80vw] h-[60vh] text-eco-forest opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path fill="currentColor" fillOpacity="1" d="M0,192L60,197.3C120,203,240,213,360,208C480,203,600,181,720,170.7C840,160,960,160,1080,181.3C1200,203,1320,245,1380,266.7L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>

            {/* Decorative Circle (Sun/Moon abstract) */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-eco-peach rounded-full blur-3xl opacity-40"></div>
        </div>
    );
};
