export const WHATSAPP_NUMBER = "237620837907";

export const buildWhatsAppLink = (message: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
