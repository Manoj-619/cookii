import { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    id: 'pass',
    title: 'Zapeat Pass',
    description: 'Save 10% on every home cooking session with zero surge pricing',
    validTill: '27 Nov 2026',
    active: true,
  },
  {
    id: 'zapeatblr',
    title: 'ZAPEATBLR Launch Perk',
    description: 'Flat ₹50 OFF on your next weekday home cook booking',
    validTill: '30 Dec 2026',
    active: true,
  },
  {
    id: 'welcome',
    title: 'Welcome Treat',
    description: 'Introductory first-meal coupon',
    validTill: '31 Oct 2026',
    active: false,
  },
];
