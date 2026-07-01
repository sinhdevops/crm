import { ContactsClient } from "./_components/ContactsClient";
import { getContacts } from "@/server/queries/contacts";

export default async function ContactsPage() {
  const initialPage = await getContacts({ limit: 10 });

  return <ContactsClient initialPage={initialPage} />;
}
