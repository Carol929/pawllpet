import Link from 'next/link'
import { SUPPORT_LABEL, SUPPORT_PATH } from '@/lib/support'

/** Inline link to the contact form, for use inside a sentence. */
export default function SupportLink() {
  return <Link href={SUPPORT_PATH}>{SUPPORT_LABEL}</Link>
}
