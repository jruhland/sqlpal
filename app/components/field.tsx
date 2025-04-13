export function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-red-600">{children}</div>;
}
