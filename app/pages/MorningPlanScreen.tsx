import { useNavigate } from "react-router";
import { WarmStripe } from "~/components/WarmStripe";
import { mockPlanSlots } from "~/data/mockData";

export function MorningPlanScreen() {
  const navigate = useNavigate();

  const handleApprove = () => {
    navigate("/app/plan/done");
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/app")}
          className="text-stone hover:text-espresso transition-colors mb-8"
        >
          ← Back
        </button>

        <div className="bg-linen rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-parchment">
            <h1 className="text-2xl mb-1" style={{ fontWeight: 700 }}>
              Sunday, March 29
            </h1>
            <p className="text-stone">6 tasks scheduled</p>
          </div>
          
          <WarmStripe />

          <div className="p-6">
            <p className="text-sm text-stone mb-6">
              Your day is planned. 6 tasks scheduled — review and approve.
            </p>

            <div className="space-y-4 mb-8">
              {mockPlanSlots.map((slot, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-sm text-stone w-20 flex-shrink-0 pt-1">
                    {slot.time}
                  </span>
                  {slot.type === "task" ? (
                    <div className="flex-1 bg-orange/20 rounded-lg p-3">
                      <p style={{ fontWeight: 600 }}>{slot.title}</p>
                    </div>
                  ) : (
                    <div className="flex-1 bg-stone/10 rounded-lg p-3">
                      <p className="text-stone">{slot.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/app/plan/done")}
              className="w-full px-6 py-4 bg-ink text-cream rounded-2xl hover:opacity-90 transition-opacity"
              style={{ fontWeight: 600 }}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}