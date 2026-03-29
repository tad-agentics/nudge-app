import { useNavigate } from "react-router";
import { Calendar, Bell, CreditCard, LogOut } from "lucide-react";

import { useAuth } from "~/lib/auth";

export function SettingsScreen() {
  const navigate = useNavigate();
  const { profile, profileLoading, user, signOut } = useAuth();

  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? "—";
  const email = profile?.email ?? user?.email ?? "—";
  const planLabel =
    profile?.subscription_status === "paid" ||
    profile?.subscription_status === "trialing"
      ? "Paid"
      : "Free";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="mb-8 text-stone transition-colors hover:text-espresso"
        >
          ← Back
        </button>

        <h1 className="mb-12 text-4xl" style={{ fontWeight: 700 }}>
          Settings
        </h1>

        <div className="mb-8">
          <h2 className="mb-3 ml-1 text-sm text-stone">Profile</h2>
          <div className="rounded-2xl bg-linen p-6">
            {profileLoading ? (
              <p className="text-sm text-stone">Loading profile…</p>
            ) : (
              <>
                <div className="mb-4">
                  <p className="mb-1 text-sm text-stone">Name</p>
                  <p style={{ fontWeight: 600 }}>{displayName}</p>
                </div>
                <div className="mb-4">
                  <p className="mb-1 text-sm text-stone">Email</p>
                  <p style={{ fontWeight: 600 }}>{email}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-stone">Account</p>
                  <p style={{ fontWeight: 600 }}>
                    {user?.is_anonymous
                      ? "Anonymous session (sign in with Google to sync)"
                      : "Google"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 ml-1 text-sm text-stone">Calendar</h2>
          <div className="divide-y divide-parchment rounded-2xl bg-linen">
            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-parchment/50"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-stone" />
                <div>
                  <p style={{ fontWeight: 600 }}>Connect Google Calendar</p>
                  <p className="text-sm text-stone">
                    {profile?.calendar_provider === "google"
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between p-6">
              <div>
                <p style={{ fontWeight: 600 }}>Don&apos;t schedule my tasks</p>
                <p className="text-sm text-stone">
                  Turn off automatic calendar scheduling
                </p>
              </div>
              <label className="relative inline-block h-6 w-12">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-full w-full cursor-pointer rounded-full bg-stone/30 transition-colors peer-checked:bg-orange" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 cursor-pointer rounded-full bg-white transition-transform peer-checked:translate-x-6" />
              </label>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 ml-1 text-sm text-stone">Notifications</h2>
          <div className="rounded-2xl bg-linen p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-stone" />
                <p style={{ fontWeight: 600 }}>Push notifications</p>
              </div>
              <label className="relative inline-block h-6 w-12">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-full w-full cursor-pointer rounded-full bg-stone/30 transition-colors peer-checked:bg-orange" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 cursor-pointer rounded-full bg-white transition-transform peer-checked:translate-x-6" />
              </label>
            </div>
            <p className="text-sm text-stone">
              Get reminders for your morning plan and weekly review
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 ml-1 text-sm text-stone">Subscription</h2>
          <button
            type="button"
            onClick={() => navigate("/app/upgrade")}
            className="flex w-full items-center justify-between rounded-2xl bg-linen p-6 text-left transition-colors hover:bg-parchment/50"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-stone" />
              <div>
                <p style={{ fontWeight: 600 }}>Upgrade to Paid</p>
                <p className="text-sm text-stone">
                  {planLabel} · {planLabel === "Free" ? "5 tasks limit" : "Subscriber"}
                </p>
              </div>
            </div>
            <span className="text-stone">→</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => void signOut().then(() => navigate("/app"))}
          className="flex w-full items-center gap-3 rounded-2xl bg-linen p-6 text-left transition-colors hover:bg-parchment/50"
        >
          <LogOut className="h-5 w-5 text-stone" />
          <p style={{ fontWeight: 600 }}>Sign out</p>
        </button>
      </div>
    </div>
  );
}
