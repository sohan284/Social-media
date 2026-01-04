import ContactsTable from "@/components/admin/ContactsTable";

export default function Contacts() {
  return (
    <div className="space-y-10">
      <div className="grid gap-10">
        <div className="">
          <ContactsTable />
        </div>
      </div>
    </div>
  );
}

