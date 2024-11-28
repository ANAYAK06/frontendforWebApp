import React, { useState } from 'react';
import { 
  TbHexagonLetterS,
  TbBuildingFactory2,
  TbChartInfographic,
  TbClipboardCheck,
  TbBuildingSkyscraper
} from "react-icons/tb";

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <TbHexagonLetterS className="mx-auto h-12 w-auto text-indigo-700" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
            Log in to Your Account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6" method="POST">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder:bg-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder:bg-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-indigo-700 px-12">
        <div className="space-y-12 text-white">
          <h2 className="text-4xl font-bold mb-8">
            Streamline Your Construction & Manufacturing Operations
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <TbBuildingSkyscraper size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Project Management</h3>
                <p className="text-indigo-200">Track and manage construction projects in real-time</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <TbBuildingFactory2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Production Planning</h3>
                <p className="text-indigo-200">Optimize manufacturing processes and resource allocation</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <TbChartInfographic size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                <p className="text-indigo-200">Make data-driven decisions with real-time insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <TbClipboardCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Quality Control</h3>
                <p className="text-indigo-200">Maintain high standards across all operations</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-indigo-600">
            <p className="text-indigo-200 text-sm">
              Trusted by leading construction and manufacturing companies worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;