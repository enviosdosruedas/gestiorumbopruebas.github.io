'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Loader2, Check } from 'lucide-react';
import { validateAndAutocompleteAddress, type ValidateAndAutocompleteAddressOutput } from '@/ai/flows/address-validation';
import { cn } from '@/lib/utils';

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressValidated?: (isValid: boolean, validatedAddress?: string) => void;
  className?: string;
}

// Basic debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}


export function AddressAutocompleteInput({ value, onChange, onAddressValidated, className }: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const fetchSuggestions = useCallback(async (address: string) => {
    if (!address || address.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const result: ValidateAndAutocompleteAddressOutput = await validateAndAutocompleteAddress({ address });
      setSuggestions(result.suggestions || []);
      if (onAddressValidated) {
         onAddressValidated(result.isValid, result.isValid ? result.suggestions[0] : undefined);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [onAddressValidated]);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 500), [fetchSuggestions]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update form state immediately for typing
    if (newValue.length > 2) {
      setIsPopoverOpen(true);
      debouncedFetchSuggestions(newValue);
    } else {
      setIsPopoverOpen(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion); // Update form state with selected suggestion
    setIsPopoverOpen(false);
    setSuggestions([]); // Clear suggestions after selection
     if (onAddressValidated) {
        // We might need to re-validate the selected full address if the AI flow returns multiple suggestions
        // For now, assume the first suggestion from validateAndAutocompleteAddress is good enough
        // Or, we can rely on the final server-side validation
        fetchSuggestions(suggestion); // This will call onAddressValidated
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild className={cn(className)}>
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter address for validation"
            className="w-full"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Searching..." className="h-9" disabled={isLoading} />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading..." : (inputValue.length > 2 ? "No suggestions found." : "Type more to see suggestions.")}</CommandEmpty>
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                value={suggestion}
                onSelect={() => handleSuggestionSelect(suggestion)}
                className="flex items-center justify-between"
              >
                <span>{suggestion}</span>
                {/* Optional: Show a check if it's the currently selected value */}
                {/* {inputValue === suggestion && <Check className="ml-2 h-4 w-4" />} */}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
