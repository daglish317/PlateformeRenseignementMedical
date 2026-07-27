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
    formData.append("latitude", payload.latitude.toFixed(8));
    formData.append("longitude", payload.longitude.toFixed(8));
    if (payload.photo) {
      formData.append("photo", payload.photo);
    }

    // Debug logs
    console.log("📤 Submitting structure:", {
      nom: payload.nom,
      type: payload.type,
      adresse: payload.adresse,
      telephone: payload.telephone,
      latitude: payload.latitude,
      longitude: payload.longitude,
      hasPhoto: !!payload.photo,
    });

    try {
      const { data } = await api.post("/structures/submit/", formData);
      console.log("✅ Structure submitted successfully:", data);
      return data;
    } catch (error: any) {
      console.error("❌ Error submitting structure:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
