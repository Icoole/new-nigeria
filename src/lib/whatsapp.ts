/** Single place for the TogetherNigeria WhatsApp contact line. */
export const WHATSAPP_NUMBER = "+2349020915799";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    message,
  )}`;
}

export const WHATSAPP_DEFAULT = whatsappLink(
  "Hello TogetherNigeria — I would like to talk about an election monitoring deployment.",
);
