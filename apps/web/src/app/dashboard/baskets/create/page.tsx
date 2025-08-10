'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@basket-fi/ui';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Allocation {
  tokenAddress: string;
  targetPercentage: number;
}

export default function CreateBasketPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([
    { tokenAddress: '', targetPercentage: 0 }
  ]);

  const addAllocation = () => {
    setAllocations([...allocations, { tokenAddress: '', targetPercentage: 0 }]);
  };

  const removeAllocation = (index: number) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter((_, i) => i !== index));
    }
  };

  const updateAllocation = (index: number, field: keyof Allocation, value: string | number) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  const totalPercentage = allocations.reduce((sum, allocation) => sum + (allocation.targetPercentage || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement basket creation
    console.log('Creating basket:', { name, description, allocations });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Basket
          </h1>
          <p className="text-muted-foreground">
            Build your custom DeFi portfolio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Basket Name</Label>
              <Input
                id="name"
                placeholder="e.g., DeFi Blue Chips"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                placeholder="Describe your investment strategy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Token Allocations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Token Allocations
              <div className="text-sm font-normal">
                Total: {totalPercentage.toFixed(2)}%
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocations.map((allocation, index) => (
              <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label>Token Address</Label>
                  <Input
                    placeholder="0x..."
                    value={allocation.tokenAddress}
                    onChange={(e) => updateAllocation(index, 'tokenAddress', e.target.value)}
                    required
                  />
                </div>

                <div className="w-32">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    value={allocation.targetPercentage || ''}
                    onChange={(e) => updateAllocation(index, 'targetPercentage', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAllocation(index)}
                  disabled={allocations.length === 1}
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
              Add Token
            </Button>

            {totalPercentage !== 100 && totalPercentage > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Total allocation should equal 100%. Current total: {totalPercentage.toFixed(2)}%
                </p>
              </div>
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={totalPercentage !== 100 || !name.trim()}
          >
            Create Basket
          </Button>
        </div>
      </form>
    </div>
  );
}