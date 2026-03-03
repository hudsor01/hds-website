import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/schemas/schema.ts',
	out: './drizzle',
	schemaFilter: ['public'],
	dbCredentials: {
		url: process.env.DATABASE_URL_UNPOOLED ?? ''
	}
})
