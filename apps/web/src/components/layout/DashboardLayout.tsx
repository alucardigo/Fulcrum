'use client'; // Necessário para hooks como useState, useRouter e store da Zustand

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correto para App Router
import { useAuthStore } from '@/stores/useAuthStore';
import { Toaster, showSuccessToast } from 'ui/components/ToastInvokers'; // Usando os invokers do pacote ui
// import { cn } from 'ui/lib/utils'; // Se necessário para estilização aqui

// Ícones do Lucide (assumindo que lucide-react está instalado em apps/web ou ui)
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Menu,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard/requests', label: 'Minhas Requisições', icon: FileText },
  { href: '/dashboard/projects', label: 'Projetos', icon: Package },
  { href: '/dashboard/items', label: 'Itens', icon: Package }, // Usar um ícone diferente se disponível
  { href: '/dashboard/admin', label: 'Admin', icon: Users }, // Link futuro
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logoutAction, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar aberta por padrão em desktop
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Mock de verificação de autenticação. Em um app real, faria uma chamada à API ou validaria o token.
    // Se não estiver autenticado (ex: no refresh da página sem token válido), redirecionar para login.
    // A store já inicializa `isAuthenticated` do localStorage.
    if (!isAuthenticated && typeof window !== 'undefined') {
      // router.push('/login');
      // Comentado por agora para facilitar o desenvolvimento sem login funcional
      console.log("DashboardLayout: Utilizador não autenticado, deveria redirecionar para /login");
    }
  }, [isAuthenticated, router]);


  const handleLogout = () => {
    logoutAction();
    showSuccessToast('Logout realizado com sucesso!');
    router.push('/login'); // Redireciona para a página de login
  };

  // Efeito para lidar com o tamanho da tela para a sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Chamar na montagem inicial
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Mock de dados do utilizador se não estiverem na store (para desenvolvimento)
  const displayName = user?.name || 'Utilizador';

  if (!isAuthenticated) {
    // Poderia mostrar um loader ou null enquanto verifica, ou se o useEffect redirecionar.
    // Para este exemplo, se não autenticado (e o redirect acima estiver comentado),
    // ainda renderizamos o layout para fins de desenvolvimento da UI.
    // Em produção, aqui seria um return null ou um componente de loading/redirect.
    // console.log("Layout: Não autenticado, renderizando UI de fallback ou nada.");
  }


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toaster para notificações */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-30 w-64 transform md:relative md:translate-x-0' : 'hidden md:block'}`}
      >
        <div className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className={`font-semibold text-xl ${!sidebarOpen && 'hidden'}`}>
            Fulcrum
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-700 hidden md:block"
            aria-label={sidebarOpen ? "Recolher sidebar" : "Expandir sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${!sidebarOpen && 'justify-center'}`}
              title={item.label}
            >
              <item.icon className={`h-5 w-5 ${sidebarOpen && 'mr-3'}`} />
              <span className={`${!sidebarOpen && 'hidden'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="flex items-center justify-between">
            {/* Botão de Menu para Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1"> {/* Espaçador para empurrar o conteúdo do utilizador para a direita */}
              {/* Pode adicionar breadcrumbs ou título da página aqui no futuro */}
            </div>

            <div className="flex items-center space-x-3">
              <UserCircle size={24} className="text-gray-600" />
              <span className="text-gray-700 text-sm font-medium">
                Olá, {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                title="Logout"
              >
                <LogOut size={18} className="mr-1" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      {/* Overlay para fechar menu mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
