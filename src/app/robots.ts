import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = 'https://hudsondigitalsolutions.com'

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/_next/',
					'/private/',
					'/temp/',
					'/backup/'
				]
			}
		],
		sitemap: `${baseUrl}/sitemap.xml`
	}
}
