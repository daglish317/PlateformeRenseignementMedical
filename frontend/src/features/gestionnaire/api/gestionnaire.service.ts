import api from "@/lib/axios";

export const gestionnaireService = {
  submitStructure: async (payload: {
    nom: string;
    type: string;
    adresse: string;
    telephone: string;
    latitude: number;
    longitude: number;
  }) => {
    const { data } = await api.post("/structures/submit/", payload);
    return data;
  },
};
