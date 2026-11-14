/**
 * Dallas-Fort Worth service area: the cities the business serves in person,
 * starting with Lewisville, where it is based.
 */

import type { LocationData } from './types'

export const DFW_LOCATIONS: LocationData[] = [
	{
		slug: 'lewisville',
		city: 'Lewisville',
		state: 'Texas',
		stateCode: 'TX',
		tagline: 'Web Design for Lewisville Small Businesses',
		description:
			'Hudson Digital Solutions is based in Lewisville. I design and build fast, mobile-ready websites for the businesses around me, from Old Town to Castle Hills.',
		metaDescription:
			'Web design from a Lewisville, TX studio. I build fast, mobile-ready websites for Lewisville small businesses, set up to get found on Google.',
		neighborhoods: [
			'Old Town Lewisville',
			'Castle Hills',
			'Vista Ridge',
			'Lake Lewisville',
			'Flower Mound',
			'Highland Village',
			'The Colony',
			'Carrollton'
		],
		features: [
			{
				title: 'Local Business Websites',
				description:
					'I build fast, modern sites for Lewisville shops, contractors and service businesses that turn visitors into calls.'
			},
			{
				title: 'Booking and Payments',
				description:
					'I wire in online booking, deposits and follow-up so customers can book you without picking up the phone.'
			},
			{
				title: 'Local SEO Setup',
				description:
					'Every site I build is set up to get found on Google when Denton County customers search nearby.'
			}
		]
	},
	{
		slug: 'dallas',
		city: 'Dallas',
		state: 'Texas',
		stateCode: 'TX',
		tagline: 'Web Design for Dallas Small Businesses',
		description:
			'From Deep Ellum to Uptown, I design and build fast, mobile-ready websites that bring Dallas small businesses new customers and get them found on Google.',
		metaDescription:
			'I build websites for Dallas small businesses. Fast, mobile-ready sites for Deep Ellum boutiques and Uptown shops, set up to get found on Google.',
		neighborhoods: [
			'Downtown Dallas',
			'Uptown',
			'Deep Ellum',
			'Oak Lawn',
			'Highland Park',
			'Plano',
			'Irving',
			'Richardson'
		],
		features: [
			{
				title: 'E-Commerce Websites',
				description:
					'I build online stores for the Dallas market, from local boutiques to regional retailers.'
			},
			{
				title: 'Local Business Websites',
				description:
					'I build fast, modern sites that turn Dallas visitors into paying customers.'
			},
			{
				title: 'Local SEO Setup',
				description:
					'Every site I build is set up to get found on Google when North Texas customers search nearby.'
			}
		]
	},
	{
		slug: 'fort-worth',
		city: 'Fort Worth',
		state: 'Texas',
		stateCode: 'TX',
		tagline: 'Web Design for Fort Worth Small Businesses',
		description:
			'I pair Fort Worth traditional business values with modern web design, building mobile-ready websites that help Tarrant County small businesses grow.',
		metaDescription:
			'I build websites for Fort Worth small businesses. Mobile-ready sites for Stockyards retailers and Tarrant County family-owned companies that win customers.',
		neighborhoods: [
			'Downtown',
			'Sundance Square',
			'Near Southside',
			'Cultural District',
			'Stockyards',
			'Arlington',
			'Weatherford',
			'Keller'
		],
		features: [
			{
				title: 'Local Business Websites',
				description:
					'I build professional sites for Fort Worth small businesses and family-owned companies.'
			},
			{
				title: 'E-Commerce Websites',
				description:
					'I build online stores for Fort Worth retailers, from Western wear to artisan goods.'
			},
			{
				title: 'Website Redesigns',
				description:
					'I refresh dated sites for Fort Worth manufacturers and industrial companies.'
			}
		]
	},
	{
		slug: 'arlington',
		city: 'Arlington',
		state: 'Texas',
		stateCode: 'TX',
		tagline: 'Web Design for Arlington Small Businesses',
		description:
			'Home to AT&T Stadium and Globe Life Field, Arlington runs on entertainment and mid-cities businesses. I build them fast, mobile-ready websites.',
		metaDescription:
			'I build websites for Arlington small businesses. Mobile-ready sites for Entertainment District venues and DFW mid-cities service providers.',
		neighborhoods: [
			'Downtown Arlington',
			'Entertainment District',
			'Viridian',
			'Mansfield',
			'Grand Prairie',
			'Pantego',
			'Dalworthington Gardens',
			'Kennedale'
		],
		features: [
			{
				title: 'Entertainment Websites',
				description:
					'I build sites for Arlington entertainment venues and event companies, with booking forms built in.'
			},
			{
				title: 'Restaurant Websites',
				description:
					'I build mobile-ready sites with menus and contact forms for Arlington restaurants and hotels.'
			},
			{
				title: 'Small Business Websites',
				description:
					'I build affordable, high-quality sites for Arlington small businesses and service providers.'
			}
		]
	}
]
