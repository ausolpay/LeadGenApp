'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useResultsStore } from '@/stores/results-store'

export function Pagination() {
  const { 
    currentPage, 
    totalPages, 
    hasMoreResults, 
    isLoadingMore,
    setCurrentPage, 
    loadMoreResults,
    allResults,
    resultsPerPage 
  } = useResultsStore()

  const [isLoadingNewPage, setIsLoadingNewPage] = useState(false)

  const handlePageChange = (page: number) => {
    // Only navigate to pages we already have data for
    const maxPageWithData = Math.ceil(allResults.length / resultsPerPage)
    
    if (page <= maxPageWithData) {
      setCurrentPage(page)
    }
    // If we need more data, user should use "Load more results" button
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    const maxPageWithData = Math.ceil(allResults.length / resultsPerPage)
    
    if (currentPage < maxPageWithData) {
      // Navigate to next page if we have the data
      setCurrentPage(currentPage + 1)
    }
    // If we need more data, user should use "Load more results" button
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 7
    const maxPageWithData = Math.ceil(allResults.length / resultsPerPage)
    const effectiveMaxPages = Math.min(totalPages, maxPageWithData)
    
    if (effectiveMaxPages <= maxPagesToShow) {
      // Show all pages if we have few enough
      for (let i = 1; i <= effectiveMaxPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        // Near the start
        for (let i = 1; i <= Math.min(5, effectiveMaxPages); i++) {
          pages.push(i)
        }
        if (effectiveMaxPages > 5) {
          pages.push('ellipsis')
          pages.push(effectiveMaxPages)
        }
      } else if (currentPage >= effectiveMaxPages - 3) {
        // Near the end
        pages.push(1)
        pages.push('ellipsis')
        for (let i = Math.max(effectiveMaxPages - 4, 2); i <= effectiveMaxPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(effectiveMaxPages)
      }
    }
    
    return pages
  }

  // Don't show pagination if there's only one page and no more results to load
  if (totalPages <= 1 && !hasMoreResults) {
    return null
  }

  const pageNumbers = getPageNumbers()
  const maxPageWithData = Math.ceil(allResults.length / resultsPerPage)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < maxPageWithData
  const showingStart = (currentPage - 1) * resultsPerPage + 1
  const showingEnd = Math.min(currentPage * resultsPerPage, allResults.length)

  return (
    <div className="flex flex-col gap-4 items-center py-4">
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {showingStart}-{showingEnd} of {allResults.length} results
        {hasMoreResults && <span className="ml-1">(more available)</span>}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
                  <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
          >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          const pageNum = page as number
          const isCurrentPage = pageNum === currentPage
          
          return (
                      <Button
            key={pageNum}
            variant={isCurrentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            disabled={pageNum > maxPageWithData}
            className="h-8 w-8 p-0"
          >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Load more button for getting additional results */}
      {hasMoreResults && (
        <Button
          variant="outline"
          onClick={loadMoreResults}
          disabled={isLoadingMore}
          className="mt-2"
        >
          {isLoadingMore ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading more results...
            </>
          ) : (
            'Load more results'
          )}
        </Button>
      )}
    </div>
  )
}
