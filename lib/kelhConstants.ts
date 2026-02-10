/** KELH Production Flow: dropdown options */

export const REFERRAL_OPTIONS = [
  "Social Media",
  "Dr. Ludo",
  "Walkin",
  "By Old Patient",
  "Other Doctor",
  "NWSC",
  "BOU",
  "UPDF",
  "Others",
] as const;

export const DOCTOR_OPTIONS = [
  "Dr. Ludo",
  "Dr. Mustofa",
  "Dr. Jessica",
  "Dr. Ehab",
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  "Cash",
  "Airtel Money",
  "MoMo",
  "Insurance",
  "Card",
  "Partner",
] as const;

export const TREATMENT_CATEGORY_OPTIONS = [
  "Surgery",
  "Medication",
  "Optical",
  "Procedure",
  "Other",
] as const;

/** Service list categories (includes Consultation for new-patient auto-fill). */
export const SERVICE_CATEGORIES = [
  "Consultation",
  "Surgery",
  "Medication",
  "Optical",
  "Procedure",
  "Other",
] as const;

export type ReferralOption = (typeof REFERRAL_OPTIONS)[number];
export type DoctorOption = (typeof DOCTOR_OPTIONS)[number];
export type PaymentMethodOption = (typeof PAYMENT_METHOD_OPTIONS)[number];
export type TreatmentCategoryOption = (typeof TREATMENT_CATEGORY_OPTIONS)[number];
export type ServiceCategoryOption = (typeof SERVICE_CATEGORIES)[number];
