import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/fr",
    name: "SanteProx",
    short_name: "SanteProx",
    description: "Trouvez et gerez les structures medicales autour de vous",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait",
    categories: ["medical", "health", "productivity"],
    icons: [
      {
        src: "/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
