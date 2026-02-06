import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { useTitle } from "@/hooks/useTitle";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import SheroLogo from "@/assets/logo/shero.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Signup = () => {
  useTitle("Create Account");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register: signupUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setError("");

    try {
      await signupUser(data);
      navigate("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <img src={SheroLogo} alt="Shero" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-sora text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Join SHERO today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                {error}
              </div>
            )}

            <Input
              id="signup-name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.name?.message}
              {...register("name")}
              size="xl"
            />

            <Input
              id="signup-email"
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register("email")}
              size="xl"
            />

            <Input
              id="signup-phone"
              type="tel"
              label="Phone Number"
              placeholder="0244123456"
              leftIcon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register("phone")}
              size="xl"
            />

            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
              size="xl"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <Input
              id="signup-confirm-password"
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              size="xl"
            />

            <Button
              type="submit"
              variant="brand"
              disabled={isSubmitting}
              className="w-full font-bold mt-6"
              size="xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600! dark:text-emerald-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
