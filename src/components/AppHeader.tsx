import { useUser, setUser } from "@/store/orders";

export function AppHeader() {
  const user = useUser();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">E</div>
          <h1 className="text-base font-bold tracking-tight">EASYPRINT</h1>
        </div>
        {user && (
          <button
            onClick={() => setUser(null)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            {user.name.split(" ")[0]} · Sign out
          </button>
        )}
      </div>
    </header>
  );
}