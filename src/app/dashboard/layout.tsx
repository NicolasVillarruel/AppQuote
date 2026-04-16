"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setSession(user);

      // Get user profile
      const { data: profileData } = await supabase
        .from("usuarios")
        .select("nombre, rol")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <MobileHeader onMenuClick={() => setMobileOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        userEmail={session?.email}
        userRole={profile?.rol ?? "vendedor"}
        userName={profile?.nombre ?? undefined}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto scrollbar-thin mt-16 lg:mt-0">
        <div className="min-h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
