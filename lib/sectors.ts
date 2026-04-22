export const SECTOR_LABELS: Record<number, string> = {
  10: 'Food manufacturing',
  25: 'Metal products',
  41: 'Building construction',
  43: 'Specialised construction',
  45: 'Motor trade & repair',
  46: 'Wholesale trade',
  47: 'Retail trade',
  56: 'Restaurants & catering',
  62: 'Software & IT',
  68: 'Real estate',
  71: 'Architecture & engineering',
  77: 'Rental & leasing',
  82: 'Business support services',
}

export const ALL_SECTORS = Object.entries(SECTOR_LABELS).map(([code, label]) => ({
  code: parseInt(code),
  label,
}))
