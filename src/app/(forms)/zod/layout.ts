import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'React Zod Form',
  description: 'Formulário feito com o React Zustand-Zod Form',
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return children;
}