import SignupForm from '../components/auth/SignupForm';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary-600">NutriScan</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
