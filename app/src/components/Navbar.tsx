import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, ChevronDown, LayoutDashboard, Settings, LogOut, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
    const { user, role, logout, setCurrentView, currentView } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const scrollToSection = (id: string) => {
        if (currentView !== 'landing') {
            setCurrentView('landing');
            // Small timeout to allow landing page to render before scrolling
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                            NeuroScope VR
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <button onClick={() => setCurrentView('landing')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Home
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 outline-none">
                                Soluções <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem onClick={() => scrollToSection('como-funciona')}>
                                    Como Funciona
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scrollToSection('para-empresas')}>
                                    Para Empresas
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scrollToSection('para-psicologos')}>
                                    Para Terapeutas
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button onClick={() => scrollToSection('sobre')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Sobre Nós
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                                        <div className="flex bg-teal-100 h-full w-full items-center justify-center rounded-full text-teal-700 font-bold">
                                            {user.full_name.charAt(0)}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{role?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setCurrentView('dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    {role === 'admin' && (
                                        <DropdownMenuItem onClick={() => setCurrentView('admin-crm')}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            CRM Administrativo
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentView('login')}
                                    className="hidden sm:flex text-slate-600 hover:text-slate-900 font-medium"
                                >
                                    Entrar
                                </Button>
                                <Button
                                    onClick={() => scrollToSection('contato')}
                                    className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-medium shadow-md transition-all active:scale-95"
                                >
                                    Assinar Plano
                                </Button>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}
                                className="text-left py-2 font-medium text-slate-600"
                            >
                                Home
                            </button>
                            <div className="py-2 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Soluções</p>
                                <div className="pl-4 flex flex-col gap-2">
                                    <button onClick={() => scrollToSection('como-funciona')} className="text-left py-1 text-slate-600">Como Funciona</button>
                                    <button onClick={() => scrollToSection('para-empresas')} className="text-left py-1 text-slate-600">Para Empresas</button>
                                    <button onClick={() => scrollToSection('para-psicologos')} className="text-left py-1 text-slate-600">Para Terapeutas</button>
                                </div>
                            </div>
                            <button onClick={() => scrollToSection('sobre')} className="text-left py-2 font-medium text-slate-600">
                                Sobre Nós
                            </button>
                            {!user && (
                                <Button
                                    onClick={() => { setCurrentView('login'); setMobileMenuOpen(false); }}
                                    className="w-full bg-slate-900 mt-2"
                                >
                                    Entrar
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
