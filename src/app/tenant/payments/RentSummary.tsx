type Props = {
  propertyName: string;
  rentAmount: number;
};

export default function RentSummary({ propertyName, rentAmount }: Props) {
  return (
    <div className="rounded-xl border p-5 space-y-2">
      <p className="text-sm text-gray-500">Current Property</p>
      <h2 className="text-xl font-semibold">{propertyName}</h2>

      <div className="pt-3">
        <p className="text-sm text-gray-500">Monthly Rent</p>
        <p className="text-3xl font-bold">${rentAmount}</p>
      </div>
    </div>
  );
}
