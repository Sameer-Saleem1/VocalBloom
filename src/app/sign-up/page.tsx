"use client";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import InfoIcon from "@mui/icons-material/Info";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [showStrength, setShowStrength] = useState<boolean>(false);

  const [userData, setUserData] = useState({
    Name: "",
    FatherName: "",
    Email: "",
    childAge: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.Email,
        userData.password
      );
      const user = userCredential.user;

      await set(ref(db, `Authentication/users/${user.uid}`), {
        Name: userData.Name,
        FatherName: userData.FatherName,
        Email: userData.Email,
        childAge: userData.childAge,
        UserID: user.uid,
      });

      router.push("/"); // Redirect after signup
    } catch (error) {
      console.error(error);
      alert("Error signing up!");
    }
  };

  const validatePassword = (password: string): string => {
    const strongRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password.length === 0) return "";
    if (strongRegex.test(password)) return "Strong";
    return "Weak";
  };

  const handlePasswordBlur = () => {
    if (passwordStrength === "Strong") {
      setShowStrength(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(password === newConfirmPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Signup</h2>
      <input
        type="text"
        name="Name"
        placeholder="Name"
        onChange={handleChange}
        className="border p-2 m-2 w-60 border rounded-lg"
      />
      <input
        type="text"
        name="FatherName"
        placeholder="Father's Name"
        onChange={handleChange}
        className="border p-2 m-2 w-60 border rounded-lg"
      />
      <input
        type="email"
        name="Email"
        placeholder="Email"
        onChange={handleChange}
        className="border p-2 m-2 w-60 border rounded-lg"
      />
      <input
        type="number"
        max={12}
        min={4}
        name="childAge"
        placeholder="Child's Age"
        onChange={handleChange}
        className="border p-2 m-2 w-60 border rounded-lg"
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onBlur={handlePasswordBlur}
          onChange={handlePasswordChange}
          className="w-60 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a strong password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
      <p
        className={`mt-1 text-sm ${
          passwordStrength === "Strong" ? "text-green-600" : "text-red-600"
        }`}
      >
        {passwordStrength && `Password Strength: ${passwordStrength}`}
      </p>
      <div className="absolute  flex items-center">
        <div className="absolute top-18 left-30 group ">
          <button className="text-gray-500">
            <InfoIcon />
          </button>
          <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            Password must be at least 8 characters long and include at least one
            uppercase letter, one number, and one special character.
          </div>
        </div>
      </div>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className="w-60 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Re-enter your password"
        />
        {!passwordMatch && (
          <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
        )}
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-600"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </button>
      </div>
      <p
        className={`mt-1 text-sm ${
          passwordStrength === "Strong" ? "text-green-600" : "text-red-600"
        }`}
      ></p>
      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Signup
      </button>
    </div>
  );
}
