import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Navigation State
interface NavigationState {
  isMobileMenuOpen: boolean
  isScrolled: boolean
  setMobileMenuOpen: (_open: boolean) => void
  setScrolled: (_scrolled: boolean) => void
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      isMobileMenuOpen: false,
      isScrolled: false,
      setMobileMenuOpen: open => set({ isMobileMenuOpen: open }),
      setScrolled: scrolled => set({ isScrolled: scrolled }),
    }),
    {
      name: 'navigation-store',
    },
  ),
)
