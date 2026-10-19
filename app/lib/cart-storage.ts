'use client';
import { parseCart, type CartItem } from './cart';

const storageKey = 'valleys-cart-v1';
export function readCart(): CartItem[] {
  try { return parseCart(JSON.parse(localStorage.getItem(storageKey) || '[]')) || []; } catch { return []; }
}
export function saveCart(items: CartItem[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new Event('valleys-cart-change'));
}
export function requestCartOpen() {
  if (!document.getElementById('store-shopping-bag')) return false;
  window.dispatchEvent(new Event('valleys-cart-open'));
  return true;
}
