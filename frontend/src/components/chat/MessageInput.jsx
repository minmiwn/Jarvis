export default function MessageInput() {
    return (
        <div className="p-6 pt-0 z-10">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Message Jarvis..."
                    className="w-full bg-[#1a0b2e] border border-purple-800 text-white text-sm rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-purple-500 placeholder-gray-500 shadow-inner"
                />
                {/* Nút gửi */}
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}