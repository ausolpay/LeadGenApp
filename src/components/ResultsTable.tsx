'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ExternalLink, Phone, MapPin, Mail, Printer } from 'lucide-react'
import { Business } from '@/types/business'
import { useResultsStore } from '@/stores/results-store'
import { useContactedStore } from '@/stores/contacted-store'
import { SellingPointsBadges } from '@/components/SellingPointsBadges'
import { ContactCheckboxes } from '@/components/ContactCheckboxes'
import { NotesCell } from '@/components/NotesCell'
import { hasMobilePhone, hasOfficePhone } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/Pagination'

const columnHelper = createColumnHelper<Business>()

export function ResultsTable() {
  const { results, allResults, filters, sort, isLoading } = useResultsStore()
  const { isContacted } = useContactedStore()

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Results Report</title>
          <style>
            @page { size: A4 landscape; margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .selling-points { font-size: 10px; }
            .notes { max-width: 150px; word-wrap: break-word; font-size: 10px; }
            .contacted { opacity: 0.6; background-color: #f9f9f9; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Business Results Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Total: ${allResults.length} businesses found</p>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allResults.map(business => `
                <tr${isContacted(business.placeId) ? ' class="contacted"' : ''}>
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
                  <td>${isContacted(business.placeId) ? 'Contacted' : 'Not Contacted'}</td>
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

  // Apply filters to current page results
  const filteredData = useMemo(() => {
    return results.filter((business) => {
      // Don't exclude contacted businesses - show them greyed out instead

      // Ensure filters object has all required properties
      const safeFilters = {
        suburbs: filters.suburbs || [],
        postcodes: filters.postcodes || [],
        hasMobile: filters.hasMobile || false,
        hasOffice: filters.hasOffice || false,
        noWebsite: filters.noWebsite || false,
        facebookOnly: filters.facebookOnly || false,
        likelyOutdated: filters.likelyOutdated || false,
        sellingPoints: filters.sellingPoints || [],
      }

      // Suburb filter
      if (safeFilters.suburbs.length > 0 && business.suburb) {
        if (!safeFilters.suburbs.some(suburb => 
          business.suburb?.toLowerCase().includes(suburb.toLowerCase())
        )) {
          return false
        }
      }

      // Postcode filter
      if (safeFilters.postcodes.length > 0 && business.postcode) {
        if (!safeFilters.postcodes.includes(business.postcode)) {
          return false
        }
      }

      // Phone filters
      if (safeFilters.hasMobile && !hasMobilePhone(business.phoneFormatted)) {
        return false
      }
      if (safeFilters.hasOffice && !hasOfficePhone(business.phoneFormatted)) {
        return false
      }

      // Selling points filters
      if (safeFilters.noWebsite && !business.sellingPoints.includes('no-website')) {
        return false
      }
      if (safeFilters.facebookOnly && !business.sellingPoints.includes('facebook-only')) {
        return false
      }
      if (safeFilters.likelyOutdated && !business.sellingPoints.includes('likely-outdated')) {
        return false
      }

      // New selling points array filter
      if (safeFilters.sellingPoints.length > 0) {
        if (!safeFilters.sellingPoints.some(point => business.sellingPoints.includes(point))) {
          return false
        }
      }

      return true
    })
  }, [results, filters])

  // Apply sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    
    if (sort === 'most-active') {
      sorted.sort((a, b) => {
        // Primary: rating count desc
        if ((b.ratingCount || 0) !== (a.ratingCount || 0)) {
          return (b.ratingCount || 0) - (a.ratingCount || 0)
        }
        // Secondary: rating desc
        if ((b.rating || 0) !== (a.rating || 0)) {
          return (b.rating || 0) - (a.rating || 0)
        }
        // Tertiary: name asc
        return a.name.localeCompare(b.name)
      })
    } else if (sort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return sorted
  }, [filteredData, sort])

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.category || row.original.types[0]}
          </div>
        </div>
      ),
    }),
    
    columnHelper.accessor('address', {
      header: 'Location',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">
            {row.original.suburb && row.original.postcode 
              ? `${row.original.suburb} ${row.original.postcode}`
              : row.original.address
            }
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-xs"
          >
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(row.original.name + ' ' + row.original.address)}`}
              target="_blank" 
              rel="noopener noreferrer"
              title="View on Google Maps"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Maps
            </a>
          </Button>
        </div>
      ),
    }),
    
    columnHelper.accessor('phoneFormatted', {
      header: 'Phone',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.phoneFormatted ? (
            <>
              <div className="text-sm">{row.original.phoneFormatted}</div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-6 px-2 text-xs"
              >
                <a 
                  href={`tel:${row.original.phoneRaw}`}
                  title="Call this number"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </a>
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    }),
    
    columnHelper.accessor('websiteUrl', {
      header: 'Website',
      cell: ({ row }) => (
        row.original.websiteUrl ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-xs"
          >
            <a 
              href={row.original.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Visit website"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit
            </a>
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      ),
    }),
    
    columnHelper.accessor('sellingPoints', {
      header: 'Selling Points',
      cell: ({ row }) => (
        <SellingPointsBadges sellingPoints={row.original.sellingPoints} />
      ),
    }),
    
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: ({ row }) => (
        <NotesCell business={row.original} />
      ),
    }),
    
    columnHelper.accessor('contact', {
      header: 'Contact',
      cell: ({ row }) => (
        <ContactCheckboxes business={row.original} />
      ),
    }),
  ]

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching for businesses...</p>
        </div>
      </div>
    )
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {allResults.length === 0 
            ? 'No search results yet. Try searching for a business type above.'
            : 'No results match your current filters. Try adjusting your filters.'
          }
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
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const isContactedBusiness = isContacted(row.original.placeId)
                return (
                  <tr
                    key={row.id}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      isContactedBusiness ? 'opacity-50 bg-gray-50' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination />
    </div>
  )
}