import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let temp = {};

    if (!email) {
      temp.email = "Email is required";
    } else if (!email.includes("@")) {
      temp.email = "Email must contain @ symbol";
    }

    const specialCharPattern = /[@$!%*?&]/;
    if (!password) {
      temp.password = "Password is required";
    } else if (!specialCharPattern.test(password)) {
      temp.password = "Password must contain at least one special character";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (validate()) {
  //     alert("Signup Successful");
  //   }
  // };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const registeredUsers =
        JSON.parse(localStorage.getItem("registered_users")) || [];

      const userFound = registeredUsers.find(
        (u) => u.email === email && u.password === password,
      );

      if (userFound) {
        const userData = {
          email: userFound.email,
          role: userFound.role,
          name: userFound.name,
        };

        localStorage.setItem("user_session", JSON.stringify(userData));

        alert(`Welcome, ${userFound.name}! Logged in as ${userFound.role}`);
        navigate("/dashboard/checkout");
      } else {
        const emailExists = registeredUsers.find((u) => u.email === email);
        if (!emailExists) {
          alert("Account not found. Please register first.");
          navigate("/signUp");
        } else {
          setErrors({ password: "Incorrect password. Please try again." });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600"></div>
            <h1 className="text-2xl font-semibold">Classifabs</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-1 text-md font-semibold">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-10"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <BsEyeFill /> : <BsEyeSlashFill />}
              </span>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          {/* <div className="flex items-center mb-4">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-black">Remember this Device</span>
          </div> */}
          {/* ADDED: Role Selection Toggle */}
          {/* <div className="mb-6">
            <label className="block text-md font-semibold mb-2">Login as:</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 py-2 rounded-lg border transition-all ${role === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
              > User </button>
              <button 
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2 rounded-lg border transition-all ${role === 'admin' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
              > Admin </button>
            </div>
          </div> */}

          <div className="flex flex-col gap-3">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Sign In
            </button>

            {/* Added by request: Button to remove existing accounts
            <button 
              type="button"
              onClick={() => {
                // Clear user accounts and sessions from LocalStorage
                localStorage.removeItem("registered_users");
                localStorage.removeItem("user_session");
                alert("All existing user accounts have been removed.");
              }}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Remove All User Accounts
            </button> */}
          </div>

          {/* <p className="text-md mt-4">
            New to Classifabs?{" "} */}
          <div className="mt-4">
            <Link to="/signUp" className="text-blue-600">
              Create an account
            </Link>
          </div>
          {/* </p> */}
        </form>
      </div>
    </div>
  );
}
