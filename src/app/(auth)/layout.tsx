export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {children}
      </div>
    </div>
  )
}
