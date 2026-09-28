"use client";

import { Button } from "@/components/ui/button";
import { useGetMyAppointments } from "@/hooks";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AppointmentList() {
  const params = useSearchParams();
  const status = params.get("status");

  const { data } = useGetMyAppointments({
    page: 1,
    limit: 100,
  });

  // API response:
  // data -> { data: { data: [...], meta: {...} } }
  type Appointment = {
    id: string | number;
    status?: string;
    doctor?: {
      name?: string | null;
    } | null;
  };

  const appointments: Appointment[] = Array.isArray(data?.data?.data)
    ? (data.data.data as Appointment[])
    : [];

  if (status === "failure") {
    return (
      <div className="mt-5 border rounded-md p-5">
        <h1 className="text-xl font-semibold">Payment Failed</h1>
        <p className="mt-2">Please check your payment information.</p>

        <Link href="/dashboard/my-appointments" className="inline-block mt-4">
          Go back to appointments
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mt-5 border rounded-md p-5">
        <h1 className="text-xl font-semibold">Payment Successful</h1>
        <p className="mt-2">Please be prepared to join the video call.</p>

        <Link href="/dashboard/my-appointments" className="inline-block mt-4">
          Go back to appointments
        </Link>
      </div>
    );
  }

  if (appointments.length === 0) {
    return <p className="mt-5">There is no appointment.</p>;
  }

  return (
    <div className="mt-5 space-y-3">
      {appointments.map(({ doctor, status, id }) => (
        <div key={id} className="border rounded-md p-3">
          <div className="w-full flex items-center gap-3">
            <span>Doctor: {doctor?.name || "Unknown Doctor"}</span>

            <span>Status: {status}</span>

            <div className="ml-auto">
              <Button>Join</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
