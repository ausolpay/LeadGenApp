'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, CreditCard, Settings, LogOut, Save, MapPin } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { CAIRNS_SUBURBS, CAIRNS_POSTCODES } from '@/data/locations'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    phone: '',
    default_location: 'Cairns, QLD',
    default_suburbs: [] as string[],
    default_postcodes: [] as string[],
    filter_has_mobile: false,
    filter_no_website: false,
  })
  
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          setFormData({
            full_name: profileData.full_name || session.user.user_metadata?.full_name || '',
            company: profileData.company || '',
            phone: profileData.phone || '',
            default_location: profileData.default_location || 'Cairns, QLD',
            default_suburbs: profileData.default_suburbs || [],
            default_postcodes: profileData.default_postcodes || [],
            filter_has_mobile: profileData.filter_has_mobile || false,
            filter_no_website: profileData.filter_no_website || false,
          })
        }
      } else {
        router.push('/auth')
      }
    }
    getUser()
  }, [router, supabase])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const getUserInitials = (email: string) => {
    return email?.charAt(0)?.toUpperCase() || 'U'
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-blue-900">Profile Settings</h1>
            </div>

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
                    <p className="font-medium">{profile?.full_name || user.email}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {profile?.plan === 'lifetime' && (
                      <Badge variant="secondary" className="text-xs">Lifetime</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/app')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to App
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Messages */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'error' 
                    ? 'bg-red-50 border border-red-200 text-red-700' 
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Personal Details */}
              <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Personal Details</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (AU Format)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g., 04 1234 5678"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Defaults */}
              <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">App Defaults</CardTitle>
                  <CardDescription>
                    Set your default search preferences and filters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_location">Default Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="default_location"
                        value={formData.default_location}
                        onChange={(e) => setFormData(prev => ({ ...prev, default_location: e.target.value }))}
                        className="pl-10"
                        placeholder="e.g., Cairns, QLD"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter_has_mobile"
                        checked={formData.filter_has_mobile}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, filter_has_mobile: !!checked }))}
                      />
                      <Label htmlFor="filter_has_mobile" className="text-sm">
                        Prefer businesses with mobile numbers
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter_no_website"
                        checked={formData.filter_no_website}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, filter_no_website: !!checked }))}
                      />
                      <Label htmlFor="filter_no_website" className="text-sm">
                        Show businesses without websites
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/app')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to App
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/billing')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/account')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
