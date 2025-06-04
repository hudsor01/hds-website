import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Navigation State
interface NavigationState {
  isMobileMenuOpen: boolean
  isScrolled: boolean
  setMobileMenuOpen: () => void
  setScrolled: () => void
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      isMobileMenuOpen: false,
      isScrolled: false,
      setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),
      setScrolled: (scrolled: boolean) => set({ isScrolled: scrolled }),
    }),
    {
      name: 'navigation-store',
    },
  ),
)
