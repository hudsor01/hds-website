/**
 * Location Data Tests
 * Tests location data functions and LocalBusiness schema generation
 */
import { describe, expect, test } from 'bun:test';
import {
  getAllLocationSlugs,
  getLocationBySlug,
  generateLocalBusinessSchema,
  LOCATIONS,
} from '@/lib/locations';

describe('Location Data', () => {
  describe('LOCATIONS', () => {
    test('contains 75 locations across multiple states', () => {
      expect(LOCATIONS).toHaveLength(75);
    });

    test('each location has required fields', () => {
      for (const location of LOCATIONS) {
        expect(location.slug).toBeTruthy();
        expect(location.city).toBeTruthy();
        expect(location.state).toBeTruthy();
        expect(location.stateCode).toBeTruthy();
        expect(location.tagline).toBeTruthy();
        expect(location.description).toBeTruthy();
        expect(location.metaDescription).toBeTruthy();
        expect(location.neighborhoods.length).toBeGreaterThan(0);
        expect(location.stats).toBeDefined();
        expect(location.features.length).toBeGreaterThan(0);
      }
    });

    test('all slugs are unique', () => {
      const slugs = LOCATIONS.map((l) => l.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe('getAllLocationSlugs', () => {
    test('returns all location slugs', () => {
      const slugs = getAllLocationSlugs();
      expect(slugs).toHaveLength(75);
      // Texas cities
      expect(slugs).toContain('dallas');
      expect(slugs).toContain('houston');
      expect(slugs).toContain('austin');
      expect(slugs).toContain('san-antonio');
      expect(slugs).toContain('fort-worth');
      expect(slugs).toContain('el-paso');
      expect(slugs).toContain('arlington');
      expect(slugs).toContain('corpus-christi');
      // Louisiana
      expect(slugs).toContain('baton-rouge');
      expect(slugs).toContain('new-orleans');
      expect(slugs).toContain('shreveport');
      expect(slugs).toContain('lafayette');
      expect(slugs).toContain('lake-charles');
      expect(slugs).toContain('monroe');
      expect(slugs).toContain('alexandria');
      // Oklahoma
      expect(slugs).toContain('oklahoma-city');
      expect(slugs).toContain('tulsa');
      expect(slugs).toContain('norman');
      expect(slugs).toContain('broken-arrow');
      expect(slugs).toContain('edmond');
      expect(slugs).toContain('lawton');
      expect(slugs).toContain('stillwater');
      // Arizona
      expect(slugs).toContain('phoenix');
      expect(slugs).toContain('tucson');
      expect(slugs).toContain('mesa');
      expect(slugs).toContain('scottsdale');
      expect(slugs).toContain('chandler');
      expect(slugs).toContain('flagstaff');
      expect(slugs).toContain('tempe');
      // New Mexico
      expect(slugs).toContain('santa-fe');
      expect(slugs).toContain('albuquerque');
      expect(slugs).toContain('las-cruces');
      expect(slugs).toContain('rio-rancho');
      expect(slugs).toContain('roswell');
      expect(slugs).toContain('farmington');
      // Arkansas
      expect(slugs).toContain('little-rock');
      expect(slugs).toContain('fort-smith');
      expect(slugs).toContain('fayetteville');
      expect(slugs).toContain('springdale');
      expect(slugs).toContain('jonesboro');
      expect(slugs).toContain('bentonville');
      expect(slugs).toContain('hot-springs');
      // Georgia
      expect(slugs).toContain('atlanta');
      expect(slugs).toContain('savannah');
      expect(slugs).toContain('augusta');
      expect(slugs).toContain('columbus-ga');
      expect(slugs).toContain('macon');
      expect(slugs).toContain('athens');
      // Colorado
      expect(slugs).toContain('denver');
      expect(slugs).toContain('colorado-springs');
      expect(slugs).toContain('fort-collins');
      expect(slugs).toContain('boulder');
      expect(slugs).toContain('pueblo');
      expect(slugs).toContain('aurora');
      // Tennessee
      expect(slugs).toContain('nashville');
      expect(slugs).toContain('memphis');
      expect(slugs).toContain('knoxville');
      expect(slugs).toContain('chattanooga');
      expect(slugs).toContain('clarksville');
      expect(slugs).toContain('murfreesboro');
      // North Carolina
      expect(slugs).toContain('charlotte');
      expect(slugs).toContain('raleigh');
      expect(slugs).toContain('greensboro');
      expect(slugs).toContain('durham');
      expect(slugs).toContain('winston-salem');
      expect(slugs).toContain('wilmington');
      expect(slugs).toContain('asheville');
      expect(slugs).toContain('fayetteville-nc');
      // Florida
      expect(slugs).toContain('miami');
      expect(slugs).toContain('tallahassee');
      expect(slugs).toContain('jacksonville');
      expect(slugs).toContain('tampa');
      expect(slugs).toContain('orlando');
      expect(slugs).toContain('st-petersburg');
      expect(slugs).toContain('fort-lauderdale');
    });
  });

  describe('getLocationBySlug', () => {
    test('returns location data for valid slug', () => {
      const location = getLocationBySlug('dallas');

      expect(location).toBeDefined();
      expect(location?.city).toBe('Dallas');
      expect(location?.stateCode).toBe('TX');
      expect(location?.neighborhoods).toContain('Downtown Dallas');
    });

    test('returns undefined for invalid slug', () => {
      const location = getLocationBySlug('nonexistent');
      expect(location).toBeUndefined();
    });

    test('returns correct data for representative cities', () => {
      const expectedCityNames: Record<string, string> = {
        // Texas
        dallas: 'Dallas',
        houston: 'Houston',
        austin: 'Austin',
        'san-antonio': 'San Antonio',
        'fort-worth': 'Fort Worth',
        'el-paso': 'El Paso',
        arlington: 'Arlington',
        'corpus-christi': 'Corpus Christi',
        // Louisiana
        'baton-rouge': 'Baton Rouge',
        'new-orleans': 'New Orleans',
        lafayette: 'Lafayette',
        // Oklahoma
        'oklahoma-city': 'Oklahoma City',
        tulsa: 'Tulsa',
        // Arizona
        phoenix: 'Phoenix',
        tucson: 'Tucson',
        scottsdale: 'Scottsdale',
        // New Mexico
        'santa-fe': 'Santa Fe',
        albuquerque: 'Albuquerque',
        // Arkansas
        'little-rock': 'Little Rock',
        fayetteville: 'Fayetteville',
        bentonville: 'Bentonville',
        // Georgia
        atlanta: 'Atlanta',
        savannah: 'Savannah',
        // Colorado
        denver: 'Denver',
        'colorado-springs': 'Colorado Springs',
        boulder: 'Boulder',
        // Tennessee
        nashville: 'Nashville',
        memphis: 'Memphis',
        chattanooga: 'Chattanooga',
        // North Carolina
        charlotte: 'Charlotte',
        raleigh: 'Raleigh',
        durham: 'Durham',
        // Florida
        miami: 'Miami',
        tampa: 'Tampa',
        orlando: 'Orlando',
      };

      for (const [slug, cityName] of Object.entries(expectedCityNames)) {
        const location = getLocationBySlug(slug);
        expect(location?.city).toBe(cityName);
      }
    });

    test('includes locations from all 11 states', () => {
      const states = new Set(LOCATIONS.map((l) => l.stateCode));
      expect(states.size).toBe(11);
      expect(states.has('TX')).toBe(true);
      expect(states.has('LA')).toBe(true);
      expect(states.has('OK')).toBe(true);
      expect(states.has('AZ')).toBe(true);
      expect(states.has('NM')).toBe(true);
      expect(states.has('AR')).toBe(true);
      expect(states.has('GA')).toBe(true);
      expect(states.has('CO')).toBe(true);
      expect(states.has('TN')).toBe(true);
      expect(states.has('NC')).toBe(true);
      expect(states.has('FL')).toBe(true);
    });
  });

  describe('generateLocalBusinessSchema', () => {
    test('generates valid LocalBusiness schema', () => {
      const location = getLocationBySlug('dallas');
      if (!location) {
        throw new Error('Dallas location not found');
      }

      const schema = generateLocalBusinessSchema(location);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.name).toBe('Hudson Digital Solutions');
      expect(schema.url).toBe('https://hudsondigitalsolutions.com/locations/dallas');
    });

    test('includes correct address structure', () => {
      const location = getLocationBySlug('houston');
      if (!location) {
        throw new Error('Houston location not found');
      }

      const schema = generateLocalBusinessSchema(location);
      const address = schema.address as Record<string, string>;

      expect(address['@type']).toBe('PostalAddress');
      expect(address.addressLocality).toBe('Houston');
      expect(address.addressRegion).toBe('TX');
      expect(address.addressCountry).toBe('US');
    });

    test('maps neighborhoods to areaServed', () => {
      const location = getLocationBySlug('austin');
      if (!location) {
        throw new Error('Austin location not found');
      }

      const schema = generateLocalBusinessSchema(location);
      const areas = schema.areaServed as Array<Record<string, string>>;

      expect(areas.length).toBe(location.neighborhoods.length);
      expect(areas[0]?.['@type']).toBe('City');
      // Each neighborhood should be mapped to a City entry
      for (let i = 0; i < location.neighborhoods.length; i++) {
        expect(areas[i]?.name).toBe(location.neighborhoods[i]);
      }
    });

    test('includes social media links', () => {
      const location = getLocationBySlug('dallas');
      if (!location) {
        throw new Error('Dallas location not found');
      }

      const schema = generateLocalBusinessSchema(location);
      const sameAs = schema.sameAs as string[];

      expect(sameAs).toBeInstanceOf(Array);
      expect(sameAs.length).toBeGreaterThan(0);
    });
  });
});
