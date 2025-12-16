import AllProductsTable from "@/components/AllProductsTable";

export default function AllProducts() {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">All Products</h1>
      </div>

      {/* TABLE */}
      <AllProductsTable />
    </div>
  );
}

