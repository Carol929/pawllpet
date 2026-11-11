/**
 * Where customers are told to reach us. Every page, email and error message
 * that says "contact us" points here, so there is one place to change.
 *
 * It is the contact form rather than a mailbox because pawllpet.com has no MX
 * record: mail to support@pawllpet.com (or any other @pawllpet.com address)
 * bounces. The form posts to /api/contact, which emails ADMIN_EMAIL with the
 * customer's address as Reply-To.
 */
export const SUPPORT_PATH = '/contact'
export const SUPPORT_URL = 'https://pawllpet.com/contact'
/** SUPPORT_URL as it should read in running text. */
export const SUPPORT_LABEL = 'pawllpet.com/contact'
