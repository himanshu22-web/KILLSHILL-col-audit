import { create } from "zustand";
import { SortDirection, SortField } from "./types";

interface KolAuditState {
  search: string;
  minAccuracy: number;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedKolId: string | null;
  drawerOpen: boolean;

  setSearch: (value: string) => void;
  setMinAccuracy: (value: number) => void;
  setSort: (field: SortField) => void;
  clearFilters: () => void;
  openDrawer: (kolId: string) => void;
  closeDrawer: () => void;
  hydrateFromUrl: (params: {
    search?: string;
    minAccuracy?: number;
    sortField?: SortField;
    sortDirection?: SortDirection;
  }) => void;
}

export const useKolAuditStore = create<KolAuditState>((set, get) => ({
  search: "",
  minAccuracy: 0,
  sortField: "accuracy",
  sortDirection: "desc",
  selectedKolId: null,
  drawerOpen: false,

  setSearch: (value) => set({ search: value }),
  setMinAccuracy: (value) => set({ minAccuracy: value }),
  setSort: (field) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field && state.sortDirection === "desc" ? "asc" : "desc",
    })),
  clearFilters: () => set({ search: "", minAccuracy: 0 }),
  openDrawer: (kolId) => set({ selectedKolId: kolId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  hydrateFromUrl: (params) => {
    const next: Partial<KolAuditState> = {};
    if (params.search !== undefined) next.search = params.search;
    if (params.minAccuracy !== undefined) next.minAccuracy = params.minAccuracy;
    if (params.sortField !== undefined) next.sortField = params.sortField;
    if (params.sortDirection !== undefined) next.sortDirection = params.sortDirection;
    if (Object.keys(next).length) set(next);
    void get();
  },
}));
