import dynamic from 'next/dynamic'

const ClientInventoryManagement = dynamic(
  () => import('./ClientInventoryManagement'),
  { ssr: false }
)

export default function Page() {
  return <ClientInventoryManagement />
}