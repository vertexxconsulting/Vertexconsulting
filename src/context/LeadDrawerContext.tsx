import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LeadDrawerContextType {
  isDrawerOpen: boolean;
  currentLeadId: string | null;
  openDrawer: (leadId: string) => void;
  closeDrawer: () => void;
}

const LeadDrawerContext = createContext<LeadDrawerContextType | undefined>(undefined);

export function LeadDrawerProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  const openDrawer = (leadId: string) => {
    setCurrentLeadId(leadId);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setCurrentLeadId(null), 300); // Wait for animation before clearing
  };

  return (
    <LeadDrawerContext.Provider value={{ isDrawerOpen, currentLeadId, openDrawer, closeDrawer }}>
      {children}
    </LeadDrawerContext.Provider>
  );
}

export function useLeadDrawer() {
  const context = useContext(LeadDrawerContext);
  if (context === undefined) {
    throw new Error('useLeadDrawer must be used within a LeadDrawerProvider');
  }
  return context;
}
