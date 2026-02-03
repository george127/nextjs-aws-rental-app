type Payment = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
};

type Props = {
  payments: Payment[];
};

export default function PaymentHistory({ payments }: Props) {
  return (
    <div className="rounded-xl border p-5 space-y-4">
      <h3 className="text-lg font-semibold">Payment History</h3>

      {payments.length === 0 ? (
        <p className="text-gray-500 text-sm">No payments yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="py-2">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td>${payment.amount}</td>
                <td>
                  <span
                    className={`font-medium ${
                      payment.status === "SUCCESS"
                        ? "text-green-600"
                        : payment.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
