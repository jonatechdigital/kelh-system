/**
 * Database schema (post nuclear reset).
 * Patients: id, name, phone, file_number.
 * Visits: id, patient_id, doctor, referral_source, services, total_amount, payment_method.
 */

/** Service item in visits.services JSON array */
export type VisitServiceItem = {
  id: string;
  name: string;
  category: string;
  price: number;
};

/** Patient row */
export type Patient = {
  id: string;
  name: string;
  phone: string;
  file_number: string;
};

/** Visit row */
export type Visit = {
  id: string;
  patient_id: string;
  doctor: string;
  referral_source: string;
  services: VisitServiceItem[];
  total_amount: number;
  payment_method: string;
};
