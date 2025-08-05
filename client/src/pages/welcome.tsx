import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, ArrowLeft, MessageCircle, UserPlus } from "lucide-react";

type Screen = 'welcome' | 'login' | 'signup';

export default function Welcome() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    country: '',
    gender: '',
  });

  const handleLogin = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  const handleSignup = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  if (currentScreen === 'welcome') {
    return (
      <div className="gradient-bg min-h-screen relative overflow-hidden floating-shapes">
        {/* Status Bar */}
        <div className="flex justify-between items-center p-4 text-white text-sm">
          <span>11:27</span>
          <div className="flex items-center space-x-1">
            <span>📶 📶 33% 🔋</span>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex flex-col items-center justify-center h-full px-8 relative z-10">
          {/* Welcome Speech Bubble */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 mb-16 animate-fade-in">
            <p className="text-white font-medium" data-testid="welcome-text">WELCOME</p>
          </div>

          {/* App Logo */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm transform rotate-12 rounded-2xl p-8 mb-16 animate-slide-up">
            <h1 className="text-6xl font-bold text-white transform -rotate-12" data-testid="app-logo">ChatMe</h1>
          </div>

          {/* Tagline */}
          <h2 className="text-white text-xl font-medium mb-16 text-center" data-testid="tagline">ENJOY YOUR CHAT</h2>

          {/* Start Button */}
          <Button 
            onClick={() => setCurrentScreen('login')}
            className="bg-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,45%)] text-white font-semibold py-4 px-12 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-start"
          >
            START
          </Button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="gradient-bg min-h-screen relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentScreen('welcome')}
            className="text-white hover:bg-white/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-xl font-semibold" data-testid="text-login-title">Login</h1>
          <div></div>
        </div>

        {/* Login Form */}
        <div className="px-6 mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800" data-testid="text-welcome-back">Welcome Back!</h2>
              <p className="text-gray-600 mt-2" data-testid="text-signin-subtitle">Sign in to continue chatting</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
              {/* Username Field */}
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                <div className="relative mt-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(196,100%,50%)] focus:border-transparent"
                    data-testid="input-username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(196,100%,50%)] focus:border-transparent"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit"
                className="w-full gradient-bg text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                data-testid="button-signin"
              >
                Sign In
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setCurrentScreen('signup')}
                  className="text-[hsl(196,100%,50%)] font-semibold p-0 h-auto"
                  data-testid="link-signup"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <div className="gradient-reverse min-h-screen relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentScreen('login')}
            className="text-white hover:bg-white/20"
            data-testid="button-back-signup"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-xl font-semibold" data-testid="text-signup-title">Sign Up</h1>
          <div></div>
        </div>

        {/* Sign Up Form */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[hsl(269,41%,56%)] to-[hsl(337,100%,70%)] rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800" data-testid="text-join-title">Join ChatMe!</h2>
              <p className="text-gray-600 mt-2" data-testid="text-create-account-subtitle">Create your account to start chatting</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
              {/* Username */}
              <div>
                <Label htmlFor="signup-username" className="text-gray-700 font-medium">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(269,41%,56%)] focus:border-transparent"
                  data-testid="input-signup-username"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(269,41%,56%)] focus:border-transparent"
                  data-testid="input-signup-email"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    className="px-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(269,41%,56%)] focus:border-transparent"
                    data-testid="input-signup-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-signup-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country" className="text-gray-700 font-medium">Country</Label>
                <Select onValueChange={(value) => setSignupData(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger className="mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(269,41%,56%)] focus:border-transparent" data-testid="select-country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div>
                <Label className="text-gray-700 font-medium">Gender</Label>
                <RadioGroup 
                  className="flex space-x-4 mt-2"
                  onValueChange={(value) => setSignupData(prev => ({ ...prev, gender: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" data-testid="radio-male" />
                    <Label htmlFor="male" className="text-gray-700">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" data-testid="radio-female" />
                    <Label htmlFor="female" className="text-gray-700">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                    <Label htmlFor="other" className="text-gray-700">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Sign Up Button */}
              <Button 
                type="submit"
                className="w-full gradient-reverse text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-6"
                data-testid="button-create-account"
              >
                Create Account
              </Button>

              {/* Login Link */}
              <div className="text-center mt-4">
                <span className="text-gray-600">Already have an account? </span>
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setCurrentScreen('login')}
                  className="text-[hsl(269,41%,56%)] font-semibold p-0 h-auto"
                  data-testid="link-login"
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
