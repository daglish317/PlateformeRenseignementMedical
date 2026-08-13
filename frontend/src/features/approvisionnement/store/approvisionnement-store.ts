import { create } from "zustand";
import { LigneInput } from "../types/approvisionnement";

interface ApprovisionnementState {
  dateReception: string;
  fournisseur: string;
  referenceBon: string;
  montantTotalDeclare: string;
  lignes: LigneInput[];
  setDateReception: (dateReception: string) => void;
  setFournisseur: (fournisseur: string) => void;
  setReferenceBon: (referenceBon: string) => void;
  setMontantTotalDeclare: (montantTotalDeclare: string) => void;
  addLigne: (ligne: LigneInput) => void;
  updateLigne: (index: number, ligne: LigneInput) => void;
  removeLigne: (index: number) => void;
  reset: () => void;
}

const initialDateReception = () => new Date().toISOString().slice(0, 10);

export const useApprovisionnementStore = create<ApprovisionnementState>((set) => ({
  dateReception: initialDateReception(),
  fournisseur: "",
  referenceBon: "",
  montantTotalDeclare: "",
  lignes: [],
  setDateReception: (dateReception) => set({ dateReception }),
  setFournisseur: (fournisseur) => set({ fournisseur }),
  setReferenceBon: (referenceBon) => set({ referenceBon }),
  setMontantTotalDeclare: (montantTotalDeclare) => set({ montantTotalDeclare }),
  addLigne: (ligne) => set((state) => ({ lignes: [...state.lignes, ligne] })),
  updateLigne: (index, ligne) =>
    set((state) => ({
      lignes: state.lignes.map((item, i) => (i === index ? ligne : item)),
    })),
  removeLigne: (index) =>
    set((state) => ({
      lignes: state.lignes.filter((_, i) => i !== index),
    })),
  reset: () =>
    set({
      dateReception: initialDateReception(),
      fournisseur: "",
      referenceBon: "",
      montantTotalDeclare: "",
      lignes: [],
    }),
}));
