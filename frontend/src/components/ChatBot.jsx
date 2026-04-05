import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Search, Package, BookOpen, Coffee, Loader2, ShoppingBag } from 'lucide-react';
import { customerApi } from '../api/api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Chào mừng bạn trở lại! 👋 Hôm nay bạn muốn tìm loại trà nào hay cần kiểm tra đơn hàng?', suggestions: ["Trà Ô Long", "Trà Sen", "Bảng giá", "Tra cứu đơn hàng"] }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastProductId, setLastProductId] = useState(null);
    const [selectedWeights, setSelectedWeights] = useState({}); // Track weight per product: {productId: weightId}
    const messagesEndRef = useRef(null);
    const { addToCart } = useCart();
    const suggestions = [
        "Trà xanh Thái Nguyên", "Trà Ô long", "Cách pha trà ngon", "Liên hệ & Địa chỉ", "Chính sách giao hàng"
    ];

    const handleQuickAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        let targetWeight = null;
        if (product.selectedWeight) {
            targetWeight = product.selectedWeight;
        } else if (product.weights && product.weights.length > 0) {
            targetWeight = product.weights[0];
        }

        if (targetWeight) {
            addToCart(product, targetWeight, 1);
            
            // Show a temporary success message with a checkout link
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'bot',
                text: `Đã thêm **${product.name}** (${targetWeight.weight}g) vào giỏ hàng! 🛒✨`,
                isSystem: true,
                action: {
                    label: "THANH TOÁN NGAY →",
                    link: "/checkout"
                }
            }]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSuggest = (text) => {
        if (text === "Tra cứu đơn hàng") {
            setQuery("#");
            // Don't send yet, let user type the ID
        } else {
            setQuery(text);
            handleSend(null, text);
        }
    };

    const handleSend = async (e, forcedQuery) => {
        if (e) e.preventDefault();
        const finalQuery = forcedQuery || query;
        if (!finalQuery.trim() || isLoading) return; // Keep isLoading check

        const userMsg = { id: Date.now(), type: 'user', text: finalQuery };
        setMessages(prev => [...prev, userMsg]);
        if (!forcedQuery) setQuery(''); // Clear query only if not forced
        setIsLoading(true);

        try {
            // Remove natural feeling delay
            // await new Promise(resolve => setTimeout(resolve, 600));
            
            // Get user from localStorage if available
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser ? storedUser.id : null;

            // Use customerApi for the API call
            const response = await customerApi.searchChatbot(finalQuery, userId, lastProductId);
            
            const data = response.data;
            
            // Check if backend returned a specific message or needs a default
            const botText = data.message || "Dạ, tôi đã tìm thấy thông tin bạn cần:"; // Updated default message
            
            let botMsg = { 
                id: Date.now() + 1, 
                type: 'bot', 
                text: botText,
                suggestions: data.suggestions || [],
                reasoning: data.reasoning || null,
                hasMore: data.hasMore || false,
                total: data.total || 0,
                results: {
                    products: data.products || [],
                    blogs: data.blogs || [],
                    guides: data.guides || []
                }
            };
            
            // Update context if a product was found
            if (data.products && data.products.length > 0) {
                setLastProductId(data.products[0].id);
            }

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                type: 'bot', 
                text: "Xin lỗi, hệ thống trà đang bận một chút. Bạn thử lại sau nhé! 🍵" // Updated error message
            }]);
        } finally {
            setIsLoading(false);
            if (forcedQuery) setQuery(''); // Clear query if forced, moved here
        }
    };


    return (
        <div className="fixed bottom-6 right-6 z-[9999]"> {/* Original z-index was 9999, instruction had z-50 */}
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-all border-4 border-white/20"
                id="chatbot-toggle"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} // Updated initial
                        animate={{ opacity: 1, scale: 1, y: 0 }} // Updated animate
                        exit={{ opacity: 0, scale: 0.9, y: 20 }} // Updated exit
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] max-h-[70vh] h-[600px] bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-white/50" // Original class, instruction had a different one
                    >
                        {/* Header */}
                        <div className="bg-green-600 p-6 text-white relative overflow-hidden"> {/* Updated class */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div> {/* Added div */}
                            <div className="flex items-center justify-between relative z-10"> {/* Added div */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20"> {/* Updated class */}
                                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-[0_0_10px_white]"></div> {/* Added div */}
                                        <Search size={18} className="absolute text-white/80" /> {/* Updated icon */}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-base tracking-tight">WebTra AI Assistant</h3> {/* Updated text */}
                                        <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest">Đang trực tuyến</p> {/* Updated text */}
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors"> {/* Updated class */}
                                    <X size={20} /> {/* Updated icon size */}
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar scroll-smooth"> {/* Updated class */}
                            {messages.map((msg) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={msg.id} 
                                    className={`flex flex-col ${
                                        msg.isSystem ? 'items-center my-2' : (msg.type === 'user' ? 'items-end' : 'items-start')
                                    }`}
                                >
                                    <div className={`max-w-[85%] rounded-[20px] px-4 py-3 shadow-md ${
                                        msg.isSystem 
                                            ? 'bg-green-50 text-green-700 text-[10px] font-bold border border-green-200 py-1.5'
                                            : (msg.type === 'user' 
                                                ? 'bg-green-600 text-white rounded-tr-none' 
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
                                    }`}>
                                        {msg.reasoning && (
                                            <p className="text-[10px] font-bold text-green-600 mb-1 flex items-center gap-1 opacity-70">
                                                <Search size={10} /> {msg.reasoning}
                                            </p>
                                        )}
                                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        
                                        {msg.action && (
                                            <Link 
                                                to={msg.action.link}
                                                className="mt-2 block w-full py-1.5 bg-green-600 text-white text-[9px] font-black rounded-lg text-center hover:bg-green-700 transition-colors shadow-sm uppercase tracking-wider"
                                            >
                                                {msg.action.label}
                                            </Link>
                                        )}
                                        
                                        {/* Display Results */}
                                        {msg.results && (
                                            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {/* Products */}
                                                {(msg.results.products && msg.results.products.length > 0) && (
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Package size={10} strokeWidth={3} /> SẢN PHẨM GỢI Ý
                                                            </div>
                                                            {msg.total > 10 && (
                                                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                    Tìm thấy {msg.total}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {msg.results.products.map(p => (
                                                                <Link 
                                                                    key={p.id} 
                                                                    to={`/product/${p.id}`}
                                                                    className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 hover:bg-green-50/50 transition-all group border border-slate-100/50 hover:border-green-200"
                                                                >
                                                                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/50 p-0.5 relative">
                                                                        <img src={p.imageUrl || '/placeholder.png'} alt={p.name} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" />
                                                                        {p.origin && (
                                                                            <div className="absolute top-0 right-0 bg-green-500 text-[6px] text-white px-1 rounded-bl-lg font-bold">
                                                                                {p.origin}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-[11px] font-bold text-slate-800 truncate group-hover:text-green-700">{p.name}</h4>
                                                                        <div className="flex items-center justify-between mt-0.5">
                                                                            <div className="flex flex-col">
                                                                                <p className="text-xs text-green-600 font-extrabold transition-all duration-300">
                                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                                                        (p.weights && p.weights.length > 0)
                                                                                            ? (p.weights.find(w => w.id === (selectedWeights[p.id] || p.weights[0].id))?.price || p.price)
                                                                                            : p.price
                                                                                    )}
                                                                                </p>
                                                                                {/* Weights Selection Pills */}
                                                                                {p.weights && p.weights.length > 1 && (
                                                                                    <div className="flex flex-wrap gap-1 mt-1.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                                        {p.weights.map(w => (
                                                                                            <button
                                                                                                key={w.id}
                                                                                                onClick={() => setSelectedWeights(prev => ({ ...prev, [p.id]: w.id }))}
                                                                                                className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border transition-all ${
                                                                                                    (selectedWeights[p.id] === w.id || (!selectedWeights[p.id] && p.weights[0].id === w.id))
                                                                                                        ? 'bg-green-600 text-white border-green-600 scale-105 shadow-sm'
                                                                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-green-400'
                                                                                                }`}
                                                                                            >
                                                                                                {w.weight}g
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    const selectedId = selectedWeights[p.id] || (p.weights && p.weights[0]?.id);
                                                                                    const selectedWeight = p.weights?.find(w => w.id === selectedId);
                                                                                    handleQuickAddToCart(e, { ...p, selectedWeight });
                                                                                }}
                                                                                className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm ml-2"
                                                                                title="Thêm vào giỏ"
                                                                            >
                                                                                <ShoppingBag size={10} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                        {msg.hasMore && (
                                                            <Link 
                                                                to="/products"
                                                                className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-black text-green-700 hover:bg-green-50 rounded-xl border border-dashed border-green-200 uppercase tracking-tighter transition-colors"
                                                            >
                                                                Xem thêm {msg.total - 10} sản phẩm khác →
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Brewing Guides */}
                                                {(msg.results.guides && msg.results.guides.length > 0) && (
                                                    <div className="space-y-2.5 pt-1 border-t border-slate-100/50">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <Coffee size={10} strokeWidth={3} /> HƯỚNG DẪN PHA
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {msg.results.guides.slice(0, 2).map(g => (
                                                                <div 
                                                                    key={g.id} 
                                                                    className="p-2.5 rounded-2xl bg-white border border-slate-100/50 hover:border-green-100 shadow-sm transition-all"
                                                                >
                                                                    <h4 className="text-[11px] font-bold text-slate-800 leading-snug">{g.title}</h4>
                                                                    {g.product && <p className="text-[9px] text-slate-400 mt-1 font-bold italic flex items-center gap-1"><Package size={8} /> Dành cho: {g.product.name}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Blogs */}
                                                {(msg.results.blogs && msg.results.blogs.length > 0) && (
                                                    <div className="space-y-2.5 pt-1 border-t border-slate-100/50">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <BookOpen size={10} strokeWidth={3} /> KIẾN THỨC VỀ TRÀ
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {msg.results.blogs.slice(0, 2).map(b => (
                                                                <Link 
                                                                    key={b.id} 
                                                                    to={`/blog/${b.id}`}
                                                                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-green-50/50 transition-all group border border-slate-100/50 hover:border-green-200"
                                                                >
                                                                    <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-green-700">{b.title}</h4>
                                                                    <div className="flex items-center gap-1 mt-1 font-bold text-[9px] text-green-600/70">XEM NGAY →</div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Quick Reply Suggestions */}
                                    {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 px-1">
                                            {msg.suggestions.map((s, idx) => (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    key={idx}
                                                    onClick={() => handleSuggest(s)}
                                                    className="px-3 py-1.5 bg-white border border-green-100 text-green-700 text-[10px] font-bold rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    {s}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-[20px] rounded-tl-none border border-slate-100 flex items-center gap-3 shadow-sm text-green-600">
                                        <div className="flex gap-1">
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">WebTra AI đang nghĩ...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions Area */}
                        {!isLoading && messages.length < 5 && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white/50 border-t border-slate-50">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggest(s)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-green-200 text-green-700 text-[11px] font-bold rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm flex-shrink-0"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">

                            <form onSubmit={handleSend} className="flex gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 focus-within:border-green-500/50 focus-within:bg-white transition-all">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Tìm trà, kiến thức pha trà..."
                                    className="flex-1 px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    id="chatbot-input"
                                />
                                <button
                                    type="submit"
                                    disabled={!query.trim() || isLoading}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        !query.trim() || isLoading 
                                            ? 'bg-transparent text-slate-300' 
                                            : 'bg-green-600 text-white shadow-lg hover:bg-green-700 active:scale-90 shadow-green-600/30'
                                    }`}
                                    id="chatbot-send"
                                >
                                    <Send size={18} strokeWidth={2.5} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;
