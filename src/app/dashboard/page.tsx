import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/auth-button';
import { AutomationMonitor } from '@/components/ui/automation-monitor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('Auth error:', authError);
      redirect('/');
    }

    if (!session) {
      redirect('/');
    }

    // Fetch user's active automations
    const { data: automations, error: automationsError } = await supabase
      .from('user_automations')
      .select(`
        *,
        automation:automation_id (
          id,
          name,
          description
        )
      `)
      .eq('user_id', session.user.id);

    if (automationsError) {
      console.error('Error fetching automations:', automationsError);
    }

    const { user } = session;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to TaskWhiz</h1>
            <p className="text-gray-600 mt-2">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
        
        <div className="grid gap-6">
          {automations && automations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {automations.map((userAutomation) => (
                <AutomationMonitor
                  key={userAutomation.id}
                  automationId={userAutomation.automation_id}
                  name={userAutomation.automation.name}
                  description={userAutomation.automation.description}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Get Started with Automations</h2>
              <p className="text-gray-600 mb-4">
                Browse our marketplace to find pre-built automation solutions that can help streamline your workflow.
              </p>
              <Link href="/automations">
                <Button>
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/');
  }
}
