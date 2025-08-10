'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertCircle,
  Info
} from 'lucide-react';

// Form schema
const createBasketSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isPublic: z.boolean().default(false),
  allocations: z.array(z.object({
    tokenAddress: z.string().min(1, 'Token address is required'),
    targetPercentage: z.number().min(0.01, 'Minimum 0.01%').max(100, 'Maximum 100%'),
  })).min(1, 'At least one allocation is required'),
});

type CreateBasketForm = z.infer<typeof createBasketSchema>;

// Mock token data - in real app, this would come from API
const POPULAR_TOKENS = [
  {
    address: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
    symbol: 'USDC',
    name: 'USD Coin',
    logoUri: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoUri: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    logoUri: 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png',
  },
];

export default function CreateBasketPage() {
  const t = useTranslations('baskets.create');
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateBasketForm>({
    resolver: zodResolver(createBasketSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      allocations: [
        { tokenAddress: '', targetPercentage: 0 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'allocations',
  });

  const createBasketMutation = useMutation({
    mutationFn: (data: CreateBasketForm) => apiClient.createBasket(data),
    onSuccess: (basket) => {
      toast({
        title: t('success.title', { default: 'Basket created successfully' }),
        description: t('success.description', { default: 'Your new basket has been created' }),
      });
      queryClient.invalidateQueries({ queryKey: ['baskets'] });
      router.push(`/baskets/${basket.id}`);
    },
    onError: (error) => {
      toast({
        title: t('error.title', { default: 'Failed to create basket' }),
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateBasketForm) => {
    // Validate total percentage
    const totalPercentage = data.allocations.reduce((sum, allocation) => sum + allocation.targetPercentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      form.setError('allocations', {
        message: t('validation.totalPercentage', { 
          default: 'Total allocation must equal 100%',
          current: totalPercentage.toFixed(2)
        }),
      });
      return;
    }

    createBasketMutation.mutate(data);
  };

  const addAllocation = () => {
    append({ tokenAddress: '', targetPercentage: 0 });
  };

  const removeAllocation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const addPopularToken = (token: typeof POPULAR_TOKENS[0]) => {
    const existingIndex = fields.findIndex(field => 
      form.getValues(`allocations.${fields.indexOf(field)}.tokenAddress`) === token.address
    );
    
    if (existingIndex === -1) {
      append({ tokenAddress: token.address, targetPercentage: 0 });
    }
  };

  const totalPercentage = form.watch('allocations').reduce((sum, allocation) => sum + (allocation.targetPercentage || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title', { default: 'Create New Basket' })}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle', { default: 'Build your custom DeFi portfolio' })}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInfo.title', { default: 'Basic Information' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('basicInfo.name', { default: 'Basket Name' })}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('basicInfo.namePlaceholder', { default: 'e.g., DeFi Blue Chips' })}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('basicInfo.description', { default: 'Description' })}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('basicInfo.descriptionPlaceholder', { 
                          default: 'Describe your investment strategy...' 
                        })}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {t('basicInfo.descriptionHelp', { default: 'Optional. Help others understand your strategy.' })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('basicInfo.public', { default: 'Make Public' })}
                      </FormLabel>
                      <FormDescription>
                        {t('basicInfo.publicHelp', { 
                          default: 'Allow others to view and copy your basket' 
                        })}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Token Allocations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('allocations.title', { default: 'Token Allocations' })}
                <div className="text-sm font-normal">
                  {t('allocations.total', { default: 'Total' })}: {totalPercentage.toFixed(2)}%
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Popular Tokens */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t('allocations.popular', { default: 'Popular Tokens' })}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TOKENS.map((token) => (
                    <Button
                      key={token.address}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPopularToken(token)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {token.symbol}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Allocation Fields */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end space-x-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`allocations.${index}.tokenAddress`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            {t('allocations.tokenAddress', { default: 'Token Address' })}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0x..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`allocations.${index}.targetPercentage`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>
                            {t('allocations.percentage', { default: 'Percentage' })}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAllocation(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove allocation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllocation}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('allocations.addToken', { default: 'Add Token' })}
                </Button>
              </div>

              {/* Validation Messages */}
              {form.formState.errors.allocations && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.allocations.message}
                  </AlertDescription>
                </Alert>
              )}

              {totalPercentage !== 100 && totalPercentage > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {t('allocations.warning', { 
                      default: 'Total allocation should equal 100%. Current total: {total}%',
                      total: totalPercentage.toFixed(2)
                    })}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t('actions.cancel', { default: 'Cancel' })}
            </Button>
            <Button
              type="submit"
              disabled={createBasketMutation.isPending || totalPercentage !== 100}
            >
              {createBasketMutation.isPending
                ? t('actions.creating', { default: 'Creating...' })
                : t('actions.create', { default: 'Create Basket' })
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}