import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, QrCode, User } from "lucide-react";
import api from "../../services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui-waiter/card";
import { Button } from "../../components/ui-waiter/button";
import { useToast } from "../../components/ui-waiter/use-toast";

function buildMonthMatrix(attendanceDates) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const attendedSet = new Set(
    (attendanceDates || []).map((d) => {
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 10);
    })
  );

  const matrix = [];
  let currentDay = 1 - startDay;

  while (currentDay <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null);
      } else {
        const dateObj = new Date(year, month, currentDay);
        const iso = dateObj.toISOString().slice(0, 10);
        week.push({
          day: currentDay,
          iso,
          attended: attendedSet.has(iso),
          isToday:
            dateObj.toDateString() === new Date().toDateString(),
        });
      }
      currentDay += 1;
    }
    matrix.push(week);
  }

  return { matrix, month, year };
}

function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingToday, setIsMarkingToday] = useState(false);

  const waiterName =
    profile?.name || localStorage.getItem("waiterName") || "Waiter";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get("/waiter/profile");
        setProfile(response.data || null);
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const completedOrdersCount = profile?.completedOrdersCount ?? 0;
  const attendanceDates = profile?.attendanceDates ?? [];

  const { matrix, month, year } = useMemo(
    () => buildMonthMatrix(attendanceDates),
    [attendanceDates]
  );

  const monthLabel = useMemo(
    () =>
      new Date(year, month, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [month, year]
  );

  const handleMarkToday = async () => {
    if (isMarkingToday) return;

    try {
      setIsMarkingToday(true);
      await api.post("/waiter/attendance/mark-today");

      const todayIso = new Date().toISOString().slice(0, 10);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              attendanceDates: Array.from(
                new Set([...(prev.attendanceDates || []), todayIso])
              ),
            }
          : prev
      );

      toast({
        title: "Attendance marked",
        description: "Today’s attendance has been recorded.",
      });
    } catch (err) {
      toast({
        title: "Failed to mark attendance",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingToday(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C3110C] text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {waiterName}
            </h1>
            <p className="text-sm text-neutral-500">
              Waiter profile, performance and attendance.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Card className="border border-neutral-200">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 rounded bg-neutral-200 animate-pulse" />
                  <div className="h-3 w-48 rounded bg-neutral-200 animate-pulse" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-neutral-200">
              <CardContent className="h-40 animate-pulse bg-neutral-100" />
            </Card>
          </div>
        ) : error ? (
          <Card className="border border-neutral-200">
            <CardContent className="py-4">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-neutral-900">
                    Completed Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-neutral-900">
                        {completedOrdersCount}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Orders you have served successfully.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-neutral-900">
                    Attendance Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-4">
                  <Button
                    type="button"
                    className="w-full justify-center gap-2 rounded-full"
                    onClick={handleMarkToday}
                    disabled={isMarkingToday}
                  >
                    <QrCode className="h-4 w-4" />
                    {isMarkingToday
                      ? "Marking attendance..."
                      : "Scan QR / Mark attendance for today"}
                  </Button>
                  <p className="text-xs text-neutral-500">
                    Use this button after scanning the QR code at your
                    station to confirm today&apos;s attendance.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#C3110C]/10 text-[#C3110C]">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-neutral-900">
                      Attendance Calendar
                    </CardTitle>
                    <p className="text-xs text-neutral-500">{monthLabel}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-7 text-center text-xs font-medium text-neutral-500">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1 text-xs">
                  {matrix.map((week, wi) =>
                    week.map((day, di) => {
                      if (!day) {
                        return (
                          <div
                            key={`${wi}-${di}`}
                            className="h-8 rounded-lg"
                          />
                        );
                      }

                      const baseClasses =
                        "flex h-8 items-center justify-center rounded-lg border text-xs";

                      const attendedClasses = day.attended
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-neutral-200 text-neutral-700";

                      const todayRing = day.isToday
                        ? "ring-1 ring-offset-1 ring-[#C3110C]"
                        : "";

                      return (
                        <div
                          key={day.iso}
                          className={`${baseClasses} ${attendedClasses} ${todayRing}`}
                        >
                          {day.day}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-emerald-500 bg-emerald-50" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-neutral-200" />
                    <span>No attendance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;

