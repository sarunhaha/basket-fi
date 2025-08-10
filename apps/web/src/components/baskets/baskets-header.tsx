'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';

export function BasketsHeader() {
  const t = useTranslations('baskets');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  return (
    <div className="space-y-4">
      {/* Title and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title', { default: 'My Baskets' })}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle', { default: 'Manage your DeFi token portfolios' })}
          </p>
        </div>
        <Button asChild>
          <Link href="/baskets/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createBasket', { default: 'Create Basket' })}
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder', { default: 'Search baskets...' })}
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
              {t('sort.recent', { default: 'Most Recent' })}
            </SelectItem>
            <SelectItem value="name">
              {t('sort.name', { default: 'Name A-Z' })}
            </SelectItem>
            <SelectItem value="value">
              {t('sort.value', { default: 'Highest Value' })}
            </SelectItem>
            <SelectItem value="performance">
              {t('sort.performance', { default: 'Best Performance' })}
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
              {t('filter.all', { default: 'All Baskets' })}
            </SelectItem>
            <SelectItem value="active">
              {t('filter.active', { default: 'Active Only' })}
            </SelectItem>
            <SelectItem value="public">
              {t('filter.public', { default: 'Public Only' })}
            </SelectItem>
            <SelectItem value="private">
              {t('filter.private', { default: 'Private Only' })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}