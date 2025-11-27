

const Background = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gray-900">
            {/* Nature Image Background */}
            <img
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
                alt="Background Nature"
                className="w-full h-full object-cover opacity-90"
            />

            {/* Overlay gradient to ensure text/card readability if needed, though the card is white */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>
    );
};

export default Background;
