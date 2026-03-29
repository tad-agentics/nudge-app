import { useNavigate } from "react-router";
import { Calendar, Bell, CreditCard, LogOut } from "lucide-react";

export function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/app")}
          className="text-stone hover:text-espresso transition-colors mb-8"
        >
          ← Back
        </button>

        <h1 className="text-4xl mb-12" style={{ fontWeight: 700 }}>
          Settings
        </h1>

        {/* Profile Section */}
        <div className="mb-8">
          <h2 className="text-sm text-stone mb-3 ml-1">Profile</h2>
          <div className="bg-linen rounded-2xl p-6">
            <div className="mb-4">
              <p className="text-sm text-stone mb-1">Name</p>
              <p style={{ fontWeight: 600 }}>Sarah</p>
            </div>
            <div>
              <p className="text-sm text-stone mb-1">Email</p>
              <p style={{ fontWeight: 600 }}>sarah@example.com</p>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <h2 className="text-sm text-stone mb-3 ml-1">Calendar</h2>
          <div className="bg-linen rounded-2xl divide-y divide-parchment">
            <button className="w-full p-6 flex items-center justify-between text-left hover:bg-parchment/50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-stone" />
                <div>
                  <p style={{ fontWeight: 600 }}>Connect Google Calendar</p>
                  <p className="text-sm text-stone">Not connected</p>
                </div>
              </div>
            </button>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p style={{ fontWeight: 600 }}>Don't schedule my tasks</p>
                <p className="text-sm text-stone">Turn off automatic calendar scheduling</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-full h-full bg-stone/30 peer-checked:bg-orange rounded-full transition-colors cursor-pointer"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6 cursor-pointer"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-8">
          <h2 className="text-sm text-stone mb-3 ml-1">Notifications</h2>
          <div className="bg-linen rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-stone" />
                <p style={{ fontWeight: 600 }}>Push notifications</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-full h-full bg-stone/30 peer-checked:bg-orange rounded-full transition-colors cursor-pointer"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6 cursor-pointer"></div>
              </label>
            </div>
            <p className="text-sm text-stone">
              Get reminders for your morning plan and weekly review
            </p>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="mb-8">
          <h2 className="text-sm text-stone mb-3 ml-1">Subscription</h2>
          <button
            onClick={() => navigate("/app/upgrade")}
            className="w-full bg-linen rounded-2xl p-6 flex items-center justify-between text-left hover:bg-parchment/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-stone" />
              <div>
                <p style={{ fontWeight: 600 }}>Upgrade to Paid</p>
                <p className="text-sm text-stone">Free • 5 tasks limit</p>
              </div>
            </div>
            <span className="text-stone">→</span>
          </button>
        </div>

        {/* Sign Out */}
        <button className="w-full bg-linen rounded-2xl p-6 flex items-center gap-3 text-left hover:bg-parchment/50 transition-colors">
          <LogOut className="w-5 h-5 text-stone" />
          <p style={{ fontWeight: 600 }}>Sign out</p>
        </button>
      </div>
    </div>
  );
}