import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// TODO(auth): replace with real session data once auth is wired up —
// mirrors the same placeholder used in Topbar for now.
const CURRENT_USER = {
  name: "Leonard Campbell",
  email: "leonard_campbell@xyz.com",
  avatarUrl: "https://i.pravatar.cc/80?img=47",
};

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

      <Card className="mt-6 max-w-lg p-6">
        <div className="flex items-center gap-4">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="text-base font-semibold text-gray-900">{CURRENT_USER.name}</p>
            <p className="text-sm text-gray-500">{CURRENT_USER.email}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Account settings, password changes, and notification preferences will go here
            once auth is implemented.
          </p>
        </div>

        <div className="mt-4">
          <Button variant="outline" disabled title="Coming once auth is wired up">
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}