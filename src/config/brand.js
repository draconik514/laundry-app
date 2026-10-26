const brand = {
  name: import.meta.env.VITE_BRAND_NAME || 'LaundryFlow',
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Laundry Bersih & Wangi, Siap Tepat Waktu',
  address: import.meta.env.VITE_BRAND_ADDRESS || 'Jl. Laundry No. 123, Kota',
  hours: import.meta.env.VITE_BRAND_HOURS || 'Senin – Minggu, 09.00 – 17.00 WIB',
  phone: import.meta.env.VITE_BRAND_PHONE || '0812-3456-7890',
  adminWa: import.meta.env.VITE_ADMIN_WA || '6281234567890',
  city: import.meta.env.VITE_BRAND_CITY || 'Kota',
  stats: {
    customers: import.meta.env.VITE_STAT_CUSTOMERS || '500+',
    years: import.meta.env.VITE_STAT_YEARS || '3 Tahun',
    ontime: import.meta.env.VITE_STAT_ONTIME || '100%',
  },
  testimonials: [
    { name: 'Budi S.', text: 'Laundry paling bersih di sini! Baju putih saya jadi kinclong lagi.', rating: 5 },
    { name: 'Sari W.', text: 'Tepat waktu dan harganya terjangkau. Sudah langganan 2 tahun.', rating: 5 },
    { name: 'Andi P.', text: 'Pelayanannya ramah, hasil cucian rapi dan wangi. Recommended!', rating: 5 },
  ]
}

export default brand