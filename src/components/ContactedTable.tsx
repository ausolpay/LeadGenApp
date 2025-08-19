'use client'

import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { RotateCcw, ExternalLink, Phone, Mail, Printer } from 'lucide-react'
import { Business, ContactState } from '@/types/business'
import { useContactedStore } from '@/stores/contacted-store'
import { useExcludeStore } from '@/stores/exclude-store'
import { SellingPointsBadges } from './SellingPointsBadges'
import { NotesCell } from './NotesCell'
import { formatPhoneNumber } from '@/lib/utils'

export function ContactedTable() {
  const { contactedMap, uncontact } = useContactedStore()
  const { removeFromExclude } = useExcludeStore()
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  
  // Use useMemo to prevent infinite re-renders
  const contactedBusinesses = useMemo(() => {
    return Array.from(contactedMap.values())
  }, [contactedMap])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contacted Businesses Report</title>
          <style>
            @page { size: A4 landscape; margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .contact-info { font-size: 10px; }
            .selling-points { font-size: 10px; }
            .notes { max-width: 200px; word-wrap: break-word; font-size: 10px; white-space: pre-wrap; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Contacted Businesses Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Total: ${contactedBusinesses.length} contacted businesses</p>
          </div>
                             <table>
                     <thead>
                       <tr>
                         <th>Name</th>
                         <th>Category</th>
                         <th>Location</th>
                         <th>Phone</th>
                         <th>Website</th>
                         <th>Selling Points</th>
                         <th>Notes</th>
                         <th>Contact Info</th>
                       </tr>
                     </thead>
            <tbody>
              ${contactedBusinesses.map(business => `
                <tr>
                  <td>${business.name}</td>
                  <td>${business.category}</td>
                  <td>${business.suburb}, ${business.postcode}</td>
                  <td>${business.phoneFormatted || 'No phone'}</td>
                  <td>${business.websiteUrl || 'No website'}</td>
                  <td class="selling-points">
                    ${business.sellingPoints ? business.sellingPoints.map(point => 
                      point === 'no-website' ? 'No Website' :
                      point === 'facebook-only' ? 'Facebook Only' :
                      point === 'likely-outdated' ? 'Outdated Website' :
                      point === 'no-phone' ? 'No Phone' :
                      point === 'low-ratings' ? 'Low Ratings' :
                      point === 'no-reviews' ? 'No Reviews' :
                      point === 'old-business' ? 'Established Business' :
                      point === 'home-based' ? 'Home Based' :
                      point === 'mobile-business' ? 'Mobile Business' :
                      point === 'seasonal-business' ? 'Seasonal' :
                      point === 'weekend-only' ? 'Weekend Only' :
                      point === 'cash-only' ? 'Cash Only' :
                      point === 'no-social-media' ? 'No Social Media' :
                      point === 'runs-ads' ? 'Runs Ads' :
                      point
                    ).join(', ') : ''}
                  </td>
                  <td class="notes">
                    ${business.notes || ''}
                  </td>
                  <td class="contact-info">
                    ${business.contact ? `
                      ${business.contact.contactedVia === 'called' ? 'Called' : 
                        business.contact.contactedVia === 'emailed' ? 'Emailed' : 
                        business.contact.contactedVia === 'both' ? 'Called & Emailed' : 'Contacted'}
                      ${business.contact.contactedAt ? `<br/>${new Date(business.contact.contactedAt).toLocaleDateString()}` : ''}
                    ` : 'No contact info'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleUncontact = async (business: Business) => {
    if (removingIds.has(business.placeId)) {
      return // Prevent multiple clicks
    }
    
    // Mark as removing immediately
    setRemovingIds(prev => new Set(prev).add(business.placeId))
    
    try {
      removeFromExclude(business.placeId)
      await uncontact(business.placeId)
    } catch (error) {
      console.error('Error uncontacting business:', error)
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(business.placeId)
        return newSet
      })
    }
  }

  const columns: ColumnDef<Business>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(row.original.name + ' ' + row.original.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {row.original.name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.category}</span>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.suburb}</div>
          <div className="text-gray-500">{row.original.postcode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'phoneFormatted',
      header: 'Phone',
      cell: ({ row }) => {
        if (!row.original.phoneFormatted) return <span className="text-gray-400">No phone</span>
        return (
          <a
            href={`tel:${row.original.phoneRaw || row.original.phoneFormatted}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Phone className="h-3 w-3" />
            {row.original.phoneFormatted}
          </a>
        )
      },
    },
    {
      accessorKey: 'websiteUrl',
      header: 'Website',
      cell: ({ row }) => {
        if (!row.original.websiteUrl) return <span className="text-gray-400">No website</span>
        return (
          <a
            href={row.original.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Visit
          </a>
        )
      },
    },
    {
      accessorKey: 'sellingPoints',
      header: 'Selling Points',
      cell: ({ row }) => <SellingPointsBadges sellingPoints={row.original.sellingPoints} />,
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => <NotesCell business={row.original} isContacted={true} />,
    },
    {
      accessorKey: 'contact',
      header: 'Contact Info',
      cell: ({ row }) => {
        const contact = row.original.contact
        if (!contact) return <span className="text-gray-400">No contact info</span>
        
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-1">
              {contact.contactedVia === 'called' && <Phone className="h-3 w-3 text-blue-600" />}
              {contact.contactedVia === 'emailed' && <Mail className="h-3 w-3 text-green-600" />}
              {contact.contactedVia === 'both' && (
                <>
                  <Phone className="h-3 w-3 text-blue-600" />
                  <Mail className="h-3 w-3 text-green-600" />
                </>
              )}
              <span className="capitalize">{contact.contactedVia}</span>
            </div>
            {contact.contactedAt && (
              <div className="text-gray-500 text-xs">
                {new Date(contact.contactedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          onClick={() => handleUncontact(row.original)}
          disabled={removingIds.has(row.original.placeId)}
          className="h-6 px-2 text-xs border border-input bg-accent text-accent-foreground hover:bg-accent/80 inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          {removingIds.has(row.original.placeId) ? 'Removing...' : 'Uncontact'}
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: contactedBusinesses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (contactedBusinesses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No contacted businesses yet. Mark businesses as called or emailed to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handlePrint}
          className="h-8 px-3 text-xs border border-input bg-accent text-accent-foreground hover:bg-accent/80 inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Printer className="h-3 w-3 mr-1" />
          Print Report
        </Button>
      </div>
      <div className="rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-sm text-muted-foreground border-t">
          {contactedBusinesses.length} contacted business{contactedBusinesses.length !== 1 ? 'es' : ''}
        </div>
      </div>
    </div>
  )
}
