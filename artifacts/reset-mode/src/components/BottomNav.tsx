import { Link, useLocation } from "wouter";
import { Home, Shield, Calendar, Book, ListTodo } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Urge", href: "/urge", icon: Shield },
    { name: "Tracker", href: "/tracker", icon: Calendar },
    { name: "Journal", href: "/journal", icon: Book },
    { name: "Plan", href: "/plan", icon: ListTodo },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around p-3 max-w-[430px] mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon size={24} className={isActive ? 'fill-primary/20' : ''} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
