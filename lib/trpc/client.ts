import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@/app/api/trpc/lib/root'

export const api = createTRPCReact<AppRouter>()
