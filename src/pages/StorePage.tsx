import React, { useState } from 'react';
import { ShoppingBag, Book, FileText, Shirt, ArrowRight, Star, Trash2, CreditCard, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import { cn } from '../types';

export default function StorePage() {
  const { showToast } = useToast();
  const [cart, setCart] = useState<{ id: number, name: string, price: number, quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: any) => {
    const priceNum = parseFloat(product.price.replace('R$ ', '').replace(',', '.'));
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: priceNum, quantity: 1 }]);
    }
    showToast(`${product.name} adicionado ao carrinho! 🛒✨`);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    showToast("Redirecionando para o PayPal... 💳✨", 'info');
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      showToast("Compra realizada com sucesso! Verifique seu e-mail. 🙌❤️");
    }, 2000);
  };

  const products = [
    {
      id: 1,
      name: "Bíblia de Estudo Expositiva",
      category: "Livros",
      price: "R$ 149,90",
      image: "https://picsum.photos/seed/bible-book/400/500",
      icon: <Book size={20} />,
      rating: 5
    },
    {
      id: 2,
      name: "Apostila: Homilética Avançada",
      category: "Apostilas",
      price: "R$ 47,00",
      image: "https://picsum.photos/seed/handout/400/500",
      icon: <FileText size={20} />,
      rating: 4.8
    },
    {
      id: 3,
      name: "Camisa: 'Pregue a Palavra'",
      category: "Camisas",
      price: "R$ 69,90",
      image: "https://picsum.photos/seed/shirt-preach/400/500",
      icon: <Shirt size={20} />,
      rating: 4.9
    },
    {
      id: 4,
      name: "Livro: O Poder da Oração",
      category: "Livros",
      price: "R$ 39,90",
      image: "https://picsum.photos/seed/prayer-book/400/500",
      icon: <Book size={20} />,
      rating: 5
    },
    {
      id: 5,
      name: "Apostila: Grego Bíblico para Pregadores",
      category: "Apostilas",
      price: "R$ 59,00",
      image: "https://picsum.photos/seed/greek/400/500",
      icon: <FileText size={20} />,
      rating: 4.7
    },
    {
      id: 6,
      name: "Camisa: 'Solas Scriptura'",
      category: "Camisas",
      price: "R$ 69,90",
      image: "https://picsum.photos/seed/shirt-solas/400/500",
      icon: <Shirt size={20} />,
      rating: 5
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-3xl font-display font-bold">Livros</h2>
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-stone-500 dark:text-zinc-400">Ao comprar um livro você estará investindo em missões.</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl hover:bg-emerald-100 transition-all cursor-pointer"
        >
          <ShoppingBag className="text-emerald-600" size={24} />
          <div className="text-left">
            <p className="text-xs font-bold text-emerald-600 uppercase">Carrinho</p>
            <p className="font-bold">{totalItems} itens - R$ {total.toFixed(2).replace('.', ',')}</p>
          </div>
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm">
                  {product.icon}
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{product.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-emerald-600">{product.price}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-3 bg-zinc-900 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                >
                  <ShoppingBag size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-white text-center space-y-6">
        <h3 className="text-2xl md:text-3xl font-display font-bold">Frete Grátis em compras acima de R$ 200</h3>
        <p className="opacity-90 max-w-xl mx-auto">Aproveite nossa promoção exclusiva para o mês de aniversário do App do Pregador. Invista no seu ministério hoje!</p>
        <button className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-stone-100 transition-colors flex items-center gap-2 mx-auto">
          Ver todas as ofertas <ArrowRight size={20} />
        </button>
      </section>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" />
                  Seu Carrinho
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <ShoppingBag size={64} />
                    <p className="font-bold">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-stone-50 dark:bg-zinc-800 p-4 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-stone-500">Qtd: {item.quantity} x R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100 dark:border-zinc-800 space-y-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <CreditCard size={20} />
                    Pagar com PayPal
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    <Check size={12} className="text-emerald-500" />
                    Pagamento 100% Seguro
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
