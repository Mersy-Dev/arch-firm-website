import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectType } from '@/types/project.types';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { mobileMenuOpen: false, activeFilter: 'all' as ProjectType|'all', lightboxImage: null as string|null, lightboxImages: [] as string[] },
  reducers: {
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu:  (state) => { state.mobileMenuOpen = false; },
    setActiveFilter:  (state, { payload }: PayloadAction<ProjectType|'all'>) => { state.activeFilter = payload; },
    openLightbox: (state, { payload }: PayloadAction<{ images: string[]; index: number }>) => {
      state.lightboxImages = payload.images; state.lightboxImage = payload.images[payload.index];
    },
    closeLightbox: (state) => { state.lightboxImage = null; state.lightboxImages = []; },
  },
});
export const { toggleMobileMenu, closeMobileMenu, setActiveFilter, openLightbox, closeLightbox } = uiSlice.actions;
export default uiSlice.reducer;