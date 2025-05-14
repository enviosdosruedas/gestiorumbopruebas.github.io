// Address validation flow for address autocompletion and validation using Google Maps API.
'use server';

/**
 * @fileOverview Validates and autocompletes client addresses using the Google Maps API.
 *
 * - validateAndAutocompleteAddress - Validates an address exists within Mar del Plata, Argentina and provides auto-completion suggestions.
 * - ValidateAndAutocompleteAddressInput - The input type for the validateAndAutocompleteAddress function.
 * - ValidateAndAutocompleteAddressOutput - The return type for the validateAndAutocompleteAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAndAutocompleteAddressInputSchema = z.object({
  address: z.string().describe('The address to validate and autocomplete.'),
});
export type ValidateAndAutocompleteAddressInput = z.infer<typeof ValidateAndAutocompleteAddressInputSchema>;

const ValidateAndAutocompleteAddressOutputSchema = z.object({
  isValid: z.boolean().describe('Whether any valid Mar del Plata suggestions were found.'),
  suggestions: z.array(z.string()).describe('Auto-completion suggestions for the address.'),
});
export type ValidateAndAutocompleteAddressOutput = z.infer<typeof ValidateAndAutocompleteAddressOutputSchema>;

export async function validateAndAutocompleteAddress(
  input: ValidateAndAutocompleteAddressInput
): Promise<ValidateAndAutocompleteAddressOutput> {
  return validateAndAutocompleteAddressFlow(input);
}

const geocodeAddress = ai.defineTool(
  {
    name: 'geocodeAddress',
    description: 'Uses the Google Maps API to autocomplete an address in Mar del Plata, Argentina.',
    inputSchema: z.object({
      address: z.string().describe('The partial address to autocomplete.'),
    }),
    outputSchema: z.object({
      isValid: z.boolean().describe('Whether any valid Mar del Plata suggestions were found.'),
      suggestions: z.array(z.string()).describe('Auto-completion suggestions for the address.'),
    }),
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not set in environment variables.');
      return { isValid: false, suggestions: ['Error: API key para Google Maps no configurada.'] };
    }

    if (!input.address || input.address.trim().length < 3) {
      return { isValid: false, suggestions: [] };
    }

    const autocompleteUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    autocompleteUrl.searchParams.append('input', input.address);
    autocompleteUrl.searchParams.append('key', apiKey);
    autocompleteUrl.searchParams.append('components', 'country:AR'); // Restrict to Argentina
    autocompleteUrl.searchParams.append('locationbias', 'circle:20000@-38.0054771,-57.5426106'); // Bias towards Mar del Plata (approx. 20km radius)
    autocompleteUrl.searchParams.append('language', 'es'); // Prefer Spanish results

    try {
      const response = await fetch(autocompleteUrl.toString());
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Google Places API Autocomplete error: ${response.status} ${response.statusText}`, errorBody);
        return { isValid: false, suggestions: ['Error al obtener sugerencias.'] };
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API Autocomplete returned status:', data.status, data.error_message);
        return { isValid: false, suggestions: [data.error_message || 'Error desde la API de Google.'] };
      }

      const mdpSuggestions = (data.predictions || [])
        .filter((prediction: any) => 
          prediction.description && 
          (prediction.description.toLowerCase().includes('mar del plata') || 
           (prediction.terms && prediction.terms.some((term: any) => term.value.toLowerCase() === 'mar del plata')))
        )
        .map((prediction: any) => prediction.description);
      
      return {
        isValid: mdpSuggestions.length > 0,
        suggestions: mdpSuggestions.slice(0, 5), // Limit to 5 suggestions
      };

    } catch (error) {
      console.error('Error llamando a Google Places API Autocomplete:', error);
      return { isValid: false, suggestions: ['Error de red o problema con la API.'] };
    }
  }
);

const validateAndAutocompleteAddressPrompt = ai.definePrompt({
  name: 'validateAndAutocompleteAddressPrompt',
  tools: [geocodeAddress],
  input: {schema: ValidateAndAutocompleteAddressInputSchema},
  output: {schema: ValidateAndAutocompleteAddressOutputSchema},
  prompt: `The user is entering an address. Use the geocodeAddress tool to validate the address and provide autocompletion suggestions for addresses in Mar del Plata, Argentina. Return the suggestions to the user. Address: {{{address}}}`,
});

const validateAndAutocompleteAddressFlow = ai.defineFlow(
  {
    name: 'validateAndAutocompleteAddressFlow',
    inputSchema: ValidateAndAutocompleteAddressInputSchema,
    outputSchema: ValidateAndAutocompleteAddressOutputSchema,
  },
  async input => {
    const {output} = await validateAndAutocompleteAddressPrompt(input);
    return output!;
  }
);
