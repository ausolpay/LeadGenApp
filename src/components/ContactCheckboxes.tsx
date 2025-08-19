'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Business, ContactState } from '@/types/business'
import { useContactedStore } from '@/stores/contacted-store'
import { useExcludeStore } from '@/stores/exclude-store'
import { Phone, Mail } from 'lucide-react'

interface ContactCheckboxesProps {
  business: Business
}

export function ContactCheckboxes({ business }: ContactCheckboxesProps) {
  const { markContacted, isContacted } = useContactedStore()
  const { addToExclude } = useExcludeStore()
  
  const contacted = isContacted(business.placeId)
  const currentContact = business.contact || { called: false, emailed: false }

  const handleContactChange = (type: 'called' | 'emailed', checked: boolean) => {
    const newContact: ContactState = {
      ...currentContact,
      [type]: checked,
      contactedAt: new Date().toISOString(),
    }

    // Determine contacted via
    if (newContact.called && newContact.emailed) {
      newContact.contactedVia = 'both'
    } else if (newContact.called) {
      newContact.contactedVia = 'called'
    } else if (newContact.emailed) {
      newContact.contactedVia = 'emailed'
    }

    // Update the contact state immediately for visual feedback
    const updatedBusiness = { ...business, contact: newContact }
    
    // If either is checked, mark as contacted and add to exclude
    if (newContact.called || newContact.emailed) {
      // Small delay to allow button to show as pressed before moving
      setTimeout(() => {
        markContacted(updatedBusiness, newContact)
        addToExclude(business.placeId)
      }, 100)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentContact.called ? "default" : "outline"}
        size="sm"
        onClick={() => handleContactChange('called', !currentContact.called)}
        disabled={contacted}
        className={`text-xs h-8 px-3 ${currentContact.called ? 'bg-blue-600 text-white' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}
      >
        <Phone className="h-3 w-3 mr-1" />
        Called
      </Button>
      
      <Button
        variant={currentContact.emailed ? "default" : "outline"}
        size="sm"
        onClick={() => handleContactChange('emailed', !currentContact.emailed)}
        disabled={contacted}
        className={`text-xs h-8 px-3 ${currentContact.emailed ? 'bg-green-600 text-white' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
      >
        <Mail className="h-3 w-3 mr-1" />
        Emailed
      </Button>
    </div>
  )
}
