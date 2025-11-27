
import logo from '../../assets/logo.png';

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src={logo}
                alt="Ville de Val-d'Or"
                className="h-24 w-auto object-contain"
            />
        </div>
    );
};
