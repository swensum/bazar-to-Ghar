import type { Offer } from "../contexts/OfferContext";


interface ProductLike {
  id: string;
  price: number;
  discountPercentage: number;
  categories: string[];
}

export function isProductOnOffer(product: ProductLike, offer: Offer | null): boolean {
  if (!offer) return false;
  return offer.applicable_categories.some((cat) => product.categories.includes(cat));
}

export function getEffectiveDiscount(product: ProductLike, offer: Offer | null): number {
  return isProductOnOffer(product, offer) ? offer!.discount_percentage : 0;
}

export function getEffectivePrice(product: ProductLike, offer: Offer | null): number {
  const discount = getEffectiveDiscount(product, offer);
  return +(product.price * (1 - discount / 100)).toFixed(2);
}