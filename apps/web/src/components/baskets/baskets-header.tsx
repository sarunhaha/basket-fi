'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@basket-fi/ui';
import { Plus, Search, Filter } from 'lucide-react';

export function BasketsHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  return (
    <div className="space-y-4">
      {/* Title and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Baskets
          </h1>
          <p className="text-muted-foreground">
            Manage your DeFi token portfolios
          </p>
        </div>
        <Button asChild>
          <Link href="/baskets/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Basket
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search baskets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              Most Recent
            </SelectItem>
            <SelectItem value="name">
              Name A-Z
            </SelectItem>
            <SelectItem value="value">
              Highest Value
            </SelectItem>
            <SelectItem value="performance">
              Best Performance
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filter */}
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Baskets
            </SelectItem>
            <SelectItem value="active">
              Active Only
            </SelectItem>
            <SelectItem value="public">
              Public Only
            </SelectItem>
            <SelectItem value="private">
              Private Only
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}