'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'
import { FiltersBar } from '@/components/FiltersBar'
import { ResultsTable } from '@/components/ResultsTable'
import { ContactedTable } from '@/components/ContactedTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResultsStore } from '@/stores/results-store'
import { useContactedStore } from '@/stores/contacted-store'
import { useLocationStore } from '@/stores/location-store'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, CreditCard, Settings, LogOut } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('results')
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { results, allResults, isLoading } = useResultsStore()
  const { getContactedBusinesses, setUserId, isLoading: contactedLoading } = useContactedStore()
  const contactedBusinesses = useMemo(() => getContactedBusinesses(), [getContactedBusinesses])
  const { city, region, country } = useLocationStore()
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  // Fix hydration error by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true)
    // Set document title to match landing page
    document.title = 'LumaLead.io - Find Business Prospects Effortlessly'
  }, [])

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await setUserId(session.user.id) // Set user ID for contacted store (now async)
      } else {
        router.push('/auth')
      }
    }
    getUser()
  }, [router, supabase.auth, setUserId])

  // Redirect to setup if no location is configured
  useEffect(() => {
    if (isClient && (!city || !region || !country)) {
      router.push('/setup')
    }
  }, [city, region, country, router, isClient])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const getUserInitials = (email: string) => {
    return email?.charAt(0)?.toUpperCase() || 'U'
  }

  // Don't render until client-side and user is loaded
  if (!isClient || !user) {
    return <div className="container mx-auto px-2 py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* App Header */}
      <header className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = 'https://www.lumalead.io/'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1a597c'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold" style={{color: '#1a597c'}}>LumaLead.io</span>
            </div>

            <div className="flex-1"></div>

            {/* Right - Location and Profile */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/setup')}
                className="border-gray-200 hover:bg-gray-50"
                style={{color: '#1a597c'}}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Change Location
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-white">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                      <AvatarFallback className="text-white" style={{backgroundColor: '#1a597c'}}>
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="w-full mb-6">
            <SearchBar onSearchComplete={() => setActiveTab('results')} />
          </div>
          <p className="text-center" style={{color: '#1a597c'}}>
            Find and manage business prospects in {city}, {region}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="results" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
              Results ({allResults.length})
            </TabsTrigger>
            <TabsTrigger value="contacted" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
              Contacted ({contactedBusinesses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6">
            <FiltersBar />
            <ResultsTable />
          </TabsContent>

          <TabsContent value="contacted" className="mt-6">
            <ContactedTable />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 Corah Media Pty Ltd. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
