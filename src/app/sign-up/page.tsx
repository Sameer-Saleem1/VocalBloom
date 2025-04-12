"use client";
import Image from "next/image";
import LoginBG from "../../../public/images/loginBG.svg";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import InfoIcon from "@mui/icons-material/Info";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { update, ref, set } from "firebase/database";
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
  console.log(showStrength);

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
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update password fields separately
    if (name === "password") {
      setPassword(value);
      setPasswordStrength(validatePassword(value)); // Ensure password validation works
    }
    if (name === "confirmPassword") {
      setConfirmPassword(value);
      setPasswordMatch(password === value); // Ensure matching logic works
    }
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

      await update(ref(db, `Authentication/users/${user.uid}`), {
        progress: {
          beginnerLevel: 0,
          mediumLevel: 0,
          intermediateLevel: 0,
          expertLevel: 0,
        },
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
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${LoginBG.src})`,
      }}
    >
      <h2 className="text-3xl font-bold mb-10 text-[#cb8867]">
        Register Your Account
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="relative -left-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={userData.password} // Bind it to userData
              onChange={handleChange} // Use handleChange function
              onBlur={handlePasswordBlur}
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
        </div>
        <div>
          <div className="absolute flex items-center">
            <div className="relative flex items-center -left-6 top-2">
              <div className="relative group">
                <button className="text-gray-500">
                  <InfoIcon fontSize="small" />
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-64 p-2 bg-gray-700 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                  Password must be at least 8 characters long and include at
                  least one uppercase letter, one number, and one special
                  character.
                </div>
              </div>
            </div>
          </div>
          <div className="relative -right-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword" // Ensure this matches the state property
              value={userData.confirmPassword} // Bind it to userData
              onChange={handleChange} // Use handleChange function
              className="w-60 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter your password"
            />
            {!passwordMatch && (
              <p className="mt-1 text-sm text-red-600">
                Passwords do not match
              </p>
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
        </div>
      </div>
      <button
        onClick={handleSignup}
        className="bg-[#e9bfa3] font-semibold text-lg text-gray-800 p-2 rounded w-1/8 cursor-pointer hover:bg-[#d8a78c] transition duration-300 ease-in-out"
      >
        Signup
      </button>
      <p className="py-2">
        Already have an account?{" "}
        <span
          className="cursor-pointer font-semibold underline hover:text-[#d9a58c] transition"
          onClick={() => router.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
}
