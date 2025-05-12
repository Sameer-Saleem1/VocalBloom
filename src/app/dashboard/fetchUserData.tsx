import { ref, get } from "firebase/database";
import { db } from "../firebase/config";

export async function fetchUserData(uid: string) {
  const snapshot = await get(ref(db, uid));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error("User data not found");
  }
}
