import PlayScreen from "./components/PlayScreen";
import ProtectedRoute from "./components/protectedRoute";

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <PlayScreen />
      </ProtectedRoute>
    </div>
  );
}
