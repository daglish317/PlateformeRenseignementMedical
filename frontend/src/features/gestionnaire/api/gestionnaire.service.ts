import api from "@/lib/axios";

export const gestionnaireService = {
  submitStructure: async (payload: {
    nom: string;
    type: string;
    adresse: string;
    telephone: string;
    latitude: number;
    longitude: number;
    photo?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("nom", payload.nom);
    formData.append("type", payload.type);
    formData.append("adresse", payload.adresse);
    formData.append("telephone", payload.telephone);
    formData.append("latitude", String(payload.latitude));
    formData.append("longitude", String(payload.longitude));
    if (payload.photo) {
      formData.append("photo", payload.photo);
    }

    const { data } = await api.post("/structures/submit/", formData);
    return data;
  },
};
